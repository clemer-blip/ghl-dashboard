'use client'

import { formatDuration, formatDateTime } from '@/lib/formatters'

type ConvRow = {
  id: string
  contact_name: string | null
  contact_phone: string | null
  channel: string | null
  status: string | null
  last_message_at: string | null
  last_message_body: string | null
  first_response_seconds: number | null
}

const statusLabel: Record<string, { label: string; cls: string }> = {
  open:   { label: 'Aberta',   cls: 'bg-green-100 text-green-700' },
  unread: { label: 'Não lida', cls: 'bg-yellow-100 text-yellow-700' },
  closed: { label: 'Fechada',  cls: 'bg-gray-100 text-gray-500' },
}

export default function LatestConversationsList({ data }: { data: ConvRow[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-700">Últimas conversas</h2>
        <span className="text-xs text-gray-400">{data.length} conversas</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="border-b text-left text-xs text-gray-400 uppercase tracking-wide">
              <th className="pb-2 pr-4 font-medium">Contato</th>
              <th className="pb-2 pr-4 font-medium">Última mensagem</th>
              <th className="pb-2 pr-4 font-medium">Status</th>
              <th className="pb-2 pr-4 font-medium">1ª Resposta</th>
              <th className="pb-2 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const st = row.status ? (statusLabel[row.status] ?? { label: row.status, cls: 'bg-gray-100 text-gray-500' }) : null
              return (
                <tr key={row.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="font-medium leading-tight">{row.contact_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{row.contact_phone ?? ''}</p>
                  </td>
                  <td className="py-3 pr-4 max-w-xs">
                    <p className="text-gray-600 truncate text-xs">
                      {row.last_message_body ?? <span className="italic text-gray-300">sem texto</span>}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    {st && (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">
                    {row.first_response_seconds != null ? formatDuration(row.first_response_seconds) : '—'}
                  </td>
                  <td className="py-3 text-xs text-gray-400">
                    {row.last_message_at ? formatDateTime(row.last_message_at) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
