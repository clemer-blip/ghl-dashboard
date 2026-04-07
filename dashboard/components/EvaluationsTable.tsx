'use client'

import type { EvaluationRow } from '@/lib/supabase'
import { formatDuration, formatDateTime } from '@/lib/formatters'

export default function EvaluationsTable({ data }: { data: EvaluationRow[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-700">Avaliação de conversas</h2>
        <span className="text-xs text-gray-400">
          {data.filter((r) => r.ai_evaluation).length} avaliadas de {data.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="border-b text-left text-xs text-gray-400 uppercase tracking-wide">
              <th className="pb-2 pr-4 font-medium">Contato</th>
              <th className="pb-2 pr-4 font-medium">Canal</th>
              <th className="pb-2 pr-4 font-medium">Status</th>
              <th className="pb-2 pr-4 font-medium">1ª Resposta</th>
              <th className="pb-2 pr-4 font-medium">Msgs</th>
              <th className="pb-2 pr-4 font-medium">Avaliação IA</th>
              <th className="pb-2 font-medium">Última msg</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4 font-medium">
                  {row.contact_name ?? row.contact_phone ?? '—'}
                </td>
                <td className="py-3 pr-4 text-gray-500">{row.channel ?? '—'}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.status === 'open'
                        ? 'bg-green-100 text-green-700'
                        : row.status === 'unread'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {row.status ?? '—'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-500">
                  {row.first_response_seconds != null
                    ? formatDuration(row.first_response_seconds)
                    : '—'}
                </td>
                <td className="py-3 pr-4 text-gray-500">{row.message_count}</td>
                <td className="py-3 pr-4">
                  {row.ai_evaluation ? (
                    <span className="text-indigo-600">{row.ai_evaluation}</span>
                  ) : (
                    <span className="text-gray-300 italic">pendente</span>
                  )}
                </td>
                <td className="py-3 text-xs text-gray-400">
                  {row.last_message_at ? formatDateTime(row.last_message_at) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
