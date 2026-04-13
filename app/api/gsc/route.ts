import { fetchGSCData } from '@/lib/gsc'
import { DateRange } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') ?? '30') as DateRange

    const data = await fetchGSCData(range)

    return Response.json({ data, lastUpdated: new Date().toISOString() })
  } catch (error) {
    console.error('[GSC] fetch error:', error)
    return Response.json({ error: 'Failed to fetch GSC data', data: null }, { status: 500 })
  }
}
