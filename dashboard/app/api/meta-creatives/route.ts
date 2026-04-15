import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locationId  = searchParams.get('location')
  const startParam  = searchParams.get('start')
  const endParam    = searchParams.get('end')
  const days        = parseInt(searchParams.get('days') ?? '30', 10)

  const since = startParam ?? new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)
  const until = endParam   ?? new Date().toISOString().slice(0, 10)

  const supabase = createServerSupabaseClient()

  // Busca insights diários no período
  let insightQuery = supabase
    .from('meta_ad_insights')
    .select('ad_id, location_id, spend, impressions, reach, inline_link_clicks, video_3sec_watched, video_p75_watched')
    .gte('date', since)
    .lte('date', until)

  if (locationId) insightQuery = insightQuery.eq('location_id', locationId)

  const { data: insightRows, error: insightError } = await insightQuery
  if (insightError) return NextResponse.json({ error: insightError.message }, { status: 500 })

  if (!insightRows || insightRows.length === 0) {
    return NextResponse.json([])
  }

  // Busca catálogo de criativos para os ads encontrados
  const adIds = [...new Set(insightRows.map((r) => r.ad_id))]
  const { data: creatives, error: creativeError } = await supabase
    .from('meta_ad_creatives')
    .select('ad_id, ad_name, campaign_name, adset_name, thumbnail_url, video_url')
    .in('ad_id', adIds)

  if (creativeError) return NextResponse.json({ error: creativeError.message }, { status: 500 })

  const creativeMap = new Map((creatives ?? []).map((c) => [c.ad_id, c]))

  // Agrega métricas por ad_id
  type AdAgg = {
    ad_id: string
    location_id: string
    spend: number
    impressions: number
    reach: number
    inline_link_clicks: number
    video_3sec_watched: number
    video_p75_watched: number
  }
  const byAd = new Map<string, AdAgg>()

  for (const row of insightRows) {
    const key = row.ad_id
    if (!byAd.has(key)) {
      byAd.set(key, {
        ad_id:              row.ad_id,
        location_id:        row.location_id,
        spend:              0,
        impressions:        0,
        reach:              0,
        inline_link_clicks: 0,
        video_3sec_watched: 0,
        video_p75_watched:  0,
      })
    }
    const agg = byAd.get(key)!
    agg.spend              += row.spend              ?? 0
    agg.impressions        += row.impressions        ?? 0
    agg.reach              += row.reach              ?? 0
    agg.inline_link_clicks += row.inline_link_clicks ?? 0
    agg.video_3sec_watched += row.video_3sec_watched ?? 0
    agg.video_p75_watched  += row.video_p75_watched  ?? 0
  }

  // Calcula as três métricas principais e une com dados do criativo
  const result = [...byAd.values()].map((agg) => {
    const creative   = creativeMap.get(agg.ad_id)
    const imp        = agg.impressions
    const hook_rate  = imp > 0 ? (agg.video_3sec_watched / imp) * 100 : 0
    const view_75    = imp > 0 ? (agg.video_p75_watched  / imp) * 100 : 0
    const ctr        = imp > 0 ? (agg.inline_link_clicks / imp) * 100 : 0

    return {
      ad_id:          agg.ad_id,
      ad_name:        creative?.ad_name       ?? agg.ad_id,
      campaign_name:  creative?.campaign_name  ?? null,
      adset_name:     creative?.adset_name     ?? null,
      thumbnail_url:  creative?.thumbnail_url  ?? null,
      video_url:      creative?.video_url      ?? null,
      location_id:    agg.location_id,
      spend:          agg.spend,
      impressions:    agg.impressions,
      reach:          agg.reach,
      inline_link_clicks: agg.inline_link_clicks,
      video_3sec_watched: agg.video_3sec_watched,
      video_p75_watched:  agg.video_p75_watched,
      hook_rate:      Math.round(hook_rate * 100) / 100,
      view_75:        Math.round(view_75   * 100) / 100,
      ctr:            Math.round(ctr       * 100) / 100,
    }
  }).sort((a, b) => b.spend - a.spend)

  return NextResponse.json(result)
}
