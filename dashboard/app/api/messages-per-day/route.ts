import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') ?? '30', 10)
  const locationId = searchParams.get('location')

  const supabase = createServerSupabaseClient()
  const since = new Date(Date.now() - days * 86_400_000).toISOString()

  let query = supabase
    .from('v_messages_per_day')
    .select('day, total_messages, inbound_count, outbound_count')
    .gte('day', since)
    .order('day', { ascending: true })

  if (locationId) query = query.eq('location_id', locationId)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
