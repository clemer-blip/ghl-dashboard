import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locationId = searchParams.get('location')
  const startParam = searchParams.get('start')
  const endParam   = searchParams.get('end')
  const days       = parseInt(searchParams.get('days') ?? '30', 10)

  const since = startParam ?? new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)
  const until = endParam ?? null

  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('meta_daily_insights')
    .select('date, location_id, spend, impressions, reach, clicks, conversations_started')
    .gte('date', since)
    .order('date', { ascending: true })

  if (until)      query = query.lte('date', until)
  if (locationId) query = query.eq('location_id', locationId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
