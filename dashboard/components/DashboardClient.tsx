'use client'

import { useEffect, useState } from 'react'
import KpiCard from '@/components/KpiCard'
import MessagesPerDayChart from '@/components/MessagesPerDayChart'
import FirstResponseTimeCard from '@/components/FirstResponseTimeCard'
import ContactsByChannelChart from '@/components/ContactsByChannelChart'
import ContactsByTagChart from '@/components/ContactsByTagChart'
import ContactsByDDDChart from '@/components/ContactsByDDDChart'
import UniqueContactsPerDayChart from '@/components/UniqueContactsPerDayChart'
import LatestConversationsList from '@/components/LatestConversationsList'
import type {
  MessagesPerDayRow,
  FirstResponseStatsRow,
  ContactsByChannelRow,
  ContactsByTagRow,
  LocationRow,
  ContactsByDDDRow,
  UniqueContactsPerDayRow,
  LatestConversationRow,
} from '@/lib/supabase'
import { formatDuration } from '@/lib/formatters'

const LOCATION_LABELS: Record<string, string> = {
  // Preenchido dinamicamente — você pode nomear as subcontas aqui
}

function locationLabel(id: string) {
  return LOCATION_LABELS[id] ?? `Subconta ${id.slice(0, 6)}…`
}

export default function DashboardClient() {
  const [locations, setLocations] = useState<LocationRow[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [days, setDays] = useState(30)

  const [msgData, setMsgData] = useState<MessagesPerDayRow[]>([])
  const [frtData, setFrtData] = useState<FirstResponseStatsRow[]>([])
  const [channelData, setChannelData] = useState<ContactsByChannelRow[]>([])
  const [tagData, setTagData] = useState<ContactsByTagRow[]>([])
  const [dddData, setDddData] = useState<ContactsByDDDRow[]>([])
  const [uniqueContactsData, setUniqueContactsData] = useState<UniqueContactsPerDayRow[]>([])
  const [latestConvs, setLatestConvs] = useState<LatestConversationRow[]>([])
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

    Promise.all([
      fetch(`/api/messages-per-day?days=${days}${loc}`).then((r) => r.json()),
      fetch(`/api/human-response-time?days=${days}${loc}`).then((r) => r.json()),
      fetch(`/api/contacts-by-channel?${loc.slice(1)}`).then((r) => r.json()),
      fetch(`/api/contacts-by-tag?limit=20${loc}`).then((r) => r.json()),
      fetch(`/api/contacts-by-ddd?${loc.slice(1)}`).then((r) => r.json()),
      fetch(`/api/unique-contacts-per-day?days=${days}${loc}`).then((r) => r.json()),
      fetch(`/api/latest-conversations?limit=20${loc}`).then((r) => r.json()),
    ]).then(([msgs, frt, channels, tags, ddd, uniqueContacts, latest]) => {
      setMsgData(Array.isArray(msgs) ? msgs : [])
      setFrtData(Array.isArray(frt) ? frt : [])
      setChannelData(Array.isArray(channels) ? channels : [])
      setTagData(Array.isArray(tags) ? tags : [])
      setDddData(Array.isArray(ddd) ? ddd : [])
      setUniqueContactsData(Array.isArray(uniqueContacts) ? uniqueContacts : [])
      setLatestConvs(Array.isArray(latest) ? latest : [])
      setLoading(false)
    })
  }, [selectedLocation, days])

  // KPIs
  const totalInbound = msgData.reduce((s, d) => s + (d.inbound_count ?? 0), 0)
  const totalUniqueContacts = uniqueContactsData.reduce((s, d) => s + (d.unique_contacts ?? 0), 0)
  const latestFrt = frtData.at(-1)
  const totalContacts = channelData.reduce((s, d) => s + (d.contact_count ?? 0), 0)

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
            <h1 className="text-lg font-bold text-gray-900">GHL Dashboard</h1>
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
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    days === d
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {d}d
                </button>
              ))}
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
                subtitle={`últimos ${days} dias`}
                color="indigo"
              />
              <KpiCard
                title="Clientes únicos"
                value={totalUniqueContacts.toLocaleString('pt-BR')}
                subtitle={`últimos ${days} dias`}
                color="emerald"
              />
              <KpiCard
                title="1ª resposta humana"
                value={latestFrt ? formatDuration(latestFrt.avg_response_seconds) : '—'}
                subtitle="média do último dia"
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

            {/* Tags */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContactsByTagChart data={tagData} />
            </div>

            {/* Tempo de resposta humana */}
            <FirstResponseTimeCard data={frtData} title="Tempo de primeira resposta humana" />

            {/* Últimas conversas */}
            <LatestConversationsList data={latestConvs} />
          </>
        )}
      </main>
    </div>
  )
}
