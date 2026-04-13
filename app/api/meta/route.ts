import { fetchMetaData } from '@/lib/meta'
import { DateRange } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') ?? '30') as DateRange

    const data = await fetchMetaData(range)

    return Response.json({ data, lastUpdated: new Date().toISOString() })
  } catch (error) {
    console.error('[META] fetch error:', error)
    return Response.json({ error: 'Failed to fetch Meta data', data: null }, { status: 500 })
  }
}
