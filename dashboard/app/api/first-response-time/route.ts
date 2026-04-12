import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') ?? '30', 10)
  const locationId = searchParams.get('location')

  const supabase = createServerSupabaseClient()
  const since = new Date(Date.now() - days * 86_400_000).toISOString()

  let query = supabase
    .from('v_response_time_per_day')
    .select('day, avg_response_seconds, p50_response_seconds, p95_response_seconds, total_conversations, location_id')
    .gte('day', since)
    .order('day', { ascending: true })

  if (locationId) query = query.eq('location_id', locationId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Agrega por dia com média ponderada pelo total de conversas
  if (!locationId) {
    const byDay: Record<string, { day: string; avg_response_seconds: number; p50_response_seconds: number; p95_response_seconds: number; total_conversations: number; _weighted_sum: number }> = {}
    for (const row of data ?? []) {
      if (!byDay[row.day]) byDay[row.day] = { day: row.day, avg_response_seconds: 0, p50_response_seconds: 0, p95_response_seconds: 0, total_conversations: 0, _weighted_sum: 0 }
      const total = row.total_conversations ?? 0
      byDay[row.day].total_conversations += total
      byDay[row.day]._weighted_sum       += (row.avg_response_seconds ?? 0) * total
      // p50/p95: usa o maior entre as locations (proxy conservador)
      byDay[row.day].p50_response_seconds = Math.max(byDay[row.day].p50_response_seconds, row.p50_response_seconds ?? 0)
      byDay[row.day].p95_response_seconds = Math.max(byDay[row.day].p95_response_seconds, row.p95_response_seconds ?? 0)
    }
    return NextResponse.json(
      Object.values(byDay)
        .map(({ _weighted_sum, ...r }) => ({
          ...r,
          avg_response_seconds: r.total_conversations > 0 ? Math.round(_weighted_sum / r.total_conversations) : 0,
        }))
        .sort((a, b) => a.day.localeCompare(b.day))
    )
  }

  return NextResponse.json(data)
}
