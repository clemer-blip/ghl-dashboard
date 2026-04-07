import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '50', 10)
  const onlyEvaluated = searchParams.get('evaluated') === 'true'

  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('v_evaluations')
    .select(
      'id, contact_name, contact_phone, channel, status, ai_evaluation, ai_evaluated_at, last_message_at, first_response_seconds, message_count'
    )
    .order('last_message_at', { ascending: false })
    .limit(limit)

  if (onlyEvaluated) {
    query = query.not('ai_evaluation', 'is', null)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
