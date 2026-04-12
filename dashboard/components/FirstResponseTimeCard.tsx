'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts'
import type { FirstResponseStatsRow } from '@/lib/supabase'
import { formatDate, formatDuration } from '@/lib/formatters'

const LOC_COLORS: Record<string, string> = {
  'NpYMLlXhYhsazq0i03ZV': '#6366f1',
  'uFiluYqG2MhvdLi1qRNj': '#10b981',
}

type RowWithLoc = FirstResponseStatsRow & { location_id?: string | null }

export default function FirstResponseTimeCard({
  data,
  title,
  locationLabels = {},
}: {
  data: RowWithLoc[]
  title?: string
  locationLabels?: Record<string, string>
}) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-1">
          {title ?? 'Tempo de resposta'}
        </h2>
        <p className="text-sm text-gray-400">Sem dados de atendimento humano no período.</p>
      </div>
    )
  }

  const locations = [...new Set(data.map((d) => d.location_id).filter(Boolean))] as string[]
  const isMulti   = locations.length > 1

  // Mediana geral (média ponderada das medianas diárias)
  const totalConvs    = data.reduce((s, d) => s + (d.total_conversations ?? 0), 0)
  const weightedP50   = data.reduce((s, d) => s + (d.p50_response_seconds ?? 0) * (d.total_conversations ?? 0), 0)
  const overallMedian = totalConvs > 0 ? Math.round(weightedP50 / totalConvs) : 0

  // Média geral para a reference line
  const weightedAvg   = data.reduce((s, d) => s + (d.avg_response_seconds ?? 0) * (d.total_conversations ?? 0), 0)
  const overallAvg    = totalConvs > 0 ? Math.round(weightedAvg / totalConvs) : 0
  const avgMin        = Math.round(overallAvg / 60)

  // Pivot para gráfico
  const byDay: Record<string, Record<string, any>> = {}
  for (const row of data) {
    const key = formatDate(row.day)
    if (!byDay[key]) byDay[key] = { day: key }
    const label = isMulti ? (locationLabels[row.location_id!] ?? row.location_id!) : 'Mediana (min)'
    const valMin = Math.round((row.p50_response_seconds ?? 0) / 60)
    byDay[key][label] = valMin
  }
  const chartData = Object.values(byDay).sort((a, b) => a.day.localeCompare(b.day))
  const barLabels = isMulti ? locations.map((id) => locationLabels[id] ?? id) : ['Mediana (min)']

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-base font-semibold text-gray-700">
            {title ?? 'Tempo de resposta'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            mediana por dia · {totalConvs.toLocaleString('pt-BR')} atendimentos humanos
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">
            {formatDuration(overallMedian)}
          </p>
          <p className="text-xs text-gray-400">mediana do período</p>
        </div>
      </div>

      {isMulti && (
        <div className="flex gap-4 mb-3 mt-2">
          {locations.map((id) => {
            const rows  = data.filter((d) => d.location_id === id)
            const total = rows.reduce((s, d) => s + (d.total_conversations ?? 0), 0)
            const wp50  = rows.reduce((s, d) => s + (d.p50_response_seconds ?? 0) * (d.total_conversations ?? 0), 0)
            const med   = total > 0 ? Math.round(wp50 / total) : 0
            return (
              <span key={id} className="text-xs" style={{ color: LOC_COLORS[id] ?? '#6366f1' }}>
                <span className="font-semibold">{locationLabels[id] ?? id}:</span>{' '}
                {formatDuration(med)}
              </span>
            )
          })}
        </div>
      )}

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="min" allowDecimals={false} />
          <Tooltip
            formatter={(v: number, name: string) => [`${v} min`, name]}
          />
          {isMulti && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {!isMulti && avgMin > 0 && (
            <ReferenceLine
              y={avgMin}
              stroke="#a5b4fc"
              strokeDasharray="4 2"
              label={{ value: `Média: ${avgMin}min`, fontSize: 11, fill: '#6366f1', position: 'insideTopRight' }}
            />
          )}
          {barLabels.map((lbl, i) => (
            <Bar
              key={lbl}
              dataKey={lbl}
              fill={isMulti ? (LOC_COLORS[locations[i]] ?? '#6366f1') : '#6366f1'}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
