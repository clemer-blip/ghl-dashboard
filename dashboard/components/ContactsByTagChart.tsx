'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ContactsByTagRow } from '@/lib/supabase'

export default function ContactsByTagChart({ data }: { data: ContactsByTagRow[] }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Contatos por tag</h2>
        <p className="text-sm text-gray-400">Nenhuma tag encontrada.</p>
      </div>
    )
  }

  // Top 20 já vem limitado pela API, mas garantimos ordem decrescente
  const sorted = [...data].sort((a, b) => b.contact_count - a.contact_count)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">
        Contatos por tag <span className="text-xs font-normal text-gray-400">(top 20)</span>
      </h2>
      <ResponsiveContainer width="100%" height={Math.max(240, sorted.length * 28)}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 140, bottom: 0 }}
        >
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="tag"
            tick={{ fontSize: 11 }}
            width={140}
          />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Contatos']}
          />
          <Bar dataKey="contact_count" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
