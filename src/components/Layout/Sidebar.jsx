import { useState, useEffect } from 'react'
import { gdriveYedekle, gdriveKurulu, gdriveBaslat, sonYedekZamani } from '../../store/gdrive'

function YedekButonu() {
  const [durum, setDurum] = useState('bosta') // bosta | yukleniyor | tamam | hata
  const [sonYedek, setSonYedek] = useState(sonYedekZamani())

  useEffect(() => {
    const t = setTimeout(() => gdriveBaslat(), 1500)
    return () => clearTimeout(t)
  }, [])

  if (!gdriveKurulu()) return null

  async function yedekle() {
    setDurum('yukleniyor')
    try {
      await gdriveYedekle()
      setDurum('tamam')
      setSonYedek(sonYedekZamani())
      setTimeout(() => setDurum('bosta'), 3000)
    } catch {
      setDurum('hata')
      setTimeout(() => setDurum('bosta'), 3000)
    }
  }

  const etiket = durum === 'yukleniyor' ? '⏳ Yedekleniyor…'
    : durum === 'tamam' ? '✅ Yedeklendi'
    : durum === 'hata' ? '❌ Hata'
    : '☁️ Drive Yedek'

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <button
        onClick={yedekle}
        disabled={durum === 'yukleniyor'}
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 8,
          background: durum === 'tamam' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: durum === 'tamam' ? '#4ADE80' : 'rgba(255,255,255,0.7)',
          fontSize: 12, fontWeight: 600, cursor: durum === 'yukleniyor' ? 'default' : 'pointer',
          textAlign: 'left',
        }}
      >
        {etiket}
      </button>
      {sonYedek && (
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5, paddingLeft: 2 }}>
          Son: {new Date(sonYedek).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ aktifSayfa, setSayfa }) {
  const navItems = [
    { id: 'ozet', label: 'Anasayfa', ikon: '🏠' },
    { id: 'sozlesmeli', label: 'Sözleşmeli', ikon: '🏢' },
    { id: 'sahsi', label: 'Şahsi', ikon: '💰' },
    { id: 'tarlalar', label: 'Tarlalar', ikon: '🌾' },
    { id: 'hasat', label: 'Hasat', ikon: '🚜' },
    { id: 'kisiler', label: 'Kişiler', ikon: '👥' },
    { id: 'raporlar', label: 'Raporlar', ikon: '📋' },
  ]

  return (
    <aside style={{
      width: 220,
      minHeight: '100dvh',
      background: '#0A5240',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>
          🌾 BEDLEK
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          Tarla Takip & Muhasebe
        </div>
      </div>

      {/* Nav */}
      <nav role="navigation" aria-label="Ana Menü" style={{ padding: '12px 0', flex: 1 }}>
        {navItems.map(item => {
          const aktif = aktifSayfa === item.id
          return (
            <button
              key={item.id}
              onClick={() => setSayfa(item.id)}
              aria-current={aktif ? 'page' : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                background: aktif ? 'rgba(255,255,255,0.12)' : 'none',
                border: 'none',
                borderLeft: aktif ? '3px solid #4ADE80' : '3px solid transparent',
                color: aktif ? '#fff' : 'rgba(255,255,255,0.6)',
                fontSize: 14,
                fontWeight: aktif ? 700 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 18 }}>{item.ikon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <YedekButonu />

      {/* Alt bilgi */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
      }}>
        Bedlek Tarım v1.0
      </div>
    </aside>
  )
}
