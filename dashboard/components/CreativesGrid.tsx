'use client'

import { useState } from 'react'

export type CreativeRow = {
  ad_id: string
  ad_name: string
  campaign_name: string | null
  adset_name: string | null
  thumbnail_url: string | null
  video_url: string | null
  video_id: string | null
  location_id: string
  spend: number
  impressions: number
  reach: number
  inline_link_clicks: number
  video_3sec_watched: number
  video_p75_watched: number
  hook_rate: number
  view_75: number
  ctr: number
}

const LOCATION_LABELS: Record<string, string> = {
  'NpYMLlXhYhsazq0i03ZV': 'SP',
  'uFiluYqG2MhvdLi1qRNj': 'GO',
}
const LOC_COLORS: Record<string, string> = {
  'NpYMLlXhYhsazq0i03ZV': '#6366f1',
  'uFiluYqG2MhvdLi1qRNj': '#10b981',
}

type SortKey = 'spend' | 'ctr' | 'impressions' | 'cpm' | 'cpc'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'spend',       label: 'Investimento' },
  { key: 'impressions', label: 'Impressões' },
  { key: 'ctr',         label: 'CTR' },
  { key: 'cpm',         label: 'CPM' },
  { key: 'cpc',         label: 'CPC' },
]

function ctrColor(v: number) {
  if (v >= 1)   return 'text-emerald-600'
  if (v >= 0.5) return 'text-amber-500'
  return 'text-rose-500'
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function PreviewModal({ url, videoId, onClose }: { url: string; videoId: string | null; onClose: () => void }) {
  const watchUrl = videoId ? `https://www.facebook.com/watch/?v=${videoId}` : null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-transparent flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de ações */}
        <div className="flex items-center gap-2 w-full justify-between px-1">
          {watchUrl && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors shadow"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072M12 18.364A9 9 0 1112 5.636M12 12v.01" />
              </svg>
              Abrir com som
            </a>
          )}
          <button
            onClick={onClose}
            className="bg-white/20 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <iframe
          src={url}
          width="476"
          height="847"
          scrolling="yes"
          style={{ border: 'none', borderRadius: '12px', maxHeight: '80vh', maxWidth: '95vw' }}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          title="Preview do criativo"
        />
      </div>
    </div>
  )
}

function CreativeCard({ row }: { row: CreativeRow }) {
  const [showPreview, setShowPreview] = useState(false)
  const locLabel = LOCATION_LABELS[row.location_id] ?? row.location_id.slice(0, 4)
  const locColor = LOC_COLORS[row.location_id] ?? '#6366f1'
  const hasPreview = !!row.video_url
  const cpm = row.impressions > 0 ? (row.spend / row.impressions) * 1000 : 0
  const cpc = row.inline_link_clicks > 0 ? row.spend / row.inline_link_clicks : 0

  return (
    <>
      {showPreview && row.video_url && (
        <PreviewModal url={row.video_url} videoId={row.video_id} onClose={() => setShowPreview(false)} />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
        {/* Thumbnail */}
        <div
          className={`relative bg-gray-100 overflow-hidden ${hasPreview ? 'cursor-pointer group' : ''}`}
          style={{ aspectRatio: '4/5' }}
          onClick={() => hasPreview && setShowPreview(true)}
        >
          {row.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.thumbnail_url}
              alt={row.ad_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 h-full text-center p-4">
              <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-300">sem prévia</span>
            </div>
          )}

          {/* Overlay de play */}
          {hasPreview && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-xl">
                <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Badges */}
          <span
            className="absolute top-2.5 right-2.5 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow"
            style={{ backgroundColor: locColor }}
          >
            {locLabel}
          </span>
          {hasPreview && (
            <span className="absolute top-2.5 left-2.5 bg-black/55 text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              ver criativo
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-2.5 flex-1">
          {/* Nome */}
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

          {/* Métricas secundárias */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Investimento</p>
              <p className="font-semibold text-gray-700 mt-0.5">{brl(row.spend)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Impressões</p>
              <p className="font-semibold text-gray-700 mt-0.5">{row.impressions.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide font-medium">CPM</p>
              <p className="font-semibold text-gray-700 mt-0.5">{brl(cpm)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide font-medium">CPC</p>
              <p className="font-semibold text-gray-700 mt-0.5">{cpc > 0 ? brl(cpc) : '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CreativesGrid({ data }: { data: CreativeRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('spend')

  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-gray-400">Nenhum criativo encontrado no período.</p>
        <p className="text-xs text-gray-300 mt-1">O sync roda uma vez por dia.</p>
      </div>
    )
  }

  // CPM e CPC calculados para ordenação
  const withCalc = data.map((d) => ({
    ...d,
    cpm: d.impressions > 0 ? (d.spend / d.impressions) * 1000 : 0,
    cpc: d.inline_link_clicks > 0 ? d.spend / d.inline_link_clicks : 0,
  }))

  const sorted = [...withCalc].sort((a, b) => {
    if (sortKey === 'cpm') return b.cpm - a.cpm
    if (sortKey === 'cpc') return b.cpc - a.cpc
    return (b[sortKey] as number) - (a[sortKey] as number)
  })

  // KPIs de topo
  const totalSpend       = data.reduce((s, d) => s + d.spend, 0)
  const totalImpressions = data.reduce((s, d) => s + d.impressions, 0)
  const totalClicks      = data.reduce((s, d) => s + d.inline_link_clicks, 0)
  const avgCTR           = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const bestCTR          = data.reduce((best, d) => d.ctr > best.ctr ? d : best, data[0])

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">Investimento total</p>
          <p className="text-xl font-bold text-indigo-600">{brl(totalSpend)}</p>
          <p className="text-[10px] text-gray-300 mt-0.5">{data.length} criativos</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">Impressões totais</p>
          <p className="text-xl font-bold text-blue-600">{totalImpressions.toLocaleString('pt-BR')}</p>
          <p className="text-[10px] text-gray-300 mt-0.5">{totalClicks.toLocaleString('pt-BR')} cliques</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">CTR médio</p>
          <p className={`text-xl font-bold ${ctrColor(avgCTR)}`}>{avgCTR.toFixed(2)}%</p>
          <p className="text-[10px] text-gray-300 mt-0.5">cliques / impressões</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">Melhor CTR</p>
          <p className={`text-xl font-bold ${ctrColor(bestCTR.ctr)}`}>{bestCTR.ctr.toFixed(2)}%</p>
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{bestCTR.ad_name}</p>
        </div>
      </div>

      {/* Ordenação */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 font-medium">Ordenar por:</span>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                sortKey === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {sorted.map((row) => (
          <CreativeCard key={row.ad_id} row={row} />
        ))}
      </div>
    </div>
  )
}
