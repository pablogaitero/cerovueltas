import { Bell } from 'lucide-react'

interface TopbarProps {
  title: string
  subtitle?: string
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
      <div>
        <h1 className="font-display text-xl text-navy">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      <button className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />
      </button>
    </div>
  )
}
