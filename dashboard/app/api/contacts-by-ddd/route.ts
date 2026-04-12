import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locationId = searchParams.get('location')

  const supabase = createServerSupabaseClient()

  // Sem filtro: usa a view que já agrega tudo
  if (!locationId) {
    const { data, error } = await supabase
      .from('v_contacts_by_ddd')
      .select('ddd, contact_count')
      .order('contact_count', { ascending: false })
      .limit(20)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Com filtro: agrega direto das conversations
  const { data, error } = await supabase
    .from('conversations')
    .select('contact_phone, contact_id')
    .eq('location_id', locationId)
    .not('contact_phone', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const byDDD: Record<string, Set<string>> = {}
  for (const row of data ?? []) {
    const phone = row.contact_phone ?? ''
    let ddd = 'Outro'
    if (/^\+55\d{10,11}$/.test(phone))     ddd = phone.slice(3, 5)
    else if (/^55\d{10,11}$/.test(phone))  ddd = phone.slice(2, 4)
    else if (/^\d{10,11}$/.test(phone))    ddd = phone.slice(0, 2)
    if (!byDDD[ddd]) byDDD[ddd] = new Set()
    if (row.contact_id) byDDD[ddd].add(row.contact_id)
  }

  return NextResponse.json(
    Object.entries(byDDD)
      .map(([ddd, set]) => ({ ddd, contact_count: set.size }))
      .sort((a, b) => b.contact_count - a.contact_count)
      .slice(0, 20)
  )
}
