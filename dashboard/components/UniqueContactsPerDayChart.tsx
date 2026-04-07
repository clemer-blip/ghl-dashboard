'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { formatDate } from '@/lib/formatters'

type Row = { day: string; unique_contacts: number }

export default function UniqueContactsPerDayChart({ data }: { data: Row[] }) {
  const formatted = data.map((d) => ({
    day: formatDate(d.day),
    'Clientes únicos': d.unique_contacts,
  }))

  const total = data.reduce((s, d) => s + d.unique_contacts, 0)
  const avg = data.length ? Math.round(total / data.length) : 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-700">Clientes únicos por dia</h2>
          <p className="text-xs text-gray-400 mt-0.5">contatos que enviaram mensagem no dia</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-violet-600">{avg.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-gray-400">média/dia</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(v: number) => [v.toLocaleString('pt-BR'), 'Clientes únicos']} />
          <ReferenceLine y={avg} stroke="#a78bfa" strokeDasharray="4 2" label={{ value: `Média: ${avg}`, fontSize: 11, fill: '#7c3aed', position: 'insideTopRight' }} />
          <Bar dataKey="Clientes únicos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
