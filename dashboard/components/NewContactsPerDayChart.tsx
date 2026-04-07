'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { NewContactsPerDayRow } from '@/lib/supabase'
import { formatDate } from '@/lib/formatters'

export default function NewContactsPerDayChart({ data }: { data: NewContactsPerDayRow[] }) {
  const formatted = data.map((d) => ({
    day: formatDate(d.day),
    'Novos contatos': d.new_contacts,
  }))

  const total = data.reduce((s, d) => s + d.new_contacts, 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-700">Novos contatos por dia</h2>
          <p className="text-xs text-gray-400 mt-0.5">primeiro contato de cada pessoa</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">{total.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-gray-400">no período</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(v: number) => [v.toLocaleString('pt-BR'), 'Novos contatos']} />
          <Area
            type="monotone"
            dataKey="Novos contatos"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#gradGreen)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
