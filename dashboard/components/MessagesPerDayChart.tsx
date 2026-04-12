'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import type { MessagesPerDayRow } from '@/lib/supabase'
import { formatDate } from '@/lib/formatters'

export default function MessagesPerDayChart({ data }: { data: MessagesPerDayRow[] }) {
  // Agrega por dia (soma todas as locations)
  const byDay: Record<string, { day: string; inbound_count: number; outbound_count: number }> = {}
  for (const row of data) {
    const key = formatDate(row.day)
    if (!byDay[key]) byDay[key] = { day: key, inbound_count: 0, outbound_count: 0 }
    byDay[key].inbound_count  += row.inbound_count  ?? 0
    byDay[key].outbound_count += row.outbound_count ?? 0
  }
  const formatted = Object.values(byDay).sort((a, b) => a.day.localeCompare(b.day))

  const totalIn  = formatted.reduce((s, d) => s + d.inbound_count, 0)
  const totalOut = formatted.reduce((s, d) => s + d.outbound_count, 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-700">Mensagens por dia</h2>
          <p className="text-xs text-gray-400 mt-0.5">recebidas e enviadas</p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-lg font-bold text-indigo-600">{totalIn.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-gray-400">recebidas</p>
          </div>
          <div>
            <p className="text-lg font-bold text-indigo-300">{totalOut.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-gray-400">enviadas</p>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number, name: string) => [v.toLocaleString('pt-BR'), name]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="inbound_count"  name="Recebidas" fill="#6366f1" stackId="a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="outbound_count" name="Enviadas"  fill="#a5b4fc" stackId="a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
