import { useState } from 'react'
import { hareketleriOku, firmalariOku, tarlalariOku, kisileriOku, sezonOzeti } from '../../store/db'
import { paraBiçim, sayiBiçim, tarihBiçim } from '../../utils/format'
import { hareketleriExcelExport, whatsappOzet } from '../../utils/export'

export default function RaporlarSayfasi({ sezon }) {
  const [aktifTab, setAktifTab] = useState('sezon')
  const hareketler = hareketleriOku(sezon?.id)
  const firmalar = firmalariOku()
  const tarlalar = tarlalariOku()
  const kisiler = kisileriOku()
  const ozet = sezonOzeti(sezon?.id)

  // Kalem bazlı gider
  const kalemGiderleri = {}
  hareketler.filter(h => h.yon === 'gider').forEach(h => {
    kalemGiderleri[h.kalem || 'Diğer'] = (kalemGiderleri[h.kalem || 'Diğer'] || 0) + (h.tutar || 0)
  })

  // Firma bazlı özet
  const firmaOzetleri = firmalar.map(firma => {
    const fHareketler = hareketler.filter(h => h.firma_id === firma.id)
    const gelenNakit = fHareketler.filter(h => h.tur === 'nakit_avans').reduce((t, h) => t + (h.tutar || 0), 0)
    const harcanan = fHareketler.filter(h => h.tur === 'harcama' && h.kaynak === 'avans').reduce((t, h) => t + (h.tutar || 0), 0)
    return { ...firma, gelenNakit, harcanan, kalan: gelenNakit - harcanan }
  })

  // Tarla bazlı özet
  const tarlaOzetleri = tarlalar.map(tarla => {
    const tHareketler = hareketler.filter(h => h.tarla_id === tarla.id)
    const gider = tHareketler.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0)
    const gelir = tHareketler.filter(h => h.yon === 'gelir').reduce((t, h) => t + (h.tutar || 0), 0)
    const dekarMaliyet = tarla.dekar > 0 ? gider / tarla.dekar : 0
    return { ...tarla, gider, gelir, dekarMaliyet }
  })

  const tabs = [
    { id: 'sezon', label: 'Sezon' },
    { id: 'firma', label: 'Firma' },
    { id: 'tarla', label: 'Tarla' },
    { id: 'kalem', label: 'Kalem' },
  ]

  return (
    <div className="sayfa">
      {/* Tab seçici */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setAktifTab(t.id)} style={{
            padding: '8px 14px', borderRadius: 99, border: '1.5px solid', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            background: aktifTab === t.id ? 'var(--yesil)' : '#fff',
            borderColor: aktifTab === t.id ? 'var(--yesil)' : 'var(--kenar)',
            color: aktifTab === t.id ? '#fff' : 'var(--yazi)',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Sezon Raporu */}
      {aktifTab === 'sezon' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
              📊 {sezon?.ad} Genel Özet
            </div>
            {[
              { label: 'Toplam Gelir', tutar: ozet.toplamGelir, renk: 'var(--yesil)' },
              { label: 'Toplam Gider', tutar: ozet.toplamGider, renk: 'var(--kirmizi)' },
              { label: 'Net Kar/Zarar', tutar: ozet.net, renk: ozet.net >= 0 ? 'var(--yesil)' : 'var(--kirmizi)' },
            ].map(r => (
              <div key={r.label} style={{
                display: 'flex', justifyContent: 'space-between',
                paddingBlock: 10, borderBottom: '1px solid var(--kenar)',
              }}>
                <span style={{ fontSize: 14 }}>{r.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: r.renk }}>{paraBiçim(r.tutar)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => hareketleriExcelExport(hareketler, tarlalar, firmalar, sezon?.ad || 'Sezon')}
              style={{
                flex: 1, padding: '14px', background: 'var(--yesil)', color: '#fff',
                border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700,
              }}
            >
              📥 Excel İndir
            </button>
            <button
              onClick={() => whatsappOzet(ozet, sezon?.ad || 'Sezon')}
              style={{
                flex: 1, padding: '14px', background: '#25D366', color: '#fff',
                border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700,
              }}
            >
              📱 WhatsApp'a Gönder
            </button>
          </div>
        </div>
      )}

      {/* Firma Raporu */}
      {aktifTab === 'firma' && (
        <div>
          {firmaOzetleri.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--yazi-hafif)' }}>Firma kaydı yok</div>
          ) : firmaOzetleri.map(f => (
            <div key={f.id} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🏢 {f.ad}</div>
              {[
                { label: 'Gelen Nakit', tutar: f.gelenNakit, renk: 'var(--yesil)' },
                { label: 'Harcanan', tutar: f.harcanan, renk: 'var(--kirmizi)' },
                { label: 'Kalan Bakiye', tutar: f.kalan, renk: f.kalan >= 0 ? 'var(--yesil)' : 'var(--kirmizi)' },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  paddingBlock: 8, borderBottom: '1px solid var(--kenar)', fontSize: 13,
                }}>
                  <span>{r.label}</span>
                  <span style={{ fontWeight: 700, color: r.renk }}>{paraBiçim(r.tutar)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Tarla Raporu */}
      {aktifTab === 'tarla' && (
        <div>
          {tarlaOzetleri.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--yazi-hafif)' }}>Tarla kaydı yok</div>
          ) : tarlaOzetleri.map(t => (
            <div key={t.id} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🌾 {t.ad}</div>
              <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', marginBottom: 12 }}>
                {t.urun} · {t.dekar} dk · {t.sahip}
              </div>
              {[
                { label: 'Toplam Gider', tutar: t.gider, renk: 'var(--kirmizi)' },
                { label: 'Toplam Gelir', tutar: t.gelir, renk: 'var(--yesil)' },
                { label: 'Dekar Başı Maliyet', tutar: t.dekarMaliyet, renk: 'var(--amber)' },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  paddingBlock: 8, borderBottom: '1px solid var(--kenar)', fontSize: 13,
                }}>
                  <span>{r.label}</span>
                  <span style={{ fontWeight: 700, color: r.renk }}>{paraBiçim(r.tutar)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Kalem Raporu */}
      {aktifTab === 'kalem' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Kalem Bazlı Gider Analizi</div>
          {Object.keys(kalemGiderleri).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--yazi-hafif)' }}>Gider kaydı yok</div>
          ) : Object.entries(kalemGiderleri)
            .sort((a, b) => b[1] - a[1])
            .map(([kalem, tutar]) => {
              const yuzde = ozet.toplamGider > 0 ? (tutar / ozet.toplamGider) * 100 : 0
              return (
                <div key={kalem} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{kalem}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{paraBiçim(tutar)}</span>
                      <span style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginLeft: 6 }}>%{yuzde.toFixed(0)}</span>
                    </div>
                  </div>
                  <div style={{ background: '#F0EDE8', borderRadius: 99, height: 8 }}>
                    <div style={{
                      background: 'var(--kirmizi)', height: 8, borderRadius: 99,
                      width: `${yuzde}%`, transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
