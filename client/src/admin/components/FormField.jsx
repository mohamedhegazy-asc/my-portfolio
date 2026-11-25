import React from 'react'

export default function FormField({ label, error, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-[#222936]">
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  )
}
