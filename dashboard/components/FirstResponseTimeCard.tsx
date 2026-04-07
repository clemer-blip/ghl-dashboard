'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { FirstResponseStatsRow } from '@/lib/supabase'
import { formatDate, formatDuration } from '@/lib/formatters'

function secondsToMinutes(s: number) {
  return parseFloat((s / 60).toFixed(1))
}

export default function FirstResponseTimeCard({ data, title }: { data: FirstResponseStatsRow[], title?: string }) {
  const formatted = data.map((d) => ({
    day: formatDate(d.day),
    'Média (min)': secondsToMinutes(d.avg_response_seconds),
    'P50 (min)': secondsToMinutes(d.p50_response_seconds),
    'P95 (min)': secondsToMinutes(d.p95_response_seconds),
  }))

  const latest = data.at(-1)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-700">
          {title ?? 'Tempo médio de primeira resposta'}
        </h2>
        {latest && (
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">
              {formatDuration(latest.avg_response_seconds)}
            </p>
            <p className="text-xs text-gray-400">último dia com dados</p>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="min" />
          <Tooltip formatter={(val: number) => `${val} min`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="Média (min)" stroke="#6366f1" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="P50 (min)" stroke="#a5b4fc" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="P95 (min)" stroke="#e0e7ff" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
