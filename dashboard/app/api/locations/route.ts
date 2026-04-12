import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerSupabaseClient()

  // ingestion_state tem exatamente 1 linha por location sincronizada
  const { data, error } = await supabase
    .from('ingestion_state')
    .select('location_id, conversations_synced, last_synced_at')
    .order('conversations_synced', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(
    (data ?? []).map((r) => ({
      location_id: r.location_id,
      total_conversations: r.conversations_synced ?? 0,
    }))
  )
}
