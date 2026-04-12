'use client'

import { useEffect, useState } from 'react'
import KpiCard from '@/components/KpiCard'
import MessagesPerDayChart from '@/components/MessagesPerDayChart'
import ContactsByDDDChart from '@/components/ContactsByDDDChart'
import UniqueContactsPerDayChart from '@/components/UniqueContactsPerDayChart'
import ResponseTimeCard from '@/components/FirstResponseTimeCard'
import MetaAdsSection from '@/components/MetaAdsSection'
import type {
  MessagesPerDayRow,
  FirstResponseStatsRow,
  LocationRow,
  ContactsByDDDRow,
  UniqueContactsPerDayRow,
  MetaInsightRow,
} from '@/lib/supabase'
import { formatDuration } from '@/lib/formatters'

const LOCATION_LABELS: Record<string, string> = {
  'NpYMLlXhYhsazq0i03ZV': 'São Paulo',
  'uFiluYqG2MhvdLi1qRNj': 'Goiânia',
}
const LOC_COLORS: Record<string, string> = {
  'NpYMLlXhYhsazq0i03ZV': '#6366f1',
  'uFiluYqG2MhvdLi1qRNj': '#10b981',
}

function locationLabel(id: string) {
  return LOCATION_LABELS[id] ?? `Subconta ${id.slice(0, 6)}…`
}

export default function DashboardClient() {
  const [locations, setLocations] = useState<LocationRow[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [days, setDays] = useState<number | null>(30)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [msgData, setMsgData] = useState<MessagesPerDayRow[]>([])
  const [frtData, setFrtData] = useState<FirstResponseStatsRow[]>([])
  const [dddData, setDddData] = useState<ContactsByDDDRow[]>([])
  const [uniqueContactsData, setUniqueContactsData] = useState<UniqueContactsPerDayRow[]>([])
  const [metaData, setMetaData] = useState<MetaInsightRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then((data) => setLocations(Array.isArray(data) ? data : []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const loc = selectedLocation === 'all' ? '' : `&location=${selectedLocation}`
    const dateParams = customStart && customEnd
      ? `start=${customStart}&end=${customEnd}`
      : `days=${days ?? 30}`

    Promise.all([
      fetch(`/api/messages-per-day?${dateParams}${loc}`).then((r) => r.json()),
      fetch(`/api/first-response-time?${dateParams}${loc}`).then((r) => r.json()),
      fetch(`/api/contacts-by-ddd?${loc.slice(1)}`).then((r) => r.json()),
      fetch(`/api/unique-contacts-per-day?${dateParams}${loc}`).then((r) => r.json()),
      fetch(`/api/meta-insights?${dateParams}${loc}`).then((r) => r.json()),
    ]).then(([msgs, frt, ddd, uniqueContacts, meta]) => {
      setMsgData(Array.isArray(msgs) ? msgs : [])
      setFrtData(Array.isArray(frt) ? frt : [])
      setDddData(Array.isArray(ddd) ? ddd : [])
      setUniqueContactsData(Array.isArray(uniqueContacts) ? uniqueContacts : [])
      setMetaData(Array.isArray(meta) ? meta : [])
      setLoading(false)
    })
  }, [selectedLocation, days, customStart, customEnd])

  // KPIs globais
  const totalInbound  = msgData.reduce((s, d) => s + (d.inbound_count  ?? 0), 0)
  const totalOutbound = msgData.reduce((s, d) => s + (d.outbound_count ?? 0), 0)
  const totalUniqueContacts = uniqueContactsData.reduce((s, d) => s + (d.unique_contacts ?? 0), 0)
  const uniqueDays = new Set(uniqueContactsData.map((d) => d.day)).size
  const avgContactsPerDay = uniqueDays ? Math.round(totalUniqueContacts / uniqueDays) : 0
  const frtTotal = frtData.reduce((s, d) => s + (d.total_conversations ?? 0), 0)
  const frtMedianSeconds = frtTotal > 0
    ? Math.round(frtData.reduce((s, d) => s + (d.p50_response_seconds ?? 0) * (d.total_conversations ?? 0), 0) / frtTotal)
    : null

  const periodLabel = customStart && customEnd
    ? `${customStart.slice(5).replace('-', '/')} a ${customEnd.slice(5).replace('-', '/')}`
    : `últimos ${days} dias`

  // Stats por location para painel comparativo
  const isAllLocations = selectedLocation === 'all' && locations.length > 1
  const locationStats = isAllLocations
    ? locations.map((loc) => {
        const locId = loc.location_id
        const uRows = uniqueContactsData.filter((d) => d.location_id === locId)
        const mRows = msgData.filter((d) => d.location_id === locId)
        const fRows  = frtData.filter((d) => d.location_id === locId)
        const uDays  = new Set(uRows.map((d) => d.day)).size || 1
        const mDays  = new Set(mRows.map((d) => d.day)).size || 1
        const avgClients  = Math.round(uRows.reduce((s, d) => s + d.unique_contacts, 0) / uDays)
        const avgInbound  = Math.round(mRows.reduce((s, d) => s + (d.inbound_count ?? 0), 0) / mDays)
        const avgOutbound = Math.round(mRows.reduce((s, d) => s + (d.outbound_count ?? 0), 0) / mDays)
        const fTotal = fRows.reduce((s, d) => s + (d.total_conversations ?? 0), 0)
        const fMedian = fTotal > 0
          ? Math.round(fRows.reduce((s, d) => s + (d.p50_response_seconds ?? 0) * (d.total_conversations ?? 0), 0) / fTotal)
          : null
        return { locId, avgClients, avgInbound, avgOutbound, fMedian }
      })
    : []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-900">Casa Renata — Atendimento</h1>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Seletor de subconta */}
            {locations.length > 1 && (
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedLocation('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedLocation === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Todas
                </button>
                {locations.map((loc) => (
                  <button
                    key={loc.location_id}
                    onClick={() => setSelectedLocation(loc.location_id)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedLocation === loc.location_id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {locationLabel(loc.location_id)}
                  </button>
                ))}
              </div>
            )}

            {/* Seletor de período */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg relative">
              {[7, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => { setDays(d); setCustomStart(''); setCustomEnd(''); setShowDatePicker(false) }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    days === d && !customStart ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {d}d
                </button>
              ))}
              <button
                onClick={() => setShowDatePicker((v) => !v)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  customStart ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {customStart ? periodLabel : 'Personalizado'}
              </button>

              {showDatePicker && (
                <div className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex flex-col gap-3 min-w-[260px]">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Período personalizado</p>
                  <div className="flex flex-col gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">De</label>
                      <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Até</label>
                      <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <button
                    onClick={() => { if (customStart && customEnd) { setDays(null); setShowDatePicker(false) } }}
                    disabled={!customStart || !customEnd}
                    className="w-full bg-indigo-600 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={() => { setCustomStart(''); setCustomEnd(''); setDays(30); setShowDatePicker(false) }}
                    className="w-full text-gray-500 text-sm hover:text-gray-700"
                  >
                    Limpar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Carregando dados…</p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Clientes por dia"
                value={avgContactsPerDay.toLocaleString('pt-BR')}
                subtitle={`média — ${periodLabel}`}
                color="violet"
              />
              <KpiCard
                title="Mensagens recebidas"
                value={totalInbound.toLocaleString('pt-BR')}
                subtitle={periodLabel}
                color="indigo"
              />
              <KpiCard
                title="Mensagens enviadas"
                value={totalOutbound.toLocaleString('pt-BR')}
                subtitle={periodLabel}
                color="emerald"
              />
              <KpiCard
                title="Tempo de resposta"
                value={frtMedianSeconds ? formatDuration(frtMedianSeconds) : '—'}
                subtitle={`mediana — ${periodLabel}`}
                color="amber"
              />
            </div>

            {/* Painel comparativo — só quando "Todas" com múltiplas locations */}
            {isAllLocations && locationStats.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-700 mb-4">Comparativo por unidade</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                        <th className="text-left pb-3 font-medium">Unidade</th>
                        <th className="text-right pb-3 font-medium">Clientes/dia</th>
                        <th className="text-right pb-3 font-medium">Recebidas/dia</th>
                        <th className="text-right pb-3 font-medium">Enviadas/dia</th>
                        <th className="text-right pb-3 font-medium">Mediana resp.</th>
                        <th className="text-right pb-3 font-medium">% do volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {locationStats.map(({ locId, avgClients, avgInbound, avgOutbound, fMedian }) => {
                        const totalClients = locationStats.reduce((s, l) => s + l.avgClients, 0)
                        const pct = totalClients ? Math.round((avgClients / totalClients) * 100) : 0
                        return (
                          <tr key={locId} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 font-semibold" style={{ color: LOC_COLORS[locId] ?? '#6366f1' }}>
                              {locationLabel(locId)}
                            </td>
                            <td className="py-3 text-right text-gray-700 font-medium">
                              {avgClients.toLocaleString('pt-BR')}
                            </td>
                            <td className="py-3 text-right text-gray-700">
                              {avgInbound.toLocaleString('pt-BR')}
                            </td>
                            <td className="py-3 text-right text-gray-700">
                              {avgOutbound.toLocaleString('pt-BR')}
                            </td>
                            <td className="py-3 text-right text-gray-700">
                              {fMedian ? formatDuration(fMedian) : '—'}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: LOC_COLORS[locId] ?? '#6366f1' }} />
                                </div>
                                <span className="text-gray-500 text-xs w-8 text-right">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Gráficos de volume */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UniqueContactsPerDayChart data={uniqueContactsData} locationLabels={LOCATION_LABELS} />
              <MessagesPerDayChart data={msgData} />
            </div>

            {/* Meta Ads */}
            <MetaAdsSection data={metaData} locationLabels={LOCATION_LABELS} />

            {/* Tempo de resposta + DDD */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponseTimeCard data={frtData} title="Tempo de resposta" locationLabels={LOCATION_LABELS} />
              <ContactsByDDDChart data={dddData} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
