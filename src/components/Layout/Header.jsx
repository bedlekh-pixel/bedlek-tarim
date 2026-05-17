import { sezonlariOku, aktifSezonu, sezonEkle } from '../../store/db'
import { useState } from 'react'

export default function Header({ sezon, onSezonDegis }) {
  const [seciciAcik, setSeciciAcik] = useState(false)
  const [yeniSezonAcik, setYeniSezonAcik] = useState(false)
  const [yeniAd, setYeniAd] = useState('')
  const sezonlar = sezonlariOku()

  function sezonSec(id) {
    aktifSezonu(id)
    onSezonDegis(id)
    setSeciciAcik(false)
  }

  function yeniSezonEkle() {
    if (!yeniAd.trim()) return
    const yil = yeniAd.trim()
    const yeni = sezonEkle({
      id: yil.replace(/\s+/g, '_').toLowerCase(),
      ad: yil,
      baslangic: `${new Date().getFullYear()}-01-01`,
      bitis: `${new Date().getFullYear()}-12-31`,
      aktif: true,
    })
    sezonSec(yeni.id)
    setYeniAd('')
    setYeniSezonAcik(false)
  }

  return (
    <>
      <header style={{
        background: 'var(--yesil)',
        color: '#fff',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>🌾 BEDLEK TARIM</div>
          <div style={{ fontSize: 11, opacity: 0.8, marginTop: 1 }}>Tarla Takip &amp; Muhasebe</div>
        </div>

        <button
          onClick={() => setSeciciAcik(true)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 8,
            color: '#fff',
            padding: '6px 12px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {sezon?.ad || 'Sezon'} ▾
        </button>
      </header>

      {/* Sezon seçici modal */}
      {seciciAcik && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 100, display: 'flex', alignItems: 'flex-end',
          }}
          onClick={() => setSeciciAcik(false)}
        >
          <div
            style={{
              background: '#fff', width: '100%', maxWidth: 480,
              borderRadius: '16px 16px 0 0',
              padding: '20px 16px',
              paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Sezon Seç</div>

            {sezonlar.map(s => (
              <button
                key={s.id}
                onClick={() => sezonSec(s.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px 16px',
                  background: sezon?.id === s.id ? 'var(--yesil-acik)' : '#f9f9f9',
                  border: sezon?.id === s.id ? '1.5px solid var(--yesil)' : '1.5px solid transparent',
                  borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                  fontWeight: sezon?.id === s.id ? 700 : 400,
                  color: sezon?.id === s.id ? 'var(--yesil)' : 'var(--yazi)',
                  fontSize: 15,
                }}
              >
                {s.ad}
              </button>
            ))}

            {!yeniSezonAcik ? (
              <button
                onClick={() => setYeniSezonAcik(true)}
                style={{
                  width: '100%', padding: '12px 16px', background: 'none',
                  border: '1.5px dashed var(--kenar)', borderRadius: 10,
                  cursor: 'pointer', color: 'var(--yazi-hafif)', fontSize: 15,
                }}
              >
                + Yeni Sezon Ekle
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  autoFocus
                  value={yeniAd}
                  onChange={e => setYeniAd(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && yeniSezonEkle()}
                  placeholder="2026 Sezonu"
                  style={{
                    flex: 1, padding: '10px 12px', border: '1.5px solid var(--kenar)',
                    borderRadius: 8, fontSize: 15,
                  }}
                />
                <button
                  onClick={yeniSezonEkle}
                  style={{
                    padding: '10px 16px', background: 'var(--yesil)',
                    color: '#fff', border: 'none', borderRadius: 8,
                    cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  Ekle
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
