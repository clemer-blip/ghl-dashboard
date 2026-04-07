import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locationId = searchParams.get('location')

  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('v_contacts_by_channel')
    .select('channel, contact_count, conversation_count')
    .order('contact_count', { ascending: false })

  if (locationId) query = query.eq('location_id', locationId)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
