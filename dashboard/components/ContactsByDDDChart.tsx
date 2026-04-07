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

type DDDRow = { ddd: string; contact_count: number }

const COLORS = [
  '#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b',
  '#ef4444','#ec4899','#14b8a6','#f97316','#84cc16',
]

export default function ContactsByDDDChart({ data }: { data: DDDRow[] }) {
  const total = data.reduce((s, d) => s + d.contact_count, 0)
  const top = data.slice(0, 15)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-700">DDD dos contatos</h2>
          <p className="text-xs text-gray-400 mt-0.5">região de origem dos clientes</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">{total.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-gray-400">contatos mapeados</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={top} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis type="category" dataKey="ddd" tick={{ fontSize: 12 }} width={36} />
          <Tooltip
            formatter={(val: number) => [
              `${val.toLocaleString('pt-BR')} (${((val / total) * 100).toFixed(1)}%)`,
              'Contatos',
            ]}
          />
          <Bar dataKey="contact_count" name="Contatos" radius={[0, 4, 4, 0]}>
            {top.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
