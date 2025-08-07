'use client'

import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'
import { RootState } from '@/store/store'
import { removeToast } from '@/store/slices/uiSlice'

export function ToastContainer() {
  const toasts = useSelector((state: RootState) => state.ui.toasts)
  const dispatch = useDispatch()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={() => dispatch(removeToast(toast.id))} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }: { toast: any; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onRemove])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  }

  const Icon = icons[toast.type]

  return (
    <div className={`max-w-sm w-full border rounded-lg p-4 shadow-lg ${colors[toast.type]}`}>
      <div className="flex items-start">
        <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium">{toast.title}</h4>
          {toast.message && <p className="mt-1 text-sm opacity-90">{toast.message}</p>}
        </div>
        <button
          onClick={onRemove}
          className="ml-3 flex-shrink-0 opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
