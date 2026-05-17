import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import TabNav from './TabNav'
import Header from './Header'
import { sezonlariOku, aktifSezonu, sezonEkle } from '../../store/db'

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

const SAYFA_ADLARI = {
  ozet: 'Genel Özet',
  sozlesmeli: 'Sözleşmeli Tarım',
  sahsi: 'Şahsi Üretim',
  tarlalar: 'Tarlalar',
  hasat: 'Hasat & Teslimat',
  kisiler: 'Kişiler',
  raporlar: 'Raporlar',
}

function DesktopHeader({ sezon, onSezonDegis, sayfa }) {
  const [seciciAcik, setSeciciAcik] = useState(false)
  const [yeniAd, setYeniAd] = useState('')
  const sezonlar = sezonlariOku()

  function sezonSec(id) {
    aktifSezonu(id)
    onSezonDegis(id)
    setSeciciAcik(false)
  }

  function yeniSezonEkle() {
    if (!yeniAd.trim()) return
    const yeni = sezonEkle({
      id: yeniAd.trim().replace(/\s+/g, '_').toLowerCase(),
      ad: yeniAd.trim(),
      baslangic: `${new Date().getFullYear()}-01-01`,
      bitis: `${new Date().getFullYear()}-12-31`,
      aktif: true,
    })
    sezonSec(yeni.id)
    setYeniAd('')
  }

  return (
    <>
      <header style={{
        background: '#fff',
        borderBottom: '1px solid var(--kenar)',
        padding: '0 28px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--yazi)' }}>
          {SAYFA_ADLARI[sayfa] || ''}
        </h1>
        <button
          onClick={() => setSeciciAcik(v => !v)}
          style={{
            background: 'var(--yesil-acik)', border: '1.5px solid var(--yesil)',
            borderRadius: 8, color: 'var(--yesil)', padding: '7px 14px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          🗓 {sezon?.ad || 'Sezon'} ▾
        </button>
      </header>

      {seciciAcik && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100 }}
          onClick={() => setSeciciAcik(false)}
        >
          <div
            style={{
              position: 'absolute', top: 60, right: 28,
              background: '#fff', borderRadius: 12, padding: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)', minWidth: 220,
            }}
            onClick={e => e.stopPropagation()}
          >
            {sezonlar.map(s => (
              <button key={s.id} onClick={() => sezonSec(s.id)} style={{
                width: '100%', textAlign: 'left', padding: '10px 12px',
                background: sezon?.id === s.id ? 'var(--yesil-acik)' : 'none',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                fontWeight: sezon?.id === s.id ? 700 : 400,
                color: sezon?.id === s.id ? 'var(--yesil)' : 'var(--yazi)',
                fontSize: 14, marginBottom: 4, display: 'block',
              }}>{s.ad}</button>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input
                value={yeniAd} onChange={e => setYeniAd(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && yeniSezonEkle()}
                placeholder="Yeni sezon..."
                style={{
                  flex: 1, padding: '8px 10px', border: '1.5px solid var(--kenar)',
                  borderRadius: 7, fontSize: 13,
                }}
              />
              <button onClick={yeniSezonEkle} style={{
                background: 'var(--yesil)', color: '#fff', border: 'none',
                borderRadius: 7, padding: '8px 12px', cursor: 'pointer', fontWeight: 700,
              }}>+</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Layout({ sayfa, setSayfa, sezon, onSezonDegis, children }) {
  const isDesktop = useDesktop()

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100dvh' }}>
        <Sidebar aktifSayfa={sayfa} setSayfa={setSayfa} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <DesktopHeader sezon={sezon} onSezonDegis={onSezonDegis} sayfa={sayfa} />
          <main style={{ flex: 1, overflowY: 'auto', background: 'var(--zemin)' }}>
            {children}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Header sezon={sezon} onSezonDegis={onSezonDegis} />
      <main style={{ flex: 1, paddingBottom: 80, overflowY: 'auto' }}>
        {children}
      </main>
      <TabNav aktifSayfa={sayfa} setSayfa={setSayfa} />
    </div>
  )
}
