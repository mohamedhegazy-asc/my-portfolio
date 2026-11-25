import React from 'react'
import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-[#222936]">{title}</h3>
      {description && <p className="text-xs text-gray-500 max-w-sm mx-auto">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
