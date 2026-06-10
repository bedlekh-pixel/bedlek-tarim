import { useState, useEffect, useRef } from 'react'
import { gdriveYedekle, gdriveKurulu, gdriveBaslat, sonYedekZamani } from '../../store/gdrive'
import { YEDEK_KEYLERI, tumVeriyiGeriYukle } from '../../store/db'

function YedekButonu() {
  const [durum, setDurum] = useState('bosta') // bosta | yukleniyor | tamam | hata
  const [sonYedek, setSonYedek] = useState(sonYedekZamani())
  const [hataMesaji, setHataMesaji] = useState('')

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
    } catch (e) {
      console.error('Drive yedek hatası:', e.message)
      setDurum('hata')
      setHataMesaji(e.message)
      setTimeout(() => { setDurum('bosta'); setHataMesaji('') }, 5000)
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
      {hataMesaji && (
        <div style={{ fontSize: 10, color: '#FCA5A5', marginTop: 5, paddingLeft: 2 }}>
          {hataMesaji}
        </div>
      )}
      {!hataMesaji && sonYedek && (
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5, paddingLeft: 2 }}>
          Son: {new Date(sonYedek).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  )
}

function GeriYukleButonu() {
  const [durum, setDurum] = useState('bosta') // bosta | yukleniyor | tamam | hata
  const [hataMesaji, setHataMesaji] = useState('')
  const inputRef = useRef(null)

  function dosyaSec() {
    inputRef.current?.click()
  }

  async function dosyaSecildi(e) {
    const dosya = e.target.files[0]
    e.target.value = ''
    if (!dosya) return

    try {
      const metin = await dosya.text()
      const veri = JSON.parse(metin)

      const gecerli = YEDEK_KEYLERI.some(k => k in veri)
      if (!gecerli) throw new Error('Bu dosya geçerli bir yedek dosyası değil')

      const hareketSayisi = veri.bt_hareketler?.length ?? 0
      const tarlaSayisi = veri.bt_tarlalar?.length ?? 0
      const onay = window.confirm(
        `Bu yedekte ${hareketSayisi} hareket ve ${tarlaSayisi} tarla kaydı var.\n\n` +
        `DİKKAT: Mevcut tüm veriler bu yedekteki verilerle değiştirilecek ve bu işlem geri alınamaz.\n\n` +
        `Devam etmek istiyor musunuz?`
      )
      if (!onay) return

      setDurum('yukleniyor')
      await tumVeriyiGeriYukle(veri)
      setDurum('tamam')
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setDurum('hata')
      setHataMesaji(err.message)
      setTimeout(() => { setDurum('bosta'); setHataMesaji('') }, 5000)
    }
  }

  const etiket = durum === 'yukleniyor' ? '⏳ Geri yükleniyor…'
    : durum === 'tamam' ? '✅ Geri yüklendi'
    : durum === 'hata' ? '❌ Hata'
    : '↩️ Yedekten Geri Yükle'

  return (
    <div style={{ padding: '0 16px 12px' }}>
      <input ref={inputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={dosyaSecildi} />
      <button
        onClick={dosyaSec}
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
      {hataMesaji && (
        <div style={{ fontSize: 10, color: '#FCA5A5', marginTop: 5, paddingLeft: 2 }}>
          {hataMesaji}
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
      <GeriYukleButonu />

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
