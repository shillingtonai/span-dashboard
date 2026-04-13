import { fetchGA4Data } from '@/lib/ga4'
import { DateRange } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') ?? '30') as DateRange

    const data = await fetchGA4Data(range)

    return Response.json({ data, lastUpdated: new Date().toISOString() })
  } catch (error) {
    console.error('[GA4] fetch error:', error)
    return Response.json({ error: 'Failed to fetch GA4 data', data: null }, { status: 500 })
  }
}
