import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label:   string
  value:   string | number
  icon:    LucideIcon
  color?:  'navy' | 'gold' | 'green' | 'gray'
  sub?:    string
}

const colors = {
  navy:  { bg: 'bg-navy/8',  icon: 'text-navy',  val: 'text-navy'  },
  gold:  { bg: 'bg-gold/10', icon: 'text-gold',  val: 'text-gold'  },
  green: { bg: 'bg-green-50',icon: 'text-green-600', val: 'text-green-700' },
  gray:  { bg: 'bg-gray-100',icon: 'text-gray-500',  val: 'text-gray-800' },
}

export default function StatCard({ label, value, icon: Icon, color = 'navy', sub }: StatCardProps) {
  const c = colors[color]
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={cn('p-2.5 rounded-lg', c.bg)}>
        <Icon size={20} className={c.icon} />
      </div>
      <div>
        <p className="text-gray-400 text-xs font-medium mb-0.5">{label}</p>
        <p className={cn('text-2xl font-bold', c.val)}>{value}</p>
        {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
