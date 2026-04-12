import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locationId = searchParams.get('location')

  const supabase = createServerSupabaseClient()

  // Sem filtro: usa a view que já agrega tudo
  if (!locationId) {
    const { data, error } = await supabase
      .from('v_contacts_by_channel')
      .select('channel, contact_count, conversation_count')
      .order('contact_count', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Com filtro: agrega direto das conversations
  const { data, error } = await supabase
    .from('conversations')
    .select('channel, contact_id')
    .eq('location_id', locationId)
    .not('channel', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const byChannel: Record<string, { channel: string; contact_count: number; conversation_count: number }> = {}
  const contactSets: Record<string, Set<string>> = {}
  for (const row of data ?? []) {
    const key = row.channel
    if (!byChannel[key]) { byChannel[key] = { channel: key, contact_count: 0, conversation_count: 0 }; contactSets[key] = new Set() }
    if (row.contact_id) contactSets[key].add(row.contact_id)
    byChannel[key].conversation_count += 1
  }
  for (const key of Object.keys(byChannel)) {
    byChannel[key].contact_count = contactSets[key].size
  }

  return NextResponse.json(Object.values(byChannel).sort((a, b) => b.contact_count - a.contact_count))
}
