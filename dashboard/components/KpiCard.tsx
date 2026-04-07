type Color = 'indigo' | 'emerald' | 'amber' | 'violet'

const colorMap: Record<Color, { bg: string; text: string; icon: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'bg-indigo-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', icon: 'bg-violet-100' },
}

type KpiCardProps = {
  title: string
  value: string
  subtitle?: string
  color?: Color
}

export default function KpiCard({ title, value, subtitle, color = 'indigo' }: KpiCardProps) {
  const c = colorMap[color]
  return (
    <div className={`rounded-xl border border-gray-100 p-5 ${c.bg}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${c.text}`}>{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </div>
  )
}
