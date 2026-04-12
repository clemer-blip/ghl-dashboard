'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'
import { formatDate } from '@/lib/formatters'

type MetaRow = {
  date: string
  location_id: string
  spend: number
  impressions: number
  reach: number
  clicks: number
  conversations_started: number
}

const LOC_COLORS: Record<string, string> = {
  'NpYMLlXhYhsazq0i03ZV': '#6366f1',
  'uFiluYqG2MhvdLi1qRNj': '#10b981',
}
const LOC_FALLBACK = ['#6366f1', '#10b981']

export default function MetaAdsSection({
  data,
  locationLabels = {},
}: {
  data: MetaRow[]
  locationLabels?: Record<string, string>
}) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-1">Meta Ads</h2>
        <p className="text-sm text-gray-400">Sem dados de anúncios no período.</p>
      </div>
    )
  }

  const locations = [...new Set(data.map((d) => d.location_id))]
  const isMulti   = locations.length > 1

  // Totais globais
  const totalSpend         = data.reduce((s, d) => s + (d.spend ?? 0), 0)
  const totalConversations = data.reduce((s, d) => s + (d.conversations_started ?? 0), 0)
  const costPerConv        = totalConversations ? totalSpend / totalConversations : 0

  // Pivot diário para o gráfico
  const byDay: Record<string, Record<string, any>> = {}
  for (const row of data) {
    const key = formatDate(row.date)
    if (!byDay[key]) byDay[key] = { day: key }
    const label = isMulti ? (locationLabels[row.location_id] ?? row.location_id) : 'Investimento'
    byDay[key][label] = ((byDay[key][label] ?? 0) + row.spend)
  }
  const chartData = Object.values(byDay).sort((a, b) => a.day.localeCompare(b.day))
  const barLabels = isMulti ? locations.map((id) => locationLabels[id] ?? id) : ['Investimento']

  // Stats por location para a tabela
  const locStats = locations.map((id) => {
    const rows  = data.filter((d) => d.location_id === id)
    const spend = rows.reduce((s, d) => s + d.spend, 0)
    const convs = rows.reduce((s, d) => s + d.conversations_started, 0)
    return { id, label: locationLabels[id] ?? id, spend, convs, cpc: convs ? spend / convs : 0 }
  })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
      {/* Header + KPIs */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-700">Meta Ads</h2>
          <p className="text-xs text-gray-400 mt-0.5">investimento e conversas iniciadas</p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-lg font-bold text-indigo-600">
              {totalSpend.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-gray-400">investimento</p>
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-600">
              {totalConversations.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-gray-400">conversas iniciadas</p>
          </div>
          <div>
            <p className="text-lg font-bold text-amber-500">
              {costPerConv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-gray-400">custo/conversa</p>
          </div>
        </div>
      </div>

      {/* Gráfico de investimento diário */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
          <Tooltip
            formatter={(v: number, name: string) => [
              v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
              name,
            ]}
          />
          {isMulti && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {barLabels.map((lbl, i) => (
            <Bar
              key={lbl}
              dataKey={lbl}
              fill={isMulti ? (LOC_COLORS[locations[i]] ?? LOC_FALLBACK[i]) : '#6366f1'}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Tabela comparativa por location */}
      {isMulti && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="text-left pb-2 font-medium">Unidade</th>
                <th className="text-right pb-2 font-medium">Investimento</th>
                <th className="text-right pb-2 font-medium">Conversas</th>
                <th className="text-right pb-2 font-medium">Custo/conversa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {locStats.map(({ id, label, spend, convs, cpc }) => (
                <tr key={id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 font-semibold" style={{ color: LOC_COLORS[id] ?? '#6366f1' }}>
                    {label}
                  </td>
                  <td className="py-2 text-right text-gray-700">
                    {spend.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-2 text-right text-gray-700">
                    {convs.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2 text-right text-gray-700">
                    {convs ? cpc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
