import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const locationId = searchParams.get('location')

  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('v_contacts_by_tag')
    .select('tag, contact_count, conversation_count, location_id')
    .order('contact_count', { ascending: false })

  if (locationId) query = query.eq('location_id', locationId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!locationId) {
    const byTag: Record<string, { tag: string; contact_count: number; conversation_count: number }> = {}
    for (const row of data ?? []) {
      const key = row.tag
      if (!byTag[key]) byTag[key] = { tag: key, contact_count: 0, conversation_count: 0 }
      byTag[key].contact_count      += row.contact_count      ?? 0
      byTag[key].conversation_count += row.conversation_count ?? 0
    }
    return NextResponse.json(
      Object.values(byTag)
        .sort((a, b) => b.contact_count - a.contact_count)
        .slice(0, limit)
    )
  }

  return NextResponse.json(data.slice(0, limit))
}
