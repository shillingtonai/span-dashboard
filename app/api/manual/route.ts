import { sql, ensureSchema } from '@/lib/db'
import { ManualData, ManualEntry, DateRange } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') ?? '30') as DateRange
    const days = parseInt(range, 10)

    await ensureSchema()

    const { rows: currentRows } = await sql<ManualEntry>`
      SELECT * FROM manual_entries
      WHERE entry_date >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      ORDER BY entry_date DESC
    `

    const { rows: prevRows } = await sql<ManualEntry>`
      SELECT * FROM manual_entries
      WHERE entry_date >= CURRENT_DATE - INTERVAL '1 day' * ${days * 2}
        AND entry_date < CURRENT_DATE - INTERVAL '1 day' * ${days}
      ORDER BY entry_date DESC
    `

    const totalInquiries = currentRows.reduce((s, r) => s + r.installer_inquiries, 0)
    const totalInquiriesPrev = prevRows.reduce((s, r) => s + r.installer_inquiries, 0)

    const surveyTotals = {
      social: currentRows.reduce((s, r) => s + r.survey_social, 0),
      google: currentRows.reduce((s, r) => s + r.survey_google, 0),
      wordOfMouth: currentRows.reduce((s, r) => s + r.survey_word_of_mouth, 0),
      installerReferral: currentRows.reduce((s, r) => s + r.survey_installer_referral, 0),
      other: currentRows.reduce((s, r) => s + r.survey_other, 0),
    }

    const data: ManualData = {
      entries: currentRows,
      totalInquiries,
      totalInquiriesPrev,
      surveyTotals,
    }

    return Response.json({ data, lastUpdated: new Date().toISOString() })
  } catch (error) {
    console.error('[MANUAL] fetch error:', error)
    return Response.json({ error: 'Failed to fetch manual data', data: null }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureSchema()
    const body = await request.json()

    const {
      entry_date,
      installer_inquiries = 0,
      survey_social = 0,
      survey_google = 0,
      survey_word_of_mouth = 0,
      survey_installer_referral = 0,
      survey_other = 0,
      notes = null,
    } = body as Partial<ManualEntry>

    if (!entry_date) {
      return Response.json({ error: 'entry_date is required' }, { status: 400 })
    }

    const { rows } = await sql<ManualEntry>`
      INSERT INTO manual_entries (
        entry_date, installer_inquiries, survey_social, survey_google,
        survey_word_of_mouth, survey_installer_referral, survey_other, notes
      ) VALUES (
        ${entry_date}, ${installer_inquiries}, ${survey_social}, ${survey_google},
        ${survey_word_of_mouth}, ${survey_installer_referral}, ${survey_other}, ${notes}
      )
      RETURNING *
    `

    return Response.json({ data: rows[0] }, { status: 201 })
  } catch (error) {
    console.error('[MANUAL] post error:', error)
    return Response.json({ error: 'Failed to save entry', data: null }, { status: 500 })
  }
}
