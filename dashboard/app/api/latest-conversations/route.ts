import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locationId = searchParams.get('location')
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)

  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('conversations')
    .select('id, contact_name, contact_phone, channel, status, last_message_at, last_message_body, first_response_seconds')
    .order('last_message_at', { ascending: false })
    .limit(limit)

  if (locationId) query = query.eq('location_id', locationId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
