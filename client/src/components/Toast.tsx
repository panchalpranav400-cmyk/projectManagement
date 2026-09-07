import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToast, type ToastType } from '../context/ToastContext'

const ICONS: Record<ToastType, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const ACCENT: Record<ToastType, string> = {
  success: 'text-emerald-300',
  error: 'text-red-300',
  info: 'text-brand-2',
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-xs flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="liquid-glass pointer-events-auto flex items-start gap-2 rounded-xl px-4 py-3 text-sm text-white/90"
              style={{ backgroundColor: 'rgba(17,17,20,0.92)' }}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${ACCENT[t.type]}`} />
              <p className="flex-1">{t.message}</p>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-white/30 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
