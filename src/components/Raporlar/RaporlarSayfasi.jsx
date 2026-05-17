import { useState } from 'react'
import { hareketleriOku, firmalariOku, tarlalariOku, kisileriOku, sezonOzeti, iscilikKayitlariniOku } from '../../store/db'
import { paraBiÃ§im, tarihBiÃ§im } from '../../utils/format'
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

function ExportBtn({ onClick, renk = 'yesil', label, icon = 'ğŸ“¥' }) {
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
  const iscilikKayitlari = iscilikKayitlariniOku(sezon?.id)
  const ozet = sezonOzeti(sezon?.id)
  const sezonAd = sezon?.ad || 'Sezon'

  const kalemGiderleri = {}
  hareketler.filter(h => h.yon === 'gider').forEach(h => {
    kalemGiderleri[h.kalem || 'DiÄŸer'] = (kalemGiderleri[h.kalem || 'DiÄŸer'] || 0) + (h.tutar || 0)
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
    { id: 'sezon', label: 'ğŸ“Š Sezon' },
    { id: 'firma', label: 'ğŸ¢ Firma' },
    { id: 'tarla', label: 'ğŸŒ¾ Tarla' },
    { id: 'kalem', label: 'ğŸ“¦ Kalem' },
    { id: 'kisiler', label: 'ğŸ’° Åahsi' },
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
        ğŸ“‹ Tam Raporu Ä°ndir (TÃ¼m ModÃ¼ller)
      </button>

      {/* Tab seÃ§ici */}
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
              ğŸ“Š {sezonAd} Genel Ã–zet
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
                <span style={{ fontSize: 14, fontWeight: 700, color: r.renk }}>{paraBiÃ§im(r.tutar)}</span>
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
              icon="ğŸ“±"
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
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--yazi-hafif)' }}>Firma kaydÄ± yok</div>
          ) : (
            <>
              {firmaOzetleri.map(f => (
                <div key={f.id} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>ğŸ¢ {f.ad}</div>
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
                      <span style={{ fontWeight: 700, color: r.renk }}>{paraBiÃ§im(r.tutar)}</span>
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
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--yazi-hafif)' }}>Tarla kaydÄ± yok</div>
          ) : (
            <>
              {tarlaOzetleri.map(t => (
                <div key={t.id} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>ğŸŒ¾ {t.ad}</div>
                  <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', marginBottom: 12 }}>
                    {t.urun} Â· {t.dekar} dk Â· {t.sahip}
                  </div>
                  {[
                    { label: 'Toplam Gider', tutar: t.gider, renk: 'var(--kirmizi)' },
                    { label: 'Toplam Gelir', tutar: t.gelir, renk: 'var(--yesil)' },
                    { label: 'Dekar BaÅŸÄ± Maliyet', tutar: t.dekarMaliyet, renk: 'var(--amber)' },
                  ].map(r => (
                    <div key={r.label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      paddingBlock: 8, borderBottom: '1px solid var(--kenar)', fontSize: 13,
                    }}>
                      <span>{r.label}</span>
                      <span style={{ fontWeight: 700, color: r.renk }}>{paraBiÃ§im(r.tutar)}</span>
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
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Kalem BazlÄ± Gider Analizi</div>
            {Object.keys(kalemGiderleri).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--yazi-hafif)' }}>Gider kaydÄ± yok</div>
            ) : Object.entries(kalemGiderleri)
              .sort((a, b) => b[1] - a[1])
              .map(([kalem, tutar]) => {
                const yuzde = ozet.toplamGider > 0 ? (tutar / ozet.toplamGider) * 100 : 0
                return (
                  <div key={kalem} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{kalem}</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{paraBiÃ§im(tutar)}</span>
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

      {/* Şahsi Hesap Raporu */}
      {aktifTab === 'kisiler' && (() => {
        const sahsiH = hareketler.filter(h => h.modul === 'sahsi')
        const sanayiH = hareketler.filter(h => h.modul === 'sanayi')
        const kisiH = hareketler.filter(h => kisiler.some(k => k.id === h.kisi_id))
        const iscilikToplam = iscilikKayitlari.reduce((t, k) => t + (k.odeme_tutari || k.toplam || 0), 0)
        const sahsiToplam = sahsiH.reduce((t, h) => t + (h.tutar || 0), 0)
        const sanayiToplam = sanayiH.reduce((t, h) => t + (h.tutar || 0), 0)
        const kisiVerilen = kisiH.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0)
        const genelToplam = sahsiToplam + sanayiToplam + iscilikToplam + kisiVerilen
        return (
          <div>
            {kisiler.filter(k => hareketler.some(h => h.kisi_id === k.id)).length > 0 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>👥 Kişi Ödemeleri</div>
                {kisiler.map(k => {
                  const kH = hareketler.filter(h => h.kisi_id === k.id)
                  if (kH.length === 0) return null
                  const verilen = kH.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0)
                  const alinan = kH.filter(h => h.yon === 'gelir').reduce((t, h) => t + (h.tutar || 0), 0)
                  const kalan = alinan - verilen
                  return (
                    <div key={k.id} style={{ paddingBlock: 10, borderBottom: '1px solid var(--kenar)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>👤 {k.ad}</div>
                      {[...kH].sort((a, b) => new Date(a.tarih) - new Date(b.tarih)).map(h => (
                        <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBlock: 3 }}>
                          <span style={{ color: 'var(--yazi-hafif)' }}>{h.kalem || h.tur} · {tarihBiçim(h.tarih)}</span>
                          <span style={{ fontWeight: 700, color: h.yon === 'gelir' ? 'var(--yesil)' : 'var(--kirmizi)' }}>
                            {h.yon === 'gelir' ? '+' : '-'}{paraBiçim(h.tutar)}
                          </span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4, paddingTop: 4, borderTop: '1px dashed var(--kenar)' }}>
                        <span style={{ fontWeight: 700 }}>Kalan</span>
                        <span style={{ fontWeight: 800, color: kalan >= 0 ? 'var(--yesil)' : 'var(--kirmizi)' }}>
                          {kalan >= 0 ? '(Bende) ' : '(Onda) '}{paraBiçim(Math.abs(kalan))}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontSize: 13 }}>
                  <span style={{ fontWeight: 700 }}>Kişiler Toplamı</span>
                  <span style={{ fontWeight: 800, color: 'var(--kirmizi)' }}>{paraBiçim(kisiVerilen)}</span>
                </div>
              </div>
            )}
            {sahsiH.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>💰 Şahsi Harcamalar</div>
                {[...sahsiH].sort((a, b) => new Date(a.tarih) - new Date(b.tarih)).map(h => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBlock: 7, borderBottom: '1px solid var(--kenar)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{h.kalem}</div>
                      <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>{h.aciklama || ''} · {tarihBiçim(h.tarih)}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--kirmizi)' }}>{paraBiçim(h.tutar)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontSize: 13 }}>
                  <span style={{ fontWeight: 700 }}>Toplam</span>
                  <span style={{ fontWeight: 800, color: 'var(--kirmizi)' }}>{paraBiçim(sahsiToplam)}</span>
                </div>
              </div>
            )}
            {sanayiH.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>🔧 Sanayi & Hizmet</div>
                {[...sanayiH].sort((a, b) => new Date(a.tarih) - new Date(b.tarih)).map(h => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBlock: 7, borderBottom: '1px solid var(--kenar)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{h.kalem}</div>
                      <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>{h.aciklama || ''} · {tarihBiçim(h.tarih)}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--kirmizi)' }}>{paraBiçim(h.tutar)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontSize: 13 }}>
                  <span style={{ fontWeight: 700 }}>Toplam</span>
                  <span style={{ fontWeight: 800, color: 'var(--kirmizi)' }}>{paraBiçim(sanayiToplam)}</span>
                </div>
              </div>
            )}
            {iscilikKayitlari.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>👷 İşçilik</div>
                {iscilikKayitlari.map(k => (
                  <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBlock: 7, borderBottom: '1px solid var(--kenar)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{k.is_tanimi || 'İşçilik'}</div>
                      <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>{k.gun_sayisi} gün · {k.kisi_sayisi} kişi · {k.odendi ? '✅ Ödendi' : '⏳ Bekliyor'}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--kirmizi)' }}>{paraBiçim(k.odeme_tutari || k.toplam || 0)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontSize: 13 }}>
                  <span style={{ fontWeight: 700 }}>Toplam</span>
                  <span style={{ fontWeight: 800, color: 'var(--kirmizi)' }}>{paraBiçim(iscilikToplam)}</span>
                </div>
              </div>
            )}
            <div style={{ background: '#0F6E56', borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 14 }}>💰 Şahsi Hesap Genel Toplam — {sezonAd}</div>
              {[
                { label: 'Kişi Ödemeleri', tutar: kisiVerilen },
                { label: 'Şahsi Harcamalar', tutar: sahsiToplam },
                { label: 'Sanayi & Hizmet', tutar: sanayiToplam },
                { label: 'İşçilik', tutar: iscilikToplam },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBlock: 7, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{r.label}</span>
                  <span style={{ color: '#FCA5A5', fontWeight: 700 }}>{paraBiçim(r.tutar)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 4 }}>
                <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>TOPLAM HARCAMA</span>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{paraBiçim(genelToplam)}</span>
              </div>
            </div>
            <ExportBtn label="Kişiler Excel" onClick={() => kisilerExcelExport(kisiler, sezonAd)} />
          </div>
        )
      })()}
    </div>
  )
}

