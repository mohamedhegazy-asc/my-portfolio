import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 end-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-[#222936] text-[#E0F6C4] border border-[#374159] shadow-xl text-xs sm:text-sm"
          >
            {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#B9D895] shrink-0" />}
            {item.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {item.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span className="flex-1 font-medium">{item.message}</span>
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="text-[#E0F6C4]/50 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  return ctx || { addToast: () => {} }
}
