import { useState } from 'react'
import { hareketleriOku, firmalariOku, tarlalariOku, kisileriOku, sezonOzeti, iscilikKayitlariniOku, sezonlariOku } from '../../store/db'
import { paraBiçim, tarihBiçim } from '../../utils/format'
import {
  hareketleriExcelExport, firmalarExcelExport, tarlalarExcelExport,
  kisilerExcelExport, kalemlerExcelExport, tamRaporExport, whatsappOzet,
} from '../../utils/export'

function ExportBtn({ onClick, renk = 'yesil', label, icon = '📥' }) {
  const renkler = {
    yesil: { background: 'var(--yesil)', color: '#fff' },
    whatsapp: { background: '#25D366', color: '#fff' },
  }
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '10px 14px', border: 'none', borderRadius: 10,
      cursor: 'pointer', fontSize: 13, fontWeight: 700, ...renkler[renk],
    }}>
      {icon} {label}
    </button>
  )
}

// Açılır/kapanır bölüm — başlıkta toplam gösterir
function Bolum({ baslik, toplam, children }) {
  const [acik, setAcik] = useState(true)
  return (
    <div style={{ background: '#fff', borderRadius: 12, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <button onClick={() => setAcik(a => !a)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
      }}>
        <span style={{ fontWeight: 800, fontSize: 14 }}>{baslik}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--kirmizi)' }}>{paraBiçim(toplam)}</span>
          <span style={{ fontSize: 14, color: 'var(--yazi-hafif)' }}>{acik ? '▲' : '▼'}</span>
        </div>
      </button>
      {acik && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  )
}

// ─── Global Arama Sonuçları ───────────────────────────────────
function AramaSonuclari({ aranan, hareketler, firmalar, tarlalar, kisiler }) {
  const q = aranan.trim().toLowerCase()

  const sonuclar = hareketler.filter(h => {
    const firma = firmalar.find(f => f.id === h.firma_id)
    const tarla = tarlalar.find(t => t.id === h.tarla_id)
    const kisi  = kisiler.find(k => k.id === h.kisi_id)
    return (
      h.kalem?.toLowerCase().includes(q) ||
      h.aciklama?.toLowerCase().includes(q) ||
      firma?.ad?.toLowerCase().includes(q) ||
      tarla?.ad?.toLowerCase().includes(q) ||
      kisi?.ad?.toLowerCase().includes(q) ||
      h.fis_no?.toLowerCase().includes(q)
    )
  }).sort((a, b) => new Date(b.tarih) - new Date(a.tarih))

  const MODUL_ETIKET = {
    sozlesmeli: { label: 'Sözleşmeli', renk: '#185FA5', bg: '#EFF6FF' },
    sahsi:      { label: 'Şahsi',      renk: '#7C3AED', bg: '#F5F3FF' },
    sanayi:     { label: 'Sanayi',     renk: '#374151', bg: '#F3F4F6' },
    kisiler:    { label: 'Kişiler',    renk: '#0F6E56', bg: '#F0FDF4' },
  }

  if (sonuclar.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--yazi-hafif)' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
        <div style={{ fontWeight: 600 }}>"{aranan}" için sonuç bulunamadı</div>
        <div style={{ fontSize: 12, marginTop: 6 }}>Kalem adı, açıklama, firma, tarla veya kişi adıyla arayın</div>
      </div>
    )
  }

  const toplamGelir = sonuclar.filter(h => h.yon === 'gelir').reduce((t, h) => t + (h.tutar || 0), 0)
  const toplamGider = sonuclar.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0)

  return (
    <div>
      {/* Özet satır */}
      <div style={{
        background: '#fff', borderRadius: 10, padding: '10px 14px', marginBottom: 12,
        display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', fontSize: 13,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <span style={{ fontWeight: 700, color: 'var(--yazi)' }}>{sonuclar.length} sonuç</span>
        {toplamGelir > 0 && <span>Gelir: <strong style={{ color: 'var(--yesil)' }}>{paraBiçim(toplamGelir)}</strong></span>}
        {toplamGider > 0 && <span>Gider: <strong style={{ color: 'var(--kirmizi)' }}>{paraBiçim(toplamGider)}</strong></span>}
      </div>

      {/* Sonuç listesi */}
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {sonuclar.map((h, i) => {
          const firma = firmalar.find(f => f.id === h.firma_id)
          const tarla = tarlalar.find(t => t.id === h.tarla_id)
          const kisi  = kisiler.find(k => k.id === h.kisi_id)
          const etiket = MODUL_ETIKET[h.modul] || null
          const altBilgi = [firma?.ad, tarla?.ad, kisi?.ad, h.aciklama].filter(Boolean).join(' · ')
          const gelir = h.yon === 'gelir'

          return (
            <div key={h.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '12px 16px',
              borderBottom: i < sonuclar.length - 1 ? '1px solid var(--kenar)' : 'none',
            }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--yazi)' }}>
                    {h.kalem || h.tur}
                  </span>
                  {etiket && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                      background: etiket.bg, color: etiket.renk,
                    }}>{etiket.label}</span>
                  )}
                  {h.fis_no && (
                    <span style={{ fontSize: 10, color: 'var(--yazi-hafif)', background: '#F3F4F6', padding: '1px 5px', borderRadius: 3 }}>
                      #{h.fis_no}
                    </span>
                  )}
                </div>
                {altBilgi && (
                  <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {altBilgi}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 2 }}>
                  {tarihBiçim(h.tarih)}
                  {h.miktar ? ` · ${h.miktar} ${h.birim}` : ''}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, flexShrink: 0, color: gelir ? 'var(--yesil)' : 'var(--kirmizi)' }}>
                {gelir ? '+' : '-'}{h.tutar ? paraBiçim(h.tutar) : `${h.miktar || ''} ${h.birim || ''}`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Firma Detay Tab ──────────────────────────────────────────
const TUR_ETIKET = {
  nakit_avans:  { label: 'Nakit Avans',  bg: '#DCFCE7', renk: '#16A34A' },
  hammadde:     { label: 'Hammadde',     bg: '#DBEAFE', renk: '#1D4ED8' },
  harcama:      { label: 'Harcama',      bg: '#FEE2E2', renk: '#DC2626' },
}

function FirmaDetayTab({ firmaOzetleri, hareketler, tarlalar, onExport }) {
  const [acikFirmalar, setAcikFirmalar] = useState({})

  function toggle(id) {
    setAcikFirmalar(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (firmaOzetleri.length === 0) {
    return <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--yazi-hafif)' }}>Firma kaydı yok</div>
  }

  return (
    <div>
      {firmaOzetleri.map(f => {
        const acik = !!acikFirmalar[f.id]
        const firmaHareketler = hareketler
          .filter(h => h.firma_id === f.id)
          .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))

        return (
          <div key={f.id} style={{ background: '#fff', borderRadius: 12, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {/* Özet başlık */}
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>🏢 {f.ad}</div>
                <div style={{
                  background: f.kalan >= 0 ? 'var(--yesil)' : 'var(--kirmizi)',
                  color: '#fff', borderRadius: 8, padding: '4px 10px',
                  fontSize: 13, fontWeight: 700,
                }}>
                  Kalan: {paraBiçim(f.kalan)}
                </div>
              </div>

              {/* 3 özet metrik yan yana */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, background: '#F0FDF4', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: 'var(--yesil)', fontWeight: 700, marginBottom: 2 }}>GELEN NAKİT</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--yesil)' }}>{paraBiçim(f.gelenNakit)}</div>
                </div>
                <div style={{ flex: 1, background: '#FEF2F2', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: 'var(--kirmizi)', fontWeight: 700, marginBottom: 2 }}>HARCANAN</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--kirmizi)' }}>{paraBiçim(f.harcanan)}</div>
                </div>
                <div style={{ flex: 1, background: '#F8F9FA', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: 'var(--yazi-hafif)', fontWeight: 700, marginBottom: 2 }}>İŞLEM</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--yazi)' }}>{firmaHareketler.length}</div>
                </div>
              </div>

              {/* Detay aç/kapat butonu */}
              {firmaHareketler.length > 0 && (
                <button onClick={() => toggle(f.id)} style={{
                  width: '100%', padding: '8px', background: acik ? 'var(--yesil-acik)' : 'var(--zemin)',
                  border: '1.5px solid', borderColor: acik ? 'var(--yesil)' : 'var(--kenar)',
                  borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  color: acik ? 'var(--yesil)' : 'var(--yazi-hafif)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  {acik ? '▲ Detayları Gizle' : `▼ ${firmaHareketler.length} İşlemi Göster`}
                </button>
              )}
            </div>

            {/* Hareket listesi */}
            {acik && firmaHareketler.length > 0 && (
              <div style={{ borderTop: '1px solid var(--kenar)' }}>
                {/* Kalem bazlı mini özet */}
                {(() => {
                  const kalemToplam = {}
                  firmaHareketler.filter(h => h.yon === 'gider' && h.tutar > 0).forEach(h => {
                    kalemToplam[h.kalem || 'Diğer'] = (kalemToplam[h.kalem || 'Diğer'] || 0) + (h.tutar || 0)
                  })
                  const kalemler = Object.entries(kalemToplam).sort((a, b) => b[1] - a[1])
                  if (kalemler.length < 2) return null
                  return (
                    <div style={{ padding: '10px 16px', background: '#FAFAFA', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--kenar)' }}>
                      <span style={{ fontSize: 11, color: 'var(--yazi-hafif)', fontWeight: 700, marginRight: 4 }}>KALEM ÖZETİ</span>
                      {kalemler.map(([k, t]) => (
                        <span key={k} style={{ fontSize: 11, background: '#fff', border: '1px solid var(--kenar)', borderRadius: 5, padding: '2px 7px', fontWeight: 600 }}>
                          {k} <span style={{ color: 'var(--kirmizi)' }}>{paraBiçim(t)}</span>
                        </span>
                      ))}
                    </div>
                  )
                })()}

                {/* Hareket satırları */}
                {firmaHareketler.map((h, i) => {
                  const tarla = tarlalar.find(t => t.id === h.tarla_id)
                  const etiket = TUR_ETIKET[h.tur] || { label: h.tur, bg: '#F3F4F6', renk: '#374151' }
                  const gelir = h.yon === 'gelir'
                  return (
                    <div key={h.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      padding: '10px 16px',
                      borderBottom: i < firmaHareketler.length - 1 ? '1px solid var(--kenar)' : 'none',
                      background: i % 2 === 0 ? '#fff' : '#FAFAFA',
                    }}>
                      <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{h.kalem || h.tur}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: etiket.bg, color: etiket.renk }}>
                            {etiket.label}
                          </span>
                          {h.kaynak === 'cep' && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: '#F5F3FF', color: '#7C3AED' }}>şahsi</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>
                          {tarihBiçim(h.tarih)}
                          {tarla ? ` · ${tarla.ad}` : ''}
                          {h.miktar ? ` · ${h.miktar} ${h.birim}` : ''}
                          {h.aciklama ? ` · ${h.aciklama}` : ''}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, flexShrink: 0, color: gelir ? 'var(--yesil)' : 'var(--kirmizi)' }}>
                        {gelir ? '+' : '-'}{h.tutar ? paraBiçim(h.tutar) : `${h.miktar || ''} ${h.birim || ''}`}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      <div style={{ marginTop: 4 }}>
        <ExportBtn label="Firmalar Excel" onClick={onExport} />
      </div>
    </div>
  )
}

export default function RaporlarSayfasi({ sezon }) {
  const [aktifTab, setAktifTab] = useState('sezon')
  const [aramaMetni, setAramaMetni] = useState('')
  const hareketler = hareketleriOku(sezon?.id)
  const firmalar = firmalariOku()
  const tarlalar = tarlalariOku()
  const kisiler = kisileriOku()
  const iscilikKayitlari = iscilikKayitlariniOku(sezon?.id)
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
    return { ...tarla, gider, gelir, dekarMaliyet: tarla.dekar > 0 ? gider / tarla.dekar : 0 }
  })

  // Şahsi hesap verileri
  const sahsiH = hareketler.filter(h => h.modul === 'sahsi')
  const sanayiH = hareketler.filter(h => h.modul === 'sanayi')
  const kisiH = hareketler.filter(h => kisiler.some(k => k.id === h.kisi_id))
  const sahsiToplam = sahsiH.reduce((t, h) => t + (h.tutar || 0), 0)
  const sanayiToplam = sanayiH.reduce((t, h) => t + (h.tutar || 0), 0)
  const iscilikToplam = iscilikKayitlari.reduce((t, k) => t + (k.odeme_tutari || k.toplam || 0), 0)
  const kisiVerilen = kisiH.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0)
  const genelToplam = sahsiToplam + sanayiToplam + iscilikToplam + kisiVerilen

  const sezonlar = sezonlariOku()
  const [karsilastirSezonlar, setKarsilastirSezonlar] = useState([])

  const tabs = [
    { id: 'sezon', label: '📊 Sezon' },
    { id: 'firma', label: '🏢 Firma' },
    { id: 'tarla', label: '🌾 Tarla' },
    { id: 'kalem', label: '📦 Kalem' },
    { id: 'kisiler', label: '💰 Şahsi' },
    { id: 'urun', label: '🌿 Ürün' },
    { id: 'karsilastir', label: '📈 Karşılaştır' },
  ]

  // Ürün bazlı gruplama
  const urunGruplari = {}
  tarlalar.forEach(tarla => {
    const urunAdi = (tarla.urun || 'Belirtilmemiş').trim()
    if (!urunGruplari[urunAdi]) {
      urunGruplari[urunAdi] = { tarlalar: [], toplamDekar: 0, toplamGider: 0, toplamGelir: 0 }
    }
    const tH = hareketler.filter(h => h.tarla_id === tarla.id)
    const gider = tH.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0)
    const gelir = tH.filter(h => h.yon === 'gelir').reduce((t, h) => t + (h.tutar || 0), 0)
    urunGruplari[urunAdi].tarlalar.push(tarla)
    urunGruplari[urunAdi].toplamDekar += parseFloat(tarla.dekar) || 0
    urunGruplari[urunAdi].toplamGider += gider
    urunGruplari[urunAdi].toplamGelir += gelir
  })

  const urunListesi = Object.entries(urunGruplari)
    .map(([ad, veri]) => ({
      ad,
      ...veri,
      net: veri.toplamGelir - veri.toplamGider,
      dekarMaliyet: veri.toplamDekar > 0 ? veri.toplamGider / veri.toplamDekar : 0,
      dekarGelir: veri.toplamDekar > 0 ? veri.toplamGelir / veri.toplamDekar : 0,
      marjYuzde: veri.toplamGelir > 0
        ? ((veri.toplamGelir - veri.toplamGider) / veri.toplamGelir * 100)
        : null,
    }))
    .sort((a, b) => b.net - a.net)

  const maxDekarMaliyet = Math.max(...urunListesi.map(u => u.dekarMaliyet), 1)
  const maxDekarGelir = Math.max(...urunListesi.map(u => u.dekarGelir), 1)

  return (
    <div className="sayfa">

      {/* ── Global Arama ── */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <span style={{
          position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
          fontSize: 16, pointerEvents: 'none',
        }}>🔍</span>
        <input
          type="text"
          value={aramaMetni}
          onChange={e => setAramaMetni(e.target.value)}
          placeholder="Tüm kayıtlarda ara: kalem, firma, tarla, açıklama..."
          style={{
            width: '100%', padding: '12px 40px 12px 40px',
            border: aramaMetni ? '2px solid var(--yesil)' : '1.5px solid var(--kenar)',
            borderRadius: 12, fontSize: 14, background: '#fff',
            outline: 'none', boxSizing: 'border-box',
            boxShadow: aramaMetni ? '0 0 0 3px rgba(15,110,86,0.1)' : 'none',
            transition: 'border 0.15s, box-shadow 0.15s',
          }}
        />
        {aramaMetni && (
          <button
            onClick={() => setAramaMetni('')}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'var(--kenar)', border: 'none', borderRadius: '50%',
              width: 22, height: 22, cursor: 'pointer', fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--yazi-hafif)', fontWeight: 700,
            }}
          >×</button>
        )}
      </div>

      {/* Arama aktifken — sonuçları göster, diğer içeriği gizle */}
      {aramaMetni.trim() ? (
        <AramaSonuclari
          aranan={aramaMetni}
          hareketler={hareketler}
          firmalar={firmalar}
          tarlalar={tarlalar}
          kisiler={kisiler}
        />
      ) : (
      <>

      {/* Tam Rapor */}
      <button onClick={() => tamRaporExport(sezon, hareketler, firmalar, tarlalar, kisiler)} style={{
        width: '100%', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, background: '#0F6E56', color: '#fff', border: 'none', borderRadius: 12,
        padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
      }}>
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

      {/* Sezon */}
      {aktifTab === 'sezon' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>📊 {sezonAd} Genel Özet</div>
            {[
              { label: 'Toplam Gelir', tutar: ozet.toplamGelir, renk: 'var(--yesil)' },
              { label: 'Toplam Gider', tutar: ozet.toplamGider, renk: 'var(--kirmizi)' },
              { label: 'Net Kar/Zarar', tutar: ozet.net, renk: ozet.net >= 0 ? 'var(--yesil)' : 'var(--kirmizi)' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBlock: 10, borderBottom: '1px solid var(--kenar)' }}>
                <span style={{ fontSize: 14 }}>{r.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: r.renk }}>{paraBiçim(r.tutar)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <ExportBtn label="Hareketler Excel" onClick={() => hareketleriExcelExport(hareketler, tarlalar, firmalar, sezonAd)} />
            <ExportBtn label="WhatsApp" icon="📱" renk="whatsapp" onClick={() => whatsappOzet(ozet, sezonAd)} />
          </div>
        </div>
      )}

      {/* Firma */}
      {aktifTab === 'firma' && (
        <FirmaDetayTab
          firmaOzetleri={firmaOzetleri}
          hareketler={hareketler}
          tarlalar={tarlalar}
          onExport={() => firmalarExcelExport(firmalar, hareketler, sezonAd)}
        />
      )}

      {/* Tarla */}
      {aktifTab === 'tarla' && (
        <div>
          {tarlaOzetleri.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--yazi-hafif)' }}>Tarla kaydı yok</div>
          ) : (
            <>
              {tarlaOzetleri.map(t => (
                <div key={t.id} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🌾 {t.ad}</div>
                  <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', marginBottom: 12 }}>{t.urun} · {t.dekar} dk · {t.sahip}</div>
                  {[
                    { label: 'Toplam Gider', tutar: t.gider, renk: 'var(--kirmizi)' },
                    { label: 'Toplam Gelir', tutar: t.gelir, renk: 'var(--yesil)' },
                    { label: 'Dekar Başı Maliyet', tutar: t.dekarMaliyet, renk: 'var(--amber)' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBlock: 8, borderBottom: '1px solid var(--kenar)', fontSize: 13 }}>
                      <span>{r.label}</span>
                      <span style={{ fontWeight: 700, color: r.renk }}>{paraBiçim(r.tutar)}</span>
                    </div>
                  ))}
                </div>
              ))}
              <ExportBtn label="Tarlalar Excel" onClick={() => tarlalarExcelExport(tarlalar, hareketler, sezonAd)} />
            </>
          )}
        </div>
      )}

      {/* Kalem */}
      {aktifTab === 'kalem' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Kalem Bazlı Gider Analizi</div>
            {Object.keys(kalemGiderleri).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--yazi-hafif)' }}>Gider kaydı yok</div>
            ) : Object.entries(kalemGiderleri).sort((a, b) => b[1] - a[1]).map(([kalem, tutar]) => {
              const yuzde = ozet.toplamGider > 0 ? (tutar / ozet.toplamGider) * 100 : 0
              return (
                <div key={kalem} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{kalem}</span>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{paraBiçim(tutar)}</span>
                      <span style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginLeft: 6 }}>%{yuzde.toFixed(0)}</span>
                    </div>
                  </div>
                  <div style={{ background: '#F0EDE8', borderRadius: 99, height: 8 }}>
                    <div style={{ background: 'var(--kirmizi)', height: 8, borderRadius: 99, width: `${yuzde}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )
            })}
          </div>
          {Object.keys(kalemGiderleri).length > 0 && (
            <ExportBtn label="Kalem Analizi Excel" onClick={() => kalemlerExcelExport(hareketler, sezonAd)} />
          )}
        </div>
      )}

      {/* Şahsi Hesap */}
      {aktifTab === 'kisiler' && (
        <div>
          {/* Kişi Ödemeleri */}
          {kisiler.filter(k => hareketler.some(h => h.kisi_id === k.id)).length > 0 && (
            <Bolum baslik="👥 Kişi Ödemeleri" toplam={kisiVerilen}>
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
            </Bolum>
          )}

          {/* Şahsi Harcamalar */}
          {sahsiH.length > 0 && (
            <Bolum baslik="💰 Şahsi Harcamalar" toplam={sahsiToplam}>
              {[...sahsiH].sort((a, b) => new Date(a.tarih) - new Date(b.tarih)).map(h => (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBlock: 7, borderBottom: '1px solid var(--kenar)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{h.kalem}</div>
                    <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>{h.aciklama || ''} · {tarihBiçim(h.tarih)}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--kirmizi)' }}>{paraBiçim(h.tutar)}</span>
                </div>
              ))}
            </Bolum>
          )}

          {/* Sanayi & Hizmet */}
          {sanayiH.length > 0 && (
            <Bolum baslik="🔧 Sanayi & Hizmet" toplam={sanayiToplam}>
              {[...sanayiH].sort((a, b) => new Date(a.tarih) - new Date(b.tarih)).map(h => (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBlock: 7, borderBottom: '1px solid var(--kenar)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{h.kalem}</div>
                    <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>{h.aciklama || ''} · {tarihBiçim(h.tarih)}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--kirmizi)' }}>{paraBiçim(h.tutar)}</span>
                </div>
              ))}
            </Bolum>
          )}

          {/* İşçilik */}
          {iscilikKayitlari.length > 0 && (
            <Bolum baslik="👷 İşçilik" toplam={iscilikToplam}>
              {iscilikKayitlari.map(k => (
                <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBlock: 7, borderBottom: '1px solid var(--kenar)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{k.is_tanimi || 'İşçilik'}</div>
                    <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>
                      {k.gun_sayisi} gün · {k.kisi_sayisi} kişi · {k.odendi ? '✅ Ödendi' : '⏳ Bekliyor'}
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--kirmizi)' }}>{paraBiçim(k.odeme_tutari || k.toplam || 0)}</span>
                </div>
              ))}
            </Bolum>
          )}

          {/* Genel Toplam */}
          <div style={{ background: '#0F6E56', borderRadius: 12, padding: 20, marginBottom: 12 }}>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 14 }}>
              💰 Şahsi Hesap Genel Toplam — {sezonAd}
            </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 }}>
              <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>TOPLAM HARCAMA</span>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{paraBiçim(genelToplam)}</span>
            </div>
          </div>

          <ExportBtn label="Kişiler Excel" onClick={() => kisilerExcelExport(kisiler, sezonAd)} />
        </div>
      )}

      {/* Ürün */}
      {aktifTab === 'urun' && (
        <div>
          {/* Özet satırı */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: 13 }}>
            <span style={{ fontWeight: 700 }}>{urunListesi.length} Ürün Tipi</span>
            <span style={{ color: 'var(--yazi-hafif)' }}>•</span>
            <span>Toplam <strong>{tarlalar.reduce((s, t) => s + (parseFloat(t.dekar) || 0), 0).toLocaleString('tr-TR')} dekar</strong></span>
          </div>

          {/* Ürün kartları */}
          {urunListesi.map(urun => {
            const netPozitif = urun.net >= 0

            const urunEmoji = {
              buğday: '🌾', bugday: '🌾', misir: '🌽', mısır: '🌽',
              patates: '🥔', pamuk: '🌸', ayçiçek: '🌻', aycicek: '🌻',
              domates: '🍅', soğan: '🧅', sogan: '🧅',
            }
            const emoji = Object.entries(urunEmoji).find(([k]) => urun.ad.toLowerCase().includes(k))?.[1] || '🌱'

            return (
              <div key={urun.ad} style={{
                background: '#fff', borderRadius: 14, marginBottom: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden',
              }}>
                {/* Kart başlığı */}
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--kenar)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{emoji}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{urun.ad}</div>
                      <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', marginTop: 1 }}>
                        {urun.tarlalar.length} tarla · {urun.toplamDekar.toLocaleString('tr-TR')} dekar
                      </div>
                    </div>
                  </div>
                  {/* Net badge */}
                  <div style={{
                    background: netPozitif ? 'var(--yesil)' : 'var(--kirmizi)',
                    color: '#fff', borderRadius: 10, padding: '6px 12px',
                    fontWeight: 800, fontSize: 14,
                  }}>
                    {netPozitif ? '+' : ''}{paraBiçim(urun.net)}
                  </div>
                </div>

                {/* Metrik satırları */}
                <div style={{ padding: '12px 16px' }}>
                  {/* Gelir / Gider / Marj satırı */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <div style={{ flex: 1, textAlign: 'center', background: 'var(--yesil-acik)', borderRadius: 10, padding: '10px 6px' }}>
                      <div style={{ fontSize: 11, color: 'var(--yesil)', fontWeight: 700, marginBottom: 3 }}>GELİR</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--yesil)' }}>
                        {urun.toplamGelir > 0 ? paraBiçim(urun.toplamGelir) : '—'}
                      </div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', background: 'var(--kirmizi-acik)', borderRadius: 10, padding: '10px 6px' }}>
                      <div style={{ fontSize: 11, color: 'var(--kirmizi)', fontWeight: 700, marginBottom: 3 }}>GİDER</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--kirmizi)' }}>
                        {paraBiçim(urun.toplamGider)}
                      </div>
                    </div>
                    {urun.marjYuzde !== null && (
                      <div style={{ flex: 1, textAlign: 'center', background: urun.marjYuzde >= 0 ? 'var(--yesil-acik)' : 'var(--kirmizi-acik)', borderRadius: 10, padding: '10px 6px' }}>
                        <div style={{ fontSize: 11, color: urun.marjYuzde >= 0 ? 'var(--yesil)' : 'var(--kirmizi)', fontWeight: 700, marginBottom: 3 }}>MARJ</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: urun.marjYuzde >= 0 ? 'var(--yesil)' : 'var(--kirmizi)' }}>
                          %{urun.marjYuzde.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dekar başı maliyet + gelir */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--yazi-hafif)', fontWeight: 600 }}>dk/maliyet: </span>
                      <span style={{ fontWeight: 800, color: 'var(--amber)' }}>{paraBiçim(urun.dekarMaliyet)}</span>
                    </div>
                    {urun.dekarGelir > 0 && (
                      <div>
                        <span style={{ color: 'var(--yazi-hafif)', fontWeight: 600 }}>dk/gelir: </span>
                        <span style={{ fontWeight: 800, color: 'var(--yesil)' }}>{paraBiçim(urun.dekarGelir)}</span>
                      </div>
                    )}
                  </div>

                  {/* Dekar başı maliyet progress bar */}
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--yazi-hafif)', marginBottom: 4 }}>
                      <span>Dekar başı maliyet karşılaştırması</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--kenar)', borderRadius: 999 }}>
                      <div style={{
                        height: '100%',
                        width: `${maxDekarMaliyet > 0 ? Math.max((urun.dekarMaliyet / maxDekarMaliyet) * 100, 3) : 0}%`,
                        background: 'linear-gradient(90deg, var(--amber), #ca6d0e)',
                        borderRadius: 999, transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>

                  {/* Tarlalar listesi (küçük) */}
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {urun.tarlalar.map(t => (
                      <span key={t.id} style={{
                        background: 'var(--zemin)', borderRadius: 6, padding: '3px 8px',
                        fontSize: 12, color: 'var(--yazi-hafif)', fontWeight: 600,
                      }}>
                        {t.ad} ({t.dekar} dk)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Boş durum */}
          {urunListesi.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--yazi-hafif)', fontSize: 14 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
              Tarlalara ürün eklenince burada marj analizi görünecek.
            </div>
          )}
        </div>
      )}

      {/* Karşılaştır */}
      {aktifTab === 'karsilastir' && (
        <div>
          {/* Sezon Seçici */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Karşılaştırılacak Sezonları Seç (max 3)</div>
            {sezonlar.map(s => {
              const oz = sezonOzeti(s.id)
              const secili = karsilastirSezonlar.includes(s.id)
              return (
                <div key={s.id} onClick={() => {
                  if (secili) {
                    setKarsilastirSezonlar(prev => prev.filter(id => id !== s.id))
                  } else if (karsilastirSezonlar.length < 3) {
                    setKarsilastirSezonlar(prev => [...prev, s.id])
                  }
                }} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  marginBottom: 6, border: '1.5px solid',
                  borderColor: secili ? 'var(--yesil)' : 'var(--kenar)',
                  background: secili ? 'var(--yesil-acik)' : '#fff',
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 4, border: '2px solid',
                    borderColor: secili ? 'var(--yesil)' : 'var(--kenar)',
                    background: secili ? 'var(--yesil)' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: '#fff', fontSize: 12,
                  }}>{secili ? '✓' : ''}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{s.ad}</div>
                    <div style={{ fontSize: 12, color: 'var(--yazi-hafif)' }}>{s.baslangic} – {s.bitis}</div>
                  </div>
                  <div style={{
                    fontWeight: 800, fontSize: 13,
                    color: oz.net >= 0 ? 'var(--yesil)' : 'var(--kirmizi)',
                  }}>
                    {oz.net >= 0 ? '+' : ''}{paraBiçim(oz.net)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Hiç sezon seçilmemişse */}
          {karsilastirSezonlar.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--yazi-hafif)', fontSize: 14 }}>
              📈 Karşılaştırmak istediğiniz sezonları yukarıdan seçin (en az 2)
            </div>
          )}

          {/* Karşılaştırma Tablosu */}
          {karsilastirSezonlar.length >= 2 && (
            <>
              <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--kenar)', fontWeight: 700, fontSize: 14 }}>
                  📈 Sezon Karşılaştırması
                </div>
                {/* Tablo başlık satırı */}
                <div style={{ display: 'grid', gridTemplateColumns: `180px ${karsilastirSezonlar.map(() => '1fr').join(' ')}`, padding: '10px 16px', background: 'var(--zemin)', fontSize: 12, fontWeight: 700, color: 'var(--yazi-hafif)' }}>
                  <span>Metrik</span>
                  {karsilastirSezonlar.map(id => {
                    const s = sezonlar.find(s => s.id === id)
                    return <span key={id} style={{ textAlign: 'right' }}>{s?.ad}</span>
                  })}
                </div>
                {/* Metrik satırları */}
                {[
                  { label: '💚 Toplam Gelir', key: 'toplamGelir', format: 'para', renk: 'var(--yesil)' },
                  { label: '🔴 Toplam Gider', key: 'toplamGider', format: 'para', renk: 'var(--kirmizi)' },
                  { label: '📊 Net', key: 'net', format: 'net', renk: null },
                  { label: '📝 İşlem Sayısı', key: 'hareketSayisi', format: 'sayi', renk: 'var(--yazi)' },
                  { label: '🏆 En Büyük Kalem', key: 'enBuyukKalem', format: 'metin', renk: 'var(--amber)' },
                ].map(metrik => (
                  <div key={metrik.label} style={{
                    display: 'grid',
                    gridTemplateColumns: `180px ${karsilastirSezonlar.map(() => '1fr').join(' ')}`,
                    padding: '12px 16px', borderBottom: '1px solid var(--kenar)', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{metrik.label}</span>
                    {karsilastirSezonlar.map(sezonId => {
                      const oz = sezonOzeti(sezonId)
                      const sh = hareketleriOku(sezonId)
                      const kalemToplam = {}
                      sh.filter(h => h.yon === 'gider').forEach(h => {
                        kalemToplam[h.kalem || 'Diğer'] = (kalemToplam[h.kalem || 'Diğer'] || 0) + (h.tutar || 0)
                      })
                      const enBuyukKalem = Object.entries(kalemToplam).sort((a, b) => b[1] - a[1])[0]

                      let deger, renk = metrik.renk
                      if (metrik.key === 'toplamGelir') deger = paraBiçim(oz.toplamGelir)
                      else if (metrik.key === 'toplamGider') deger = paraBiçim(oz.toplamGider)
                      else if (metrik.key === 'net') {
                        deger = (oz.net >= 0 ? '+' : '') + paraBiçim(oz.net)
                        renk = oz.net >= 0 ? 'var(--yesil)' : 'var(--kirmizi)'
                      }
                      else if (metrik.key === 'hareketSayisi') deger = sh.length + ' işlem'
                      else if (metrik.key === 'enBuyukKalem') deger = enBuyukKalem ? `${enBuyukKalem[0]} (${paraBiçim(enBuyukKalem[1])})` : '—'

                      return (
                        <span key={sezonId} style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: renk || 'var(--yazi)' }}>
                          {deger}
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* En Kârlı Tarla Karşılaştırması */}
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🌾 Sezon Bazlı En Kârlı Tarla</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {karsilastirSezonlar.map(sezonId => {
                    const s = sezonlar.find(s => s.id === sezonId)
                    const sh = hareketleriOku(sezonId)
                    const tarlaNetler = tarlalar.map(t => {
                      const tH = sh.filter(h => h.tarla_id === t.id)
                      const net = tH.filter(h => h.yon === 'gelir').reduce((a, h) => a + h.tutar, 0) - tH.filter(h => h.yon === 'gider').reduce((a, h) => a + h.tutar, 0)
                      return { ...t, net }
                    }).filter(t => t.net !== 0).sort((a, b) => b.net - a.net)
                    const enIyi = tarlaNetler[0]
                    return (
                      <div key={sezonId} style={{
                        flex: 1, minWidth: 120, padding: '12px 14px',
                        background: 'var(--yesil-acik)', borderRadius: 10,
                        border: '1px solid var(--kenar)',
                      }}>
                        <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', fontWeight: 600, marginBottom: 4 }}>{s?.ad}</div>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{enIyi?.ad || '—'}</div>
                        {enIyi && <div style={{ fontSize: 13, color: 'var(--yesil)', fontWeight: 700 }}>{paraBiçim(enIyi.net)}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      </> /* arama boşken gösterilen içerik kapanışı */
      )} {/* aramaMetni ternary kapanışı */}
    </div>
  )
}
