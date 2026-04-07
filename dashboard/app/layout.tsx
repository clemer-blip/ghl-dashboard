import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GHL Dashboard',
  description: 'Conversations analytics for Go High Level',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
