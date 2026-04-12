import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerSupabaseClient()

  // Agrega direto da tabela conversations — não depende da view v_locations
  const { data, error } = await supabase
    .from('conversations')
    .select('location_id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Conta por location_id no JS
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.location_id] = (counts[row.location_id] ?? 0) + 1
  }

  const result = Object.entries(counts)
    .map(([location_id, total_conversations]) => ({ location_id, total_conversations }))
    .sort((a, b) => b.total_conversations - a.total_conversations)

  return NextResponse.json(result)
}
