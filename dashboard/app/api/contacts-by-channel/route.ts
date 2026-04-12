import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locationId = searchParams.get('location')

  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('v_contacts_by_channel')
    .select('channel, contact_count, conversation_count, location_id')
    .order('contact_count', { ascending: false })

  if (locationId) query = query.eq('location_id', locationId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!locationId) {
    const byChannel: Record<string, { channel: string; contact_count: number; conversation_count: number }> = {}
    for (const row of data ?? []) {
      const key = row.channel ?? 'Desconhecido'
      if (!byChannel[key]) byChannel[key] = { channel: key, contact_count: 0, conversation_count: 0 }
      byChannel[key].contact_count      += row.contact_count      ?? 0
      byChannel[key].conversation_count += row.conversation_count ?? 0
    }
    return NextResponse.json(Object.values(byChannel).sort((a, b) => b.contact_count - a.contact_count))
  }

  return NextResponse.json(data)
}
