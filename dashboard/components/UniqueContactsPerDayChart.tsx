'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts'
import { formatDate } from '@/lib/formatters'

type Row = { day: string; unique_contacts: number; location_id?: string | null }

const LOC_COLORS: Record<string, string> = {
  'NpYMLlXhYhsazq0i03ZV': '#6366f1',
  'uFiluYqG2MhvdLi1qRNj': '#10b981',
}
const LOC_FALLBACK = ['#6366f1', '#10b981', '#f59e0b']

export default function UniqueContactsPerDayChart({
  data,
  locationLabels = {},
}: {
  data: Row[]
  locationLabels?: Record<string, string>
}) {
  const locations = [...new Set(data.map((d) => d.location_id).filter(Boolean))] as string[]
  const isMulti = locations.length > 1

  // Pivot: { day, [label]: count }
  const byDay: Record<string, Record<string, any>> = {}
  for (const row of data) {
    const key = formatDate(row.day)
    if (!byDay[key]) byDay[key] = { day: key, _total: 0 }
    const label = isMulti ? (locationLabels[row.location_id!] ?? row.location_id!) : 'Clientes'
    byDay[key][label] = (byDay[key][label] ?? 0) + row.unique_contacts
    byDay[key]._total += row.unique_contacts
  }
  const formatted = Object.values(byDay).sort((a, b) => a.day.localeCompare(b.day))

  const uniqueDays = formatted.length
  const totalAll = formatted.reduce((s, d) => s + d._total, 0)
  const avgAll = uniqueDays ? Math.round(totalAll / uniqueDays) : 0

  const labels = isMulti
    ? locations.map((id) => locationLabels[id] ?? id)
    : ['Clientes']

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-700">Clientes por dia</h2>
          <p className="text-xs text-gray-400 mt-0.5">contact_id únicos que enviaram mensagem</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-violet-600">{avgAll.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-gray-400">média/dia {isMulti ? '(total)' : ''}</p>
        </div>
      </div>

      {isMulti && (
        <div className="flex gap-4 mb-3">
          {locations.map((id) => {
            const lbl = locationLabels[id] ?? id
            const rows = data.filter((d) => d.location_id === id)
            const days = new Set(rows.map((d) => d.day)).size
            const avg = days ? Math.round(rows.reduce((s, d) => s + d.unique_contacts, 0) / days) : 0
            return (
              <span key={id} className="text-xs" style={{ color: LOC_COLORS[id] ?? LOC_FALLBACK[0] }}>
                <span className="font-semibold">{lbl}:</span> {avg}/dia
              </span>
            )
          })}
        </div>
      )}

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(v: number, name: string) => [v.toLocaleString('pt-BR'), name]} />
          {isMulti && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {!isMulti && (
            <ReferenceLine y={avgAll} stroke="#a78bfa" strokeDasharray="4 2"
              label={{ value: `Média: ${avgAll}`, fontSize: 11, fill: '#7c3aed', position: 'insideTopRight' }} />
          )}
          {labels.map((lbl, i) => (
            <Bar key={lbl} dataKey={lbl}
              fill={isMulti ? (LOC_COLORS[locations[i]] ?? LOC_FALLBACK[i]) : '#8b5cf6'}
              radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
