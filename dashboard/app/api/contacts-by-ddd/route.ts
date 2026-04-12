import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locationId = searchParams.get('location')

  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('v_contacts_by_ddd')
    .select('ddd, contact_count, location_id')
    .order('contact_count', { ascending: false })
    .limit(40)

  if (locationId) query = query.eq('location_id', locationId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!locationId) {
    const byDDD: Record<string, { ddd: string; contact_count: number }> = {}
    for (const row of data ?? []) {
      const key = row.ddd ?? 'Outro'
      if (!byDDD[key]) byDDD[key] = { ddd: key, contact_count: 0 }
      byDDD[key].contact_count += row.contact_count ?? 0
    }
    return NextResponse.json(
      Object.values(byDDD)
        .sort((a, b) => b.contact_count - a.contact_count)
        .slice(0, 20)
    )
  }

  return NextResponse.json(data)
}
