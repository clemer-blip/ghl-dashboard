'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CreativesGrid, { type CreativeRow } from '@/components/CreativesGrid'

const LOCATION_LABELS: Record<string, string> = {
  'NpYMLlXhYhsazq0i03ZV': 'São Paulo',
  'uFiluYqG2MhvdLi1qRNj': 'Goiânia',
}

const LOCATIONS = Object.entries(LOCATION_LABELS).map(([id, label]) => ({ id, label }))

export default function CriativosPage() {
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [days, setDays] = useState<number | null>(30)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd]     = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [data, setData]       = useState<CreativeRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const loc = selectedLocation !== 'all' ? `&location=${selectedLocation}` : ''
    const dateParams = customStart && customEnd
      ? `start=${customStart}&end=${customEnd}`
      : `days=${days ?? 30}`

    fetch(`/api/meta-creatives?${dateParams}${loc}`)
      .then((r) => r.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedLocation, days, customStart, customEnd])

  const periodLabel = customStart && customEnd
    ? `${customStart.slice(5).replace('-', '/')} a ${customEnd.slice(5).replace('-', '/')}`
    : `últimos ${days} dias`

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* Link de volta */}
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Voltar ao dashboard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Criativos</h1>
              <p className="text-xs text-gray-400">Casa Renata — análise de desempenho</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Seletor de unidade */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedLocation('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedLocation === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Todas
              </button>
              {LOCATIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedLocation(id)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedLocation === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

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
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Até</label>
                      <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    </div>
                  </div>
                  <button
                    onClick={() => { if (customStart && customEnd) { setDays(null); setShowDatePicker(false) } }}
                    disabled={!customStart || !customEnd}
                    className="w-full bg-violet-600 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

      <main className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Carregando criativos…</p>
          </div>
        ) : (
          <CreativesGrid data={data} />
        )}
      </main>
    </div>
  )
}
