'use client'

import { useEffect, useState } from 'react'
import KpiCard from '@/components/KpiCard'
import MessagesPerDayChart from '@/components/MessagesPerDayChart'
import ContactsByChannelChart from '@/components/ContactsByChannelChart'
import ContactsByTagChart from '@/components/ContactsByTagChart'
import ContactsByDDDChart from '@/components/ContactsByDDDChart'
import UniqueContactsPerDayChart from '@/components/UniqueContactsPerDayChart'
import ResponseTimeCard from '@/components/FirstResponseTimeCard'
import type {
  MessagesPerDayRow,
  FirstResponseStatsRow,
  ContactsByChannelRow,
  ContactsByTagRow,
  LocationRow,
  ContactsByDDDRow,
  UniqueContactsPerDayRow,
} from '@/lib/supabase'
import { formatDuration } from '@/lib/formatters'

const LOCATION_LABELS: Record<string, string> = {
  'NpYMLlXhYhsazq0i03ZV': 'São Paulo',
  'uFiluYqG2MhvdLi1qRNj': 'Goiânia',
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
  const [channelData, setChannelData] = useState<ContactsByChannelRow[]>([])
  const [tagData, setTagData] = useState<ContactsByTagRow[]>([])
  const [dddData, setDddData] = useState<ContactsByDDDRow[]>([])
  const [uniqueContactsData, setUniqueContactsData] = useState<UniqueContactsPerDayRow[]>([])
  const [loading, setLoading] = useState(true)

  // Carrega a lista de subcontas uma vez
  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then((data) => setLocations(Array.isArray(data) ? data : []))
  }, [])

  // Carrega os dados quando muda subconta ou período
  useEffect(() => {
    setLoading(true)
    const loc = selectedLocation === 'all' ? '' : `&location=${selectedLocation}`

    // Parâmetros de data: custom range ou days preset
    const dateParams = customStart && customEnd
      ? `start=${customStart}&end=${customEnd}`
      : `days=${days ?? 30}`

    Promise.all([
      fetch(`/api/messages-per-day?${dateParams}${loc}`).then((r) => r.json()),
      fetch(`/api/first-response-time?${dateParams}${loc}`).then((r) => r.json()),
      fetch(`/api/contacts-by-channel?${loc.slice(1)}`).then((r) => r.json()),
      fetch(`/api/contacts-by-tag?limit=10${loc}`).then((r) => r.json()),
      fetch(`/api/contacts-by-ddd?${loc.slice(1)}`).then((r) => r.json()),
      fetch(`/api/unique-contacts-per-day?${dateParams}${loc}`).then((r) => r.json()),
    ]).then(([msgs, frt, channels, tags, ddd, uniqueContacts]) => {
      setMsgData(Array.isArray(msgs) ? msgs : [])
      setFrtData(Array.isArray(frt) ? frt : [])
      setChannelData(Array.isArray(channels) ? channels : [])
      setTagData(Array.isArray(tags) ? tags : [])
      setDddData(Array.isArray(ddd) ? ddd : [])
      setUniqueContactsData(Array.isArray(uniqueContacts) ? uniqueContacts : [])
      setLoading(false)
    })
  }, [selectedLocation, days, customStart, customEnd])

  // KPIs
  const totalInbound = msgData.reduce((s, d) => s + (d.inbound_count ?? 0), 0)
  const totalUniqueContacts = uniqueContactsData.reduce((s, d) => s + (d.unique_contacts ?? 0), 0)
  const yesterdayFrt = frtData.at(-2) ?? frtData.at(-1)
  const totalContacts = channelData.reduce((s, d) => s + (d.contact_count ?? 0), 0)

  const periodLabel = customStart && customEnd
    ? `${customStart.slice(5).replace('-', '/')} a ${customEnd.slice(5).replace('-', '/')}`
    : `últimos ${days} dias`

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
            <h1 className="text-lg font-bold text-gray-900">Time de vendas - Casa Renata Goiania</h1>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Seletor de subconta */}
            {locations.length > 1 && (
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedLocation('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedLocation === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Todas
                </button>
                {locations.map((loc) => (
                  <button
                    key={loc.location_id}
                    onClick={() => setSelectedLocation(loc.location_id)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedLocation === loc.location_id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
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
                    days === d && !customStart
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {d}d
                </button>
              ))}
              <button
                onClick={() => setShowDatePicker((v) => !v)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  customStart
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
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
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Até</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
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
                title="Mensagens recebidas"
                value={totalInbound.toLocaleString('pt-BR')}
                subtitle={periodLabel}
                color="indigo"
              />
              <KpiCard
                title="Clientes únicos"
                value={totalUniqueContacts.toLocaleString('pt-BR')}
                subtitle={periodLabel}
                color="emerald"
              />
              <KpiCard
                title="1ª resposta humana"
                value={yesterdayFrt ? formatDuration(yesterdayFrt.avg_response_seconds) : '—'}
                subtitle="média do dia anterior"
                color="amber"
              />
              <KpiCard
                title="Total de contatos"
                value={totalContacts.toLocaleString('pt-BR')}
                subtitle={`em ${channelData.length} canal${channelData.length !== 1 ? 'is' : ''}`}
                color="violet"
              />
            </div>

            {/* Gráficos de evolução */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UniqueContactsPerDayChart data={uniqueContactsData} />
              <MessagesPerDayChart data={msgData} />
            </div>

            {/* Canal e DDD */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContactsByChannelChart data={channelData} />
              <ContactsByDDDChart data={dddData} />
            </div>

            {/* Tags — largura total */}
            <ContactsByTagChart data={tagData} />

            {/* Tempo de atendimento */}
            <ResponseTimeCard data={frtData} title="Tempo de atendimento (inbound → resposta do time)" />
          </>
        )}
      </main>
    </div>
  )
}
