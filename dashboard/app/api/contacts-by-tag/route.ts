import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const locationId = searchParams.get('location')

  const supabase = createServerSupabaseClient()

  // Sem filtro: usa a view que já agrega tudo
  if (!locationId) {
    const { data, error } = await supabase
      .from('v_contacts_by_tag')
      .select('tag, contact_count, conversation_count')
      .order('contact_count', { ascending: false })
      .limit(limit)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Com filtro: agrega direto das conversations
  const { data, error } = await supabase
    .from('conversations')
    .select('tags, contact_id')
    .eq('location_id', locationId)
    .not('tags', 'eq', '{}')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const byTag: Record<string, { tag: string; contact_count: number; conversation_count: number }> = {}
  const contactSets: Record<string, Set<string>> = {}
  for (const row of data ?? []) {
    for (const tag of row.tags ?? []) {
      if (!byTag[tag]) { byTag[tag] = { tag, contact_count: 0, conversation_count: 0 }; contactSets[tag] = new Set() }
      if (row.contact_id) contactSets[tag].add(row.contact_id)
      byTag[tag].conversation_count += 1
    }
  }
  for (const tag of Object.keys(byTag)) {
    byTag[tag].contact_count = contactSets[tag].size
  }

  return NextResponse.json(
    Object.values(byTag)
      .sort((a, b) => b.contact_count - a.contact_count)
      .slice(0, limit)
  )
}
