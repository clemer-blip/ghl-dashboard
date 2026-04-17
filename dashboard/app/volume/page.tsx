'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'
import type { CreativeRow } from '@/components/CreativesGrid'

const GO_LOCATION = 'uFiluYqG2MhvdLi1qRNj'

function fmt(date: string) {
  const [year, month, day] = date.slice(0, 10).split('-')
  return `${day}/${month}`
}

function ctrColor(v: number) {
  if (v >= 1)   return 'text-emerald-600'
  if (v >= 0.5) return 'text-amber-500'
  return 'text-rose-500'
}

// Card simplificado de criativo — sem dados financeiros
function CreativeCardPublic({ row }: { row: CreativeRow }) {
  const [showPreview, setShowPreview] = useState(false)
  const hasPreview = !!row.video_url

  return (
    <>
      {showPreview && row.video_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 w-full justify-between px-1">
              {row.video_id && (
                <a
                  href={`https://www.facebook.com/watch/?v=${row.video_id}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors shadow"
                >
                  Abrir com som
                </a>
              )}
              <button
                onClick={() => setShowPreview(false)}
                className="bg-white/20 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/30 transition-colors ml-auto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <iframe
              src={row.video_url}
              width="476" height="847" scrolling="yes"
              style={{ border: 'none', borderRadius: '12px', maxHeight: '80vh', maxWidth: '95vw' }}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
              title="Preview do criativo"
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
        <div
          className={`relative bg-gray-100 overflow-hidden ${hasPreview ? 'cursor-pointer group' : ''}`}
          style={{ aspectRatio: '4/5' }}
          onClick={() => hasPreview && setShowPreview(true)}
        >
          {row.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.thumbnail_url} alt={row.ad_name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {hasPreview && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-xl">
                <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
          {hasPreview && (
            <span className="absolute top-2.5 left-2.5 bg-black/55 text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              ver criativo
            </span>
          )}
        </div>

        <div className="p-3 flex flex-col gap-2.5 flex-1">
          <div>
            <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{row.ad_name}</p>
            {row.campaign_name && (
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">{row.campaign_name}</p>
            )}
          </div>

          {/* CTR em destaque */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">CTR</span>
            <span className={`text-lg font-bold tabular-nums ${ctrColor(row.ctr)}`}>
              {row.ctr.toFixed(2)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Impressões</p>
              <p className="font-semibold text-gray-700 mt-0.5">{row.impressions.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Cliques</p>
              <p className="font-semibold text-gray-700 mt-0.5">{row.inline_link_clicks.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function VolumePage() {
  const [days, setDays]               = useState(30)
  const [msgData, setMsgData]         = useState<any[]>([])
  const [contactData, setContactData] = useState<any[]>([])
  const [metaData, setMetaData]       = useState<any[]>([])
  const [creatives, setCreatives]     = useState<CreativeRow[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    setLoading(true)
    const loc = `location=${GO_LOCATION}`
    Promise.all([
      fetch(`/api/messages-per-day?days=${days}&${loc}`).then(r => r.json()),
      fetch(`/api/unique-contacts-per-day?days=${days}&${loc}`).then(r => r.json()),
      fetch(`/api/meta-insights?days=${days}&${loc}`).then(r => r.json()),
      fetch(`/api/meta-creatives?days=${days}&${loc}`).then(r => r.json()),
    ]).then(([msgs, contacts, meta, crtv]) => {
      setMsgData(Array.isArray(msgs) ? msgs : [])
      setContactData(Array.isArray(contacts) ? contacts : [])
      setMetaData(Array.isArray(meta) ? meta : [])
      setCreatives(Array.isArray(crtv) ? crtv : [])
      setLoading(false)
    })
  }, [days])

  // KPIs mensagens
  const totalInbound  = msgData.reduce((s, d) => s + (d.inbound_count  ?? 0), 0)
  const totalOutbound = msgData.reduce((s, d) => s + (d.outbound_count ?? 0), 0)
  const totalContacts = contactData.reduce((s, d) => s + (d.unique_contacts ?? 0), 0)
  const uniqueDays    = new Set(contactData.map((d: any) => d.day)).size || 1
  const avgPerDay     = Math.round(totalContacts / uniqueDays)

  // KPIs Meta (sem investimento)
  const totalImpressions   = metaData.reduce((s, d) => s + (d.impressions ?? 0), 0)
  const totalConversations = metaData.reduce((s, d) => s + (d.conversations_started ?? 0), 0)

  // Pivot mensagens por dia
  const msgByDay: Record<string, any> = {}
  for (const row of msgData) {
    const key = fmt(row.day)
    if (!msgByDay[key]) msgByDay[key] = { day: key, recebidas: 0, enviadas: 0 }
    msgByDay[key].recebidas += row.inbound_count  ?? 0
    msgByDay[key].enviadas  += row.outbound_count ?? 0
  }
  const msgChart = Object.values(msgByDay).sort((a, b) => a.day.localeCompare(b.day))

  // Pivot clientes por dia
  const contactByDay: Record<string, any> = {}
  for (const row of contactData) {
    const key = fmt(row.day)
    if (!contactByDay[key]) contactByDay[key] = { day: key, clientes: 0 }
    contactByDay[key].clientes += row.unique_contacts ?? 0
  }
  const contactChart = Object.values(contactByDay).sort((a, b) => a.day.localeCompare(b.day))

  // Pivot Meta por dia (impressões + conversas)
  const metaByDay: Record<string, any> = {}
  for (const row of metaData) {
    const key = fmt(row.date)
    if (!metaByDay[key]) metaByDay[key] = { day: key, impressoes: 0, conversas: 0 }
    metaByDay[key].impressoes += row.impressions          ?? 0
    metaByDay[key].conversas  += row.conversations_started ?? 0
  }
  const metaChart = Object.values(metaByDay).sort((a, b) => a.day.localeCompare(b.day))

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Casa Renata — Goiânia</h1>
              <p className="text-xs text-gray-400">volume de atendimento e anúncios</p>
            </div>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[7, 30].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  days === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >{d}d</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Carregando…</p>
          </div>
        ) : (
          <>
            {/* KPIs atendimento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">Clientes/dia</p>
                <p className="text-2xl font-bold text-violet-600">{avgPerDay.toLocaleString('pt-BR')}</p>
                <p className="text-[10px] text-gray-300 mt-0.5">média</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">Clientes únicos</p>
                <p className="text-2xl font-bold text-indigo-600">{totalContacts.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">Msg. recebidas</p>
                <p className="text-2xl font-bold text-emerald-600">{totalInbound.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">Msg. enviadas</p>
                <p className="text-2xl font-bold text-amber-500">{totalOutbound.toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {/* Clientes por dia */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Clientes por dia</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={contactChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="clientes" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Mensagens por dia */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Mensagens por dia</h2>
              <ResponsiveContainer width="100%" height={200}>
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

            {/* Meta Ads — sem investimento */}
            {metaData.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs text-gray-400 mb-1">Impressões (anúncios)</p>
                    <p className="text-2xl font-bold text-blue-600">{totalImpressions.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs text-gray-400 mb-1">Conversas iniciadas</p>
                    <p className="text-2xl font-bold text-emerald-600">{totalConversations.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Anúncios por dia</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={metaChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="impressoes" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="conversas"  fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Criativos de conversa — sem dados financeiros */}
            {(() => {
              const convCreatives = creatives.filter(c =>
                c.campaign_name?.toUpperCase().includes('WPP') ||
                c.campaign_name?.toUpperCase().includes('CONVERSA') ||
                c.campaign_name?.toUpperCase().includes('ENGAJAMENTO')
              )
              if (!convCreatives.length) return null
              return (
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Criativos</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {convCreatives.map(row => (
                      <CreativeCardPublic key={row.ad_id} row={row} />
                    ))}
                  </div>
                </div>
              )
            })()}
          </>
        )}
      </main>
    </div>
  )
}
