'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'

const LOCATION_LABELS: Record<string, string> = {
  'NpYMLlXhYhsazq0i03ZV': 'São Paulo',
  'uFiluYqG2MhvdLi1qRNj': 'Goiânia',
}

const LOC_COLORS: Record<string, string> = {
  'NpYMLlXhYhsazq0i03ZV': '#6366f1',
  'uFiluYqG2MhvdLi1qRNj': '#10b981',
}

function fmt(date: string) {
  const d = new Date(date + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

type MsgRow = { day: string; inbound_count: number; outbound_count: number; location_id: string }
type ContactRow = { day: string; unique_contacts: number; location_id: string }

export default function VolumePage() {
  const [days, setDays] = useState(30)
  const [msgData, setMsgData]         = useState<MsgRow[]>([])
  const [contactData, setContactData] = useState<ContactRow[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/messages-per-day?days=${days}`).then(r => r.json()),
      fetch(`/api/unique-contacts-per-day?days=${days}`).then(r => r.json()),
    ]).then(([msgs, contacts]) => {
      setMsgData(Array.isArray(msgs) ? msgs : [])
      setContactData(Array.isArray(contacts) ? contacts : [])
      setLoading(false)
    })
  }, [days])

  // KPIs
  const totalInbound  = msgData.reduce((s, d) => s + (d.inbound_count  ?? 0), 0)
  const totalOutbound = msgData.reduce((s, d) => s + (d.outbound_count ?? 0), 0)
  const totalContacts = contactData.reduce((s, d) => s + (d.unique_contacts ?? 0), 0)
  const uniqueDays    = new Set(contactData.map(d => d.day)).size || 1
  const avgPerDay     = Math.round(totalContacts / uniqueDays)

  // Pivot para gráfico de mensagens por dia
  const msgByDay: Record<string, Record<string, any>> = {}
  for (const row of msgData) {
    const key = fmt(row.day)
    if (!msgByDay[key]) msgByDay[key] = { day: key, recebidas: 0, enviadas: 0 }
    msgByDay[key].recebidas  += row.inbound_count  ?? 0
    msgByDay[key].enviadas   += row.outbound_count ?? 0
  }
  const msgChart = Object.values(msgByDay).sort((a, b) => a.day.localeCompare(b.day))

  // Pivot para gráfico de clientes únicos por dia e unidade
  const contactByDay: Record<string, Record<string, any>> = {}
  const locations = [...new Set(contactData.map(d => d.location_id))]
  for (const row of contactData) {
    const key = fmt(row.day)
    if (!contactByDay[key]) contactByDay[key] = { day: key }
    const lbl = LOCATION_LABELS[row.location_id] ?? row.location_id
    contactByDay[key][lbl] = (contactByDay[key][lbl] ?? 0) + row.unique_contacts
  }
  const contactChart = Object.values(contactByDay).sort((a, b) => a.day.localeCompare(b.day))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Casa Renata — Atendimento</h1>
              <p className="text-xs text-gray-400">volume de mensagens</p>
            </div>
          </div>

          {/* Seletor de período */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[7, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  days === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Carregando…</p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">Clientes/dia (média)</p>
                <p className="text-2xl font-bold text-violet-600">{avgPerDay.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">Clientes únicos</p>
                <p className="text-2xl font-bold text-indigo-600">{totalContacts.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">Mensagens recebidas</p>
                <p className="text-2xl font-bold text-emerald-600">{totalInbound.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">Mensagens enviadas</p>
                <p className="text-2xl font-bold text-amber-500">{totalOutbound.toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {/* Clientes únicos por dia */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Clientes por dia</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={contactChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  {locations.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                  {locations.map(id => (
                    <Bar
                      key={id}
                      dataKey={LOCATION_LABELS[id] ?? id}
                      stackId="a"
                      fill={LOC_COLORS[id] ?? '#6366f1'}
                      radius={locations.indexOf(id) === locations.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Mensagens por dia */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Mensagens por dia</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={msgChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="recebidas" stackId="a" fill="#6366f1" />
                  <Bar dataKey="enviadas"  stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
