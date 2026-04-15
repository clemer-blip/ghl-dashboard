'use client'

import { useState } from 'react'

export type CreativeRow = {
  ad_id: string
  ad_name: string
  campaign_name: string | null
  adset_name: string | null
  thumbnail_url: string | null
  video_url: string | null
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

type SortKey = 'spend' | 'hook_rate' | 'view_75' | 'ctr' | 'impressions'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'spend',      label: 'Investimento' },
  { key: 'hook_rate',  label: 'Hook Rate' },
  { key: 'view_75',    label: 'View 75%' },
  { key: 'ctr',        label: 'CTR' },
  { key: 'impressions', label: 'Impressões' },
]

// Benchmarks de desempenho (Meta video ads)
function hookRateColor(v: number) {
  if (v >= 30) return 'text-emerald-600'
  if (v >= 15) return 'text-amber-500'
  return 'text-rose-500'
}
function view75Color(v: number) {
  if (v >= 20) return 'text-emerald-600'
  if (v >= 10) return 'text-amber-500'
  return 'text-rose-500'
}
function ctrColor(v: number) {
  if (v >= 1)   return 'text-emerald-600'
  if (v >= 0.5) return 'text-amber-500'
  return 'text-rose-500'
}

function MetricBadge({
  label,
  value,
  colorFn,
  suffix = '%',
}: {
  label: string
  value: number
  colorFn: (v: number) => string
  suffix?: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-lg font-bold tabular-nums leading-none ${colorFn(value)}`}>
        {value.toFixed(1)}{suffix}
      </span>
      <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
    </div>
  )
}

function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-black rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <video
          src={url}
          controls
          autoPlay
          className="w-full"
          style={{ maxHeight: '80vh' }}
        />
      </div>
    </div>
  )
}

function CreativeCard({ row }: { row: CreativeRow }) {
  const [showVideo, setShowVideo] = useState(false)
  const locLabel = LOCATION_LABELS[row.location_id] ?? row.location_id.slice(0, 4)
  const locColor = LOC_COLORS[row.location_id] ?? '#6366f1'
  const hasVideo = !!row.video_url

  return (
    <>
      {showVideo && row.video_url && (
        <VideoModal url={row.video_url} onClose={() => setShowVideo(false)} />
      )}
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div
        className={`relative bg-gray-100 aspect-video flex items-center justify-center overflow-hidden ${hasVideo ? 'cursor-pointer group' : ''}`}
        onClick={() => hasVideo && setShowVideo(true)}
      >
        {row.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.thumbnail_url}
            alt={row.ad_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-400">sem prévia</span>
          </div>
        )}

        {/* Botão de play — só aparece se tiver vídeo */}
        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Badge de unidade */}
        <span
          className="absolute top-2 right-2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: locColor }}
        >
          {locLabel}
        </span>

        {/* Badge de vídeo */}
        {hasVideo && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            vídeo
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-3 flex-1">
        {/* Nome do ad */}
        <div>
          <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{row.ad_name}</p>
          {row.campaign_name && (
            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{row.campaign_name}</p>
          )}
        </div>

        {/* As 3 métricas principais */}
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <MetricBadge label="Hook Rate"  value={row.hook_rate} colorFn={hookRateColor} />
          <MetricBadge label="View 75%"   value={row.view_75}   colorFn={view75Color} />
          <MetricBadge label="CTR"        value={row.ctr}       colorFn={ctrColor} />
        </div>

        {/* Métricas secundárias */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs border-t border-gray-50 pt-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Investimento</span>
            <span className="font-medium text-gray-700">
              {row.spend.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Impressões</span>
            <span className="font-medium text-gray-700">
              {row.impressions.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Alcance</span>
            <span className="font-medium text-gray-700">
              {row.reach.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Cliques</span>
            <span className="font-medium text-gray-700">
              {row.inline_link_clicks.toLocaleString('pt-BR')}
            </span>
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
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-gray-400">Nenhum criativo encontrado no período.</p>
        <p className="text-xs text-gray-300 mt-1">O sync de criativos roda uma vez por dia.</p>
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b[sortKey] - a[sortKey])

  // KPIs de topo
  const totalSpend = data.reduce((s, d) => s + d.spend, 0)
  const totalImpressions = data.reduce((s, d) => s + d.impressions, 0)
  const bestHookRate = data.reduce((best, d) => d.hook_rate > best.hook_rate ? d : best, data[0])
  const bestCTR      = data.reduce((best, d) => d.ctr > best.ctr ? d : best, data[0])

  return (
    <div className="space-y-5">
      {/* KPIs de topo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">Investimento total</p>
          <p className="text-xl font-bold text-indigo-600">
            {totalSpend.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-xs text-gray-300 mt-0.5">{data.length} criativos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">Impressões totais</p>
          <p className="text-xl font-bold text-blue-600">
            {totalImpressions.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">Melhor Hook Rate</p>
          <p className="text-xl font-bold text-emerald-600">{bestHookRate.hook_rate.toFixed(1)}%</p>
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{bestHookRate.ad_name}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">Melhor CTR</p>
          <p className="text-xl font-bold text-amber-500">{bestCTR.ctr.toFixed(2)}%</p>
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{bestCTR.ad_name}</p>
        </div>
      </div>

      {/* Controles de ordenação */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 font-medium">Ordenar por:</span>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
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

      {/* Grid de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map((row) => (
          <CreativeCard key={row.ad_id} row={row} />
        ))}
      </div>

      {/* Legenda de benchmarks */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Referência de desempenho</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <p className="font-medium text-gray-600 mb-1">Hook Rate (3s / impressões)</p>
            <div className="space-y-0.5">
              <p><span className="text-emerald-600 font-semibold">≥ 30%</span> — excelente</p>
              <p><span className="text-amber-500 font-semibold">15–30%</span> — bom</p>
              <p><span className="text-rose-500 font-semibold">&lt; 15%</span> — baixo</p>
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">View 75% (p75 / impressões)</p>
            <div className="space-y-0.5">
              <p><span className="text-emerald-600 font-semibold">≥ 20%</span> — excelente</p>
              <p><span className="text-amber-500 font-semibold">10–20%</span> — bom</p>
              <p><span className="text-rose-500 font-semibold">&lt; 10%</span> — baixo</p>
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">CTR (cliques / impressões)</p>
            <div className="space-y-0.5">
              <p><span className="text-emerald-600 font-semibold">≥ 1%</span> — excelente</p>
              <p><span className="text-amber-500 font-semibold">0,5–1%</span> — bom</p>
              <p><span className="text-rose-500 font-semibold">&lt; 0,5%</span> — baixo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
