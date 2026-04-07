'use client'

import dynamic from 'next/dynamic'

const DashboardClient = dynamic(
  () => import('@/components/DashboardClient'),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-screen text-gray-400">
      Carregando...
    </div>
  )}
)

export default function DashboardLoader() {
  return <DashboardClient />
}
