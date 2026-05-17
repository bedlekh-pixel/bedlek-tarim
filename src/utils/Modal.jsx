import { useEffect, useState } from 'react'

function useDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = e => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

// Tüm formlarda kullanılacak evrensel modal wrapper
export default function Modal({ onKapat, children, genislik = 520 }) {
  const isDesktop = useDesktop()

  // ESC ile kapat
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onKapat() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onKapat])

  return (
    <div
      onClick={onKapat}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        zIndex: 200, display: 'flex',
        alignItems: isDesktop ? 'center' : 'flex-end',
        justifyContent: 'center',
        padding: isDesktop ? 24 : 0,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--zemin)',
          width: '100%',
          maxWidth: isDesktop ? genislik : '100%',
          borderRadius: isDesktop ? 16 : '20px 20px 0 0',
          maxHeight: isDesktop ? '90dvh' : '92dvh',
          overflowY: 'auto',
          boxShadow: isDesktop ? '0 20px 60px rgba(0,0,0,0.25)' : 'none',
          paddingBottom: isDesktop ? 0 : 'max(24px, env(safe-area-inset-bottom, 24px))',
        }}
      >
        {children}
      </div>
    </div>
  )
}
