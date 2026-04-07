'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { ContactsByChannelRow } from '@/lib/supabase'

const CHANNEL_COLORS: Record<string, string> = {
  SMS: '#6366f1',
  EMAIL: '#f59e0b',
  WHATSAPP: '#22c55e',
  INSTAGRAM: '#ec4899',
  FACEBOOK: '#3b82f6',
  WEBCHAT: '#14b8a6',
  CALL: '#f97316',
  GMB: '#8b5cf6',
}

const DEFAULT_COLOR = '#94a3b8'

function channelLabel(channel: string) {
  const labels: Record<string, string> = {
    SMS: 'SMS',
    EMAIL: 'E-mail',
    WHATSAPP: 'WhatsApp',
    INSTAGRAM: 'Instagram',
    FACEBOOK: 'Facebook',
    WEBCHAT: 'Web Chat',
    CALL: 'Ligação',
    GMB: 'Google Meu Negócio',
  }
  return labels[channel?.toUpperCase()] ?? channel
}

export default function ContactsByChannelChart({ data }: { data: ContactsByChannelRow[] }) {
  const formatted = data.map((d) => ({
    ...d,
    channel: channelLabel(d.channel),
    color: CHANNEL_COLORS[d.channel?.toUpperCase()] ?? DEFAULT_COLOR,
  }))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">
        Contatos por canal
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={formatted}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 80, bottom: 0 }}
        >
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="channel" tick={{ fontSize: 12 }} width={80} />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Contatos']}
          />
          <Bar dataKey="contact_count" radius={[0, 4, 4, 0]}>
            {formatted.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
