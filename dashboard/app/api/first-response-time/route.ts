import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locationId = searchParams.get('location')
  const startParam = searchParams.get('start')
  const endParam = searchParams.get('end')
  const days = parseInt(searchParams.get('days') ?? '30', 10)

  const since = startParam ?? new Date(Date.now() - days * 86_400_000).toISOString()
  const until = endParam ? new Date(endParam + 'T23:59:59Z').toISOString() : null

  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('v_human_response_time_per_day')
    .select('day, avg_response_seconds, p50_response_seconds, p95_response_seconds, total_conversations, location_id')
    .gte('day', since)
    .order('day', { ascending: true })

  if (until) query = query.lte('day', until)
  if (locationId) query = query.eq('location_id', locationId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
