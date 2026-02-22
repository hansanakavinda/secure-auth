'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastMessage {
  id: string
  variant: ToastVariant
  message: string
  /** milliseconds remaining when the toast was last resumed */
  remaining: number
  /** whether the countdown is paused (mouse hover) */
  paused: boolean
  /** whether the exit animation is playing */
  exiting: boolean
}

interface ToastContextValue {
  toast: {
    success: (message: string) => void
    error: (message: string) => void
    warning: (message: string) => void
    info: (message: string) => void
  }
}

const TOAST_DURATION = 10_000 // 10 seconds auto-dismiss

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>')
  }
  return ctx.toast
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((variant: ToastVariant, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setToasts((prev) => [
      ...prev,
      { id, variant, message, remaining: TOAST_DURATION, paused: false, exiting: false },
    ])
  }, [])

  const removeToast = useCallback((id: string) => {
    // trigger exit animation first
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    )
    // remove after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  const pauseToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, paused: true } : t)),
    )
  }, [])

  const resumeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, paused: false } : t)),
    )
  }, [])

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    warning: (msg: string) => addToast('warning', msg),
    info: (msg: string) => addToast('info', msg),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — fixed top-right */}
      <div
        aria-live="polite"
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
        style={{ maxWidth: 420 }}
      >
        {toasts.map((t) => (
          <ToastCard
            key={t.id}
            toast={t}
            onClose={() => removeToast(t.id)}
            onPause={() => pauseToast(t.id)}
            onResume={() => resumeToast(t.id)}
            onExpire={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/*  Variant config                                                     */
/* ------------------------------------------------------------------ */

const VARIANT_STYLES: Record<
  ToastVariant,
  { bg: string; border: string; icon: string; iconBg: string; progressColor: string }
> = {
  success: {
    bg: 'bg-white',
    border: 'border-[#2D5A27]/20',
    icon: '✓',
    iconBg: 'bg-[#2D5A27]',
    progressColor: '#2D5A27',
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-200',
    icon: '✕',
    iconBg: 'bg-red-600',
    progressColor: '#dc2626',
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200',
    icon: '⚠',
    iconBg: 'bg-amber-500',
    progressColor: '#f59e0b',
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    icon: 'ℹ',
    iconBg: 'bg-blue-500',
    progressColor: '#3b82f6',
  },
}

/* ------------------------------------------------------------------ */
/*  Individual toast card                                              */
/* ------------------------------------------------------------------ */

interface ToastCardProps {
  toast: ToastMessage
  onClose: () => void
  onPause: () => void
  onResume: () => void
  onExpire: () => void
}

function ToastCard({ toast, onClose, onPause, onResume, onExpire }: ToastCardProps) {
  const style = VARIANT_STYLES[toast.variant]
  const remainingRef = useRef(toast.remaining)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* ---------- countdown logic ---------- */
  useEffect(() => {
    if (toast.paused) {
      // stop counting when paused
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    // tick every 100ms
    timerRef.current = setInterval(() => {
      remainingRef.current -= 100
      if (remainingRef.current <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        onExpire()
      }
    }, 100)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [toast.paused, onExpire])

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 rounded-xl border
        ${style.bg} ${style.border}
        px-4 py-3 shadow-lg
        ${toast.exiting ? 'toast-slide-out' : 'toast-slide-in'}
      `}
      style={{ minWidth: 320 }}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      role="alert"
    >
      {/* Icon */}
      <span
        className={`
          flex h-7 w-7 shrink-0 items-center justify-center rounded-full
          text-white text-sm font-bold ${style.iconBg}
        `}
      >
        {style.icon}
      </span>

      {/* Message */}
      <p className="flex-1 pt-0.5 text-sm text-[#4B3621] leading-snug">{toast.message}</p>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Close notification"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[3px] rounded-b-xl"
        style={{
          background: style.progressColor,
          animation: `toast-progress ${TOAST_DURATION}ms linear forwards`,
          animationPlayState: toast.paused ? 'paused' : 'running',
          width: '100%',
        }}
      />
    </div>
  )
}
