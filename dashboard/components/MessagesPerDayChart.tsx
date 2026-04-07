'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { MessagesPerDayRow } from '@/lib/supabase'
import { formatDate } from '@/lib/formatters'

export default function MessagesPerDayChart({ data }: { data: MessagesPerDayRow[] }) {
  const formatted = data.map((d) => ({
    ...d,
    day: formatDate(d.day),
  }))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">
        Mensagens recebidas por dia
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="inbound_count" name="Recebidas" fill="#6366f1" stackId="a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="outbound_count" name="Enviadas" fill="#a5b4fc" stackId="a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
