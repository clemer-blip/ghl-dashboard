import { createServerClient } from '@supabase/ssr'

export function createServerSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}

// Types matching the Supabase schema
export type MessagesPerDayRow = {
  day: string
  total_messages: number
  inbound_count: number
  outbound_count: number
  location_id?: string
}

export type FirstResponseStatsRow = {
  day: string
  total_conversations: number
  avg_response_seconds: number
  p50_response_seconds: number
  p95_response_seconds: number
  location_id?: string | null
}

export type EvaluationRow = {
  id: string
  contact_name: string | null
  contact_phone: string | null
  channel: string | null
  status: string | null
  ai_evaluation: string | null
  ai_evaluated_at: string | null
  last_message_at: string | null
  first_response_seconds: number | null
  message_count: number
}

export type ContactsByChannelRow = {
  channel: string
  contact_count: number
  conversation_count: number
}

export type ContactsByTagRow = {
  tag: string
  contact_count: number
  conversation_count: number
}

export type NewContactsPerDayRow = {
  day: string
  new_contacts: number
  location_id: string
}

export type LocationRow = {
  location_id: string
  total_contacts: number
  total_conversations: number
  last_activity: string
}

export type ContactsByDDDRow = {
  ddd: string
  contact_count: number
  location_id: string
}

export type UniqueContactsPerDayRow = {
  day: string
  unique_contacts: number
  location_id: string
}

export type MetaInsightRow = {
  date: string
  location_id: string
  spend: number
  impressions: number
  reach: number
  clicks: number
  conversations_started: number
}

export type LatestConversationRow = {
  id: string
  contact_name: string | null
  contact_phone: string | null
  channel: string | null
  status: string | null
  last_message_at: string | null
  last_message_body: string | null
  first_response_seconds: number | null
}

export type MetaAdCreativeRow = {
  ad_id: string
  ad_name: string | null
  account_id: string
  campaign_id: string | null
  campaign_name: string | null
  adset_id: string | null
  adset_name: string | null
  thumbnail_url: string | null
  updated_at: string
}

export type MetaAdInsightRow = {
  id: string
  account_id: string
  ad_id: string
  location_id: string
  date: string
  spend: number
  impressions: number
  reach: number
  inline_link_clicks: number
  video_3sec_watched: number
  video_p75_watched: number
}
