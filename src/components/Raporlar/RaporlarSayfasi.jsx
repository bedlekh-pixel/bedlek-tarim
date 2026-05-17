import { useState } from 'react'
import { hareketleriOku, firmalariOku, tarlalariOku, kisileriOku, sezonOzeti } from '../../store/db'
import { paraBiçim, tarihBiçim } from '../../utils/format'
import {
  hareketleriExcelExport,
  firmalarExcelExport,
  tarlalarExcelExport,
  kisilerExcelExport,
  kalemlerExcelExport,
  tamRaporExport,
  whatsappOzet,
} from '../../utils/export'

const BTN = {
  base: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '10px 14px', border: 'none', borderRadius: 10,
    cursor: 'pointer', fontSize: 13, fontWeight: 700,
  },
  yesil: { background: 'var(--yesil)', color: '#fff' },
  mavi: { background: '#185FA5', color: '#fff' },
  whatsapp: { background: '#25D366', color: '#fff' },
  tam: { background: '#0F6E56', color: '#fff', flex: 1 },
}

function ExportBtn({ onClick, renk = 'yesil', label, icon = '📥' }) {
  return (
    <button onClick={onClick} style={{ ...BTN.base, ...BTN[renk] }}>
      {icon} {label}
    </button>
  )
}

export default function RaporlarSayfasi({ sezon }) {
  const [aktifTab, setAktifTab] = useState('sezon')
  const hareketler = hareketleriOku(sezon?.id)
  const firmalar = firmalariOku()
  const tarlalar = tarlalariOku()
  const kisiler = kisileriOku()
  const ozet = sezonOzeti(sezon?.id)
  const sezonAd = sezon?.ad || 'Sezon'

  const kalemGiderleri = {}
  hareketler.filter(h => h.yon === 'gider').forEach(h => {
    kalemGiderleri[h.kalem || 'Diğer'] = (kalemGiderleri[h.kalem || 'Diğer'] || 0) + (h.tutar || 0)
  })

  const firmaOzetleri = firmalar.map(firma => {
    const fH = hareketler.filter(h => h.firma_id === firma.id)
    const gelenNakit = fH.filter(h => h.tur === 'nakit_avans').reduce((t, h) => t + (h.tutar || 0), 0)
    const harcanan = fH.filter(h => h.tur === 'harcama' && h.kaynak === 'avans').reduce((t, h) => t + (h.tutar || 0), 0)
    return { ...firma, gelenNakit, harcanan, kalan: gelenNakit - harcanan }
  })

  const tarlaOzetleri = tarlalar.map(tarla => {
    const tH = hareketler.filter(h => h.tarla_id === tarla.id)
    const gider = tH.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0)
    const gelir = tH.filter(h => h.yon === 'gelir').reduce((t, h) => t + (h.tutar || 0), 0)
    const dekarMaliyet = tarla.dekar > 0 ? gider / tarla.dekar : 0
    return { ...tarla, gider, gelir, dekarMaliyet }
  })

  const tabs = [
    { id: 'sezon', label: '📊 Sezon' },
    { id: 'firma', label: '🏢 Firma' },
    { id: 'tarla', label: '🌾 Tarla' },
    { id: 'kalem', label: '📦 Kalem' },
    { id: 'kisiler', label: '👥 Kişiler' },
  ]

  return (
    <div className="sayfa">

      {/* Tam Rapor butonu */}
      <button
        onClick={() => tamRaporExport(sezon, hareketler, firmalar, tarlalar, kisiler)}
        style={{
          width: '100%', marginBottom: 14, ...BTN.base,
          background: '#0F6E56', color: '#fff', padding: '13px',
          borderRadius: 12, fontSize: 14,
        }}
      >
        📋 Tam Raporu İndir (Tüm Modüller)
      </button>

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
              📊 {sezonAd} Genel Özet
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
            <ExportBtn
              label="Hareketler Excel"
              onClick={() => hareketleriExcelExport(hareketler, tarlalar, firmalar, sezonAd)}
            />
            <ExportBtn
              label="WhatsApp"
              icon="📱"
              renk="whatsapp"
              onClick={() => whatsappOzet(ozet, sezonAd)}
            />
          </div>
        </div>
      )}

      {/* Firma Raporu */}
      {aktifTab === 'firma' && (
        <div>
          {firmaOzetleri.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--yazi-hafif)' }}>Firma kaydı yok</div>
          ) : (
            <>
              {firmaOzetleri.map(f => (
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
              <ExportBtn
                label="Firmalar Excel"
                onClick={() => firmalarExcelExport(firmalar, hareketler, sezonAd)}
              />
            </>
          )}
        </div>
      )}

      {/* Tarla Raporu */}
      {aktifTab === 'tarla' && (
        <div>
          {tarlaOzetleri.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--yazi-hafif)' }}>Tarla kaydı yok</div>
          ) : (
            <>
              {tarlaOzetleri.map(t => (
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
              <ExportBtn
                label="Tarlalar Excel"
                onClick={() => tarlalarExcelExport(tarlalar, hareketler, sezonAd)}
              />
            </>
          )}
        </div>
      )}

      {/* Kalem Raporu */}
      {aktifTab === 'kalem' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
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
          {Object.keys(kalemGiderleri).length > 0 && (
            <ExportBtn
              label="Kalem Analizi Excel"
              onClick={() => kalemlerExcelExport(hareketler, sezonAd)}
            />
          )}
        </div>
      )}

      {/* Kişiler Raporu */}
      {aktifTab === 'kisiler' && (
        <div>
          {kisiler.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--yazi-hafif)' }}>Kişi kaydı yok</div>
          ) : (
            <>
              {kisiler.map(k => {
                const kH = hareketler.filter(h => h.kisi_id === k.id)
                const toplamVerilen = kH.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0)
                const toplamAlinan = kH.filter(h => h.yon === 'gelir').reduce((t, h) => t + (h.tutar || 0), 0)
                const kalan = toplamAlinan - toplamVerilen
                if (kH.length === 0) return null
                return (
                  <div key={k.id} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>👤 {k.ad}</div>

                    {/* Hareketler */}
                    {[...kH].sort((a, b) => new Date(a.tarih) - new Date(b.tarih)).map(h => (
                      <div key={h.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        paddingBlock: 8, borderBottom: '1px solid var(--kenar)', fontSize: 13,
                      }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{h.kalem || h.tur}</div>
                          {h.aciklama && <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>{h.aciklama}</div>}
                          <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>{tarihBiçim(h.tarih)}</div>
                        </div>
                        <span style={{ fontWeight: 700, color: h.yon === 'gelir' ? 'var(--yesil)' : 'var(--kirmizi)' }}>
                          {h.yon === 'gelir' ? '+' : '-'}{paraBiçim(h.tutar)}
                        </span>
                      </div>
                    ))}

                    {/* Toplamlar */}
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '2px solid var(--kenar)' }}>
                      {[
                        { label: 'Toplam Verilen', tutar: toplamVerilen, renk: 'var(--kirmizi)' },
                        { label: 'Toplam Alınan', tutar: toplamAlinan, renk: 'var(--yesil)' },
                        { label: 'Kalan', tutar: Math.abs(kalan), renk: kalan >= 0 ? 'var(--yesil)' : 'var(--kirmizi)', prefix: kalan >= 0 ? '(Bende) ' : '(Onda) ' },
                      ].map(r => (
                        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBlock: 5, fontSize: 13 }}>
                          <span style={{ fontWeight: 600 }}>{r.label}</span>
                          <span style={{ fontWeight: 800, color: r.renk }}>{r.prefix || ''}{paraBiçim(r.tutar)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Genel Toplam Kutusu */}
              {(() => {
                const tumKisiHareketler = hareketler.filter(h => kisiler.some(k => k.id === h.kisi_id))
                const genelVerilen = tumKisiHareketler.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0)
                const genelAlinan = tumKisiHareketler.filter(h => h.yon === 'gelir').reduce((t, h) => t + (h.tutar || 0), 0)
                const genelKalan = genelAlinan - genelVerilen
                return (
                  <div style={{ background: '#0F6E56', borderRadius: 12, padding: 20, marginBottom: 12 }}>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 14 }}>
                      📊 Tüm Kişiler — Genel Toplam
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBlock: 8, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Toplam Verilen</span>
                      <span style={{ color: '#FCA5A5', fontWeight: 800, fontSize: 15 }}>{paraBiçim(genelVerilen)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBlock: 8, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Toplam Alınan</span>
                      <span style={{ color: '#86EFAC', fontWeight: 800, fontSize: 15 }}>{paraBiçim(genelAlinan)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBlock: 8 }}>
                      <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Net Kalan</span>
                      <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>
                        {genelKalan >= 0 ? '(Bende) ' : '(Onda) '}{paraBiçim(Math.abs(genelKalan))}
                      </span>
                    </div>
                  </div>
                )
              })()}

              <ExportBtn
                label="Kişiler Excel"
                onClick={() => kisilerExcelExport(kisiler, sezonAd)}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
