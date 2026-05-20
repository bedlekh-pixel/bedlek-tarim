import { useState, useRef, useEffect } from 'react'
import { tarlalariOku, tarlaEkle, tarlaSil, tarlaDuzenle, firmalariOku, tarlaOzeti, hareketleriOku, kalemleriOku, urunleriOku, urunKaydet } from '../../store/db'
import { paraBiçim, tarihBiçim } from '../../utils/format'
import Modal from '../../utils/Modal'
import Onayla from '../../utils/Onayla'

// Ürüne göre emoji ve renk gradyanı
function urunBilgi(urun = '') {
  const u = urun.toLowerCase()
  if (u.includes('buğday') || u.includes('bugday'))
    return { emoji: '🌾', renk1: '#f59e0b', renk2: '#d97706' }
  if (u.includes('mısır') || u.includes('misir'))
    return { emoji: '🌽', renk1: '#eab308', renk2: '#ca8a04' }
  if (u.includes('patates'))
    return { emoji: '🥔', renk1: '#65a30d', renk2: '#4d7c0f' }
  if (u.includes('pamuk'))
    return { emoji: '🌸', renk1: '#ec4899', renk2: '#db2777' }
  if (u.includes('ayçiçek') || u.includes('aycicek'))
    return { emoji: '🌻', renk1: '#f97316', renk2: '#ea580c' }
  if (u.includes('domates'))
    return { emoji: '🍅', renk1: '#ef4444', renk2: '#dc2626' }
  if (u.includes('soğan') || u.includes('sogan'))
    return { emoji: '🧅', renk1: '#a78bfa', renk2: '#7c3aed' }
  return { emoji: '🌱', renk1: '#22c55e', renk2: '#16a34a' }
}

function UrunSecici({ deger, onChange, inputStil }) {
  const [acik, setAcik] = useState(false)
  const [urunler, setUrunler] = useState(urunleriOku)
  const wrapRef = useRef(null)

  const filtrelenmis = deger.trim().length === 0
    ? urunler
    : urunler.filter(u => u.toLowerCase().includes(deger.toLowerCase()))

  const yeniMi = deger.trim().length > 0 &&
    !urunler.some(u => u.toLowerCase() === deger.trim().toLowerCase())

  useEffect(() => {
    function disariTikla(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setAcik(false)
    }
    document.addEventListener('mousedown', disariTikla)
    return () => document.removeEventListener('mousedown', disariTikla)
  }, [])

  function sec(urun) {
    onChange(urun)
    setAcik(false)
  }

  function yeniEkle() {
    const temiz = deger.trim()
    urunKaydet(temiz)
    setUrunler(urunleriOku())
    setAcik(false)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        value={deger}
        onChange={e => { onChange(e.target.value); setAcik(true) }}
        onFocus={() => setAcik(true)}
        placeholder="Ürün seç veya yaz..."
        style={{ ...inputStil, paddingRight: 36 }}
        autoComplete="off"
      />
      {/* Ok ikonu */}
      <span onClick={() => setAcik(a => !a)} style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        cursor: 'pointer', color: 'var(--yazi-hafif)', fontSize: 12, userSelect: 'none',
      }}>▼</span>

      {acik && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1.5px solid var(--kenar)', borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 100,
          maxHeight: 220, overflowY: 'auto',
        }}>
          {/* Yeni ürün ekle butonu */}
          {yeniMi && (
            <div onClick={yeniEkle} style={{
              padding: '10px 14px', cursor: 'pointer', fontWeight: 700,
              color: 'var(--yesil)', fontSize: 13,
              borderBottom: '1px solid var(--kenar)',
              background: 'var(--yesil-acik)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>+</span>
              <span>"{deger.trim()}" ekle ve seç</span>
            </div>
          )}
          {filtrelenmis.length === 0 && !yeniMi && (
            <div style={{ padding: '12px 14px', color: 'var(--yazi-hafif)', fontSize: 13 }}>
              Sonuç bulunamadı
            </div>
          )}
          {filtrelenmis.map(u => (
            <div key={u} onClick={() => sec(u)} style={{
              padding: '10px 14px', cursor: 'pointer', fontSize: 14,
              background: deger === u ? 'var(--yesil-acik)' : '#fff',
              color: deger === u ? 'var(--yesil)' : 'var(--yazi)',
              fontWeight: deger === u ? 700 : 400,
              borderBottom: '1px solid var(--kenar)',
            }}>
              {u}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TarlaForm({ onKapat, onKaydet, duzenlenen }) {
  const firmalar = firmalariOku()
  const [form, setForm] = useState(duzenlenen || {
    ad: '', sahip: '', dekar: '', urun: '',
    modul: 'sozlesmeli', firma_id: '', sezon: '',
  })

  function f(alan, deger) { setForm(prev => ({ ...prev, [alan]: deger })) }

  function kaydet() {
    if (!form.ad.trim()) return
    if (form.urun.trim()) urunKaydet(form.urun.trim())
    if (duzenlenen) {
      tarlaDuzenle(duzenlenen.id, form)
    } else {
      tarlaEkle({ ...form, dekar: parseFloat(form.dekar) || 0 })
    }
    onKaydet()
  }

  const inputStil = {
    width: '100%', padding: '12px 14px', border: '1.5px solid var(--kenar)',
    borderRadius: 10, fontSize: 15, background: '#fff',
    boxSizing: 'border-box',
  }

  return (
    <Modal onKapat={onKapat} genislik={520}>
      <div>
        <div style={{
          position: 'sticky', top: 0, background: 'var(--zemin)',
          padding: '16px 16px 12px', borderBottom: '1px solid var(--kenar)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {duzenlenen ? 'Tarla Düzenle' : '🌾 Yeni Tarla'}
          </div>
          <button onClick={onKapat} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--yazi-hafif)' }}>×</button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarla Adı</label>
            <input value={form.ad} onChange={e => f('ad', e.target.value)}
              placeholder="Muhtarın Tarlası" style={inputStil} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarla Sahibi</label>
            <input value={form.sahip} onChange={e => f('sahip', e.target.value)}
              placeholder="Faik Ökten" style={inputStil} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Dekar</label>
              <input
                type="number"
                inputMode="decimal"
                value={form.dekar}
                onChange={e => f('dekar', e.target.value)}
                placeholder="0"
                style={inputStil}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ekilen Ürün</label>
              <UrunSecici deger={form.urun} onChange={v => f('urun', v)} inputStil={inputStil} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Modül</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => f('modul', 'sozlesmeli')} style={{
                flex: 1, padding: '12px', border: '1.5px solid', borderRadius: 10, cursor: 'pointer',
                fontWeight: 600, fontSize: 14,
                background: form.modul === 'sozlesmeli' ? 'var(--yesil)' : '#fff',
                borderColor: form.modul === 'sozlesmeli' ? 'var(--yesil)' : 'var(--kenar)',
                color: form.modul === 'sozlesmeli' ? '#fff' : 'var(--yazi)',
              }}>🏢 Sözleşmeli</button>
              <button onClick={() => f('modul', 'sahsi')} style={{
                flex: 1, padding: '12px', border: '1.5px solid', borderRadius: 10, cursor: 'pointer',
                fontWeight: 600, fontSize: 14,
                background: form.modul === 'sahsi' ? 'var(--mor)' : '#fff',
                borderColor: form.modul === 'sahsi' ? 'var(--mor)' : 'var(--kenar)',
                color: form.modul === 'sahsi' ? '#fff' : 'var(--yazi)',
              }}>💰 Şahsi</button>
            </div>
          </div>
          {form.modul === 'sozlesmeli' && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Firma</label>
              <select value={form.firma_id} onChange={e => f('firma_id', e.target.value)} style={inputStil}>
                <option value="">Firma seç...</option>
                {firmalar.map(fi => <option key={fi.id} value={fi.id}>{fi.ad}</option>)}
              </select>
            </div>
          )}
          <button onClick={kaydet} style={{
            background: 'var(--yesil)', color: '#fff', border: 'none',
            borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>
            ✓ Kaydet
          </button>
        </div>
      </div>
    </Modal>
  )
}

function TarlaDetay({ tarla, sezon, onKapat }) {
  const hareketler = hareketleriOku(sezon?.id).filter(h => h.tarla_id === tarla.id)
  const oz = tarlaOzeti(tarla.id, sezon?.id)
  const [hareketFiltre, setHareketFiltre] = useState('tumu') // 'tumu' | 'gider' | 'gelir'

  const giderHareketler = hareketler.filter(h => h.yon !== 'gelir')
  const gelirHareketler = hareketler.filter(h => h.yon === 'gelir')

  const kalemGruplari = {}
  giderHareketler.forEach(h => {
    if (!kalemGruplari[h.kalem]) kalemGruplari[h.kalem] = 0
    kalemGruplari[h.kalem] += h.tutar || 0
  })

  const maxKalem = Math.max(...Object.values(kalemGruplari), 1)
  const dekarMaliyet = tarla.dekar > 0 ? oz.toplamGider / tarla.dekar : 0
  const netKarZarar = oz.toplamGelir - oz.toplamGider
  const netPozitif = netKarZarar >= 0

  const filtreliHareketler = hareketler.filter(h => {
    if (hareketFiltre === 'gider') return h.yon !== 'gelir'
    if (hareketFiltre === 'gelir') return h.yon === 'gelir'
    return true
  })

  const { renk1, renk2 } = urunBilgi(tarla.urun)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--zemin)',
      zIndex: 300, overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${renk1}, ${renk2})`,
        padding: '16px',
        paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onKapat} style={{
          background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff',
          borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 18,
          minWidth: 44, minHeight: 44,
        }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{tarla.ad}</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 }}>
            {tarla.urun} · {tarla.dekar} dekar · {tarla.sahip}
          </div>
        </div>
        <span style={{
          background: 'rgba(255,255,255,0.25)', color: '#fff',
          fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
        }}>
          {tarla.modul === 'sozlesmeli' ? '🏢 Sözleşmeli' : '💰 Şahsi'}
        </span>
      </div>

      <div className="sayfa">
        {/* Özet kartlar — 3 sütun */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, color: 'var(--kirmizi)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Toplam Gider</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--kirmizi)', marginTop: 2 }}>{paraBiçim(oz.toplamGider)}</div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dekar Başı</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--amber)', marginTop: 2 }}>{paraBiçim(dekarMaliyet)}</div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, color: netPozitif ? 'var(--yesil)' : 'var(--kirmizi)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Net {netPozitif ? 'Kar' : 'Zarar'}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: netPozitif ? 'var(--yesil)' : 'var(--kirmizi)', marginTop: 2 }}>
              {netPozitif ? '+' : ''}{paraBiçim(netKarZarar)}
            </div>
          </div>
        </div>

        {/* Kalem bazlı giderler + yüzde bar */}
        {Object.keys(kalemGruplari).length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Kalem Bazlı Giderler</div>
            {Object.entries(kalemGruplari).sort((a, b) => b[1] - a[1]).map(([kalem, tutar]) => {
              const yuzde = oz.toplamGider > 0 ? (tutar / oz.toplamGider) * 100 : 0
              return (
                <div key={kalem} style={{ paddingBlock: 10, borderBottom: '1px solid var(--kenar)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span>{kalem}</span>
                    <span style={{ fontWeight: 700 }}>
                      {paraBiçim(tutar)}
                      <span style={{ fontSize: 12, color: 'var(--yazi-hafif)', fontWeight: 400, marginLeft: 6 }}>%{yuzde.toFixed(0)}</span>
                    </span>
                  </div>
                  <div style={{ height: 5, background: 'var(--kenar)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${yuzde}%`,
                      background: `linear-gradient(90deg, ${renk1}, ${renk2})`,
                      borderRadius: 999,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Hareketler + filtre */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Hareketler</div>
            <div style={{ display: 'flex', gap: 4, background: 'var(--zemin)', borderRadius: 8, padding: 3 }}>
              {[
                { key: 'tumu', label: 'Tümü' },
                { key: 'gider', label: 'Gider' },
                { key: 'gelir', label: 'Gelir' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setHareketFiltre(key)}
                  style={{
                    padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600,
                    background: hareketFiltre === key ? '#fff' : 'transparent',
                    color: hareketFiltre === key ? 'var(--yazi)' : 'var(--yazi-hafif)',
                    boxShadow: hareketFiltre === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                  <span style={{ marginLeft: 4, fontSize: 12, opacity: 0.7 }}>
                    ({key === 'tumu' ? hareketler.length : key === 'gider' ? giderHareketler.length : gelirHareketler.length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filtreliHareketler.length === 0 ? (
            <div style={{ color: 'var(--yazi-hafif)', textAlign: 'center', padding: '24px 0', fontSize: 13 }}>
              Bu filtrede hareket yok
            </div>
          ) : (
            [...filtreliHareketler].sort((a, b) => new Date(b.tarih) - new Date(a.tarih)).map(h => (
              <div key={h.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                paddingBlock: 10, borderBottom: '1px solid var(--kenar)',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{h.kalem}</div>
                  <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', marginTop: 1 }}>
                    {h.miktar ? `${h.miktar} ${h.birim} · ` : ''}{tarihBiçim(h.tarih)}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: h.yon === 'gelir' ? 'var(--yesil)' : 'var(--kirmizi)' }}>
                  {h.yon === 'gelir' ? '+' : '-'}{paraBiçim(h.tutar)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const SIRALAMA_SECENEKLERI = [
  { key: 'ad', label: 'İsim' },
  { key: 'gider', label: 'Gider' },
  { key: 'dekar', label: 'Dekar' },
]

export default function TarlarSayfasi({ sezon }) {
  const [tarlalar, setTarlalar] = useState(tarlalariOku)
  const [formAcik, setFormAcik] = useState(false)
  const [duzenlenen, setDuzenlenen] = useState(null)
  const [detayTarla, setDetayTarla] = useState(null)
  const [silinecek, setSilinecek] = useState(null)
  const [siralama, setSiralama] = useState('gider')
  const firmalar = firmalariOku()
  const kalemler = kalemleriOku()

  function yenile() { setTarlalar(tarlalariOku()) }

  function duzenleAc(e, tarla) {
    e.stopPropagation()
    setDuzenlenen(tarla)
    setFormAcik(true)
  }

  function formKapat() {
    setFormAcik(false)
    setDuzenlenen(null)
  }

  const toplamDekar = tarlalar.reduce((s, t) => s + (parseFloat(t.dekar) || 0), 0)
  const toplamGider = tarlalar.reduce((s, t) => s + (tarlaOzeti(t.id, sezon?.id).toplamGider || 0), 0)
  const toplamGelir = tarlalar.reduce((s, t) => s + (tarlaOzeti(t.id, sezon?.id).toplamGelir || 0), 0)

  const dekarBasilar = tarlalar.map(t => {
    const oz = tarlaOzeti(t.id, sezon?.id)
    return t.dekar > 0 ? oz.toplamGider / t.dekar : 0
  })
  const maxDekarBasi = Math.max(...dekarBasilar, 1)

  const siralanmisTarlalar = [...tarlalar].sort((a, b) => {
    if (siralama === 'ad') return a.ad.localeCompare(b.ad, 'tr')
    if (siralama === 'dekar') return (parseFloat(b.dekar) || 0) - (parseFloat(a.dekar) || 0)
    if (siralama === 'gider') {
      const ga = tarlaOzeti(a.id, sezon?.id).toplamGider
      const gb = tarlaOzeti(b.id, sezon?.id).toplamGider
      return gb - ga
    }
    return 0
  })

  return (
    <div className="sayfa">
      {/* Üst: başlık + ekle butonu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tarlalar.length > 0 ? 10 : 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Tarlalar</div>
        <button
          onClick={() => { setDuzenlenen(null); setFormAcik(true) }}
          style={{
            background: 'var(--yesil)', color: '#fff', border: 'none',
            borderRadius: 10, padding: '11px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, minHeight: 44,
          }}
        >
          <span style={{ fontSize: 16 }}>+</span> Tarla Ekle
        </button>
      </div>

      {/* Özet + sıralama */}
      {tarlalar.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            background: '#fff', borderRadius: 10, padding: '10px 14px',
            marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
            fontSize: 12, color: 'var(--yazi-hafif)', fontWeight: 500,
          }}>
            <span style={{ fontWeight: 700, color: 'var(--yazi)' }}>{tarlalar.length} Tarla</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>Toplam <strong style={{ color: 'var(--yazi)' }}>{toplamDekar.toLocaleString('tr-TR')} dekar</strong></span>
            {toplamGider > 0 && <>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>Gider <strong style={{ color: 'var(--kirmizi)' }}>{paraBiçim(toplamGider)}</strong></span>
            </>}
            {toplamGelir > 0 && <>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>Gelir <strong style={{ color: 'var(--yesil)' }}>{paraBiçim(toplamGelir)}</strong></span>
            </>}
          </div>
          {/* Sıralama */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--yazi-hafif)', fontWeight: 600 }}>Sırala:</span>
            {SIRALAMA_SECENEKLERI.map(s => (
              <button key={s.key} onClick={() => setSiralama(s.key)} style={{
                padding: '5px 12px', borderRadius: 8, border: '1.5px solid',
                borderColor: siralama === s.key ? 'var(--yesil)' : 'var(--kenar)',
                background: siralama === s.key ? 'var(--yesil-acik)' : '#fff',
                color: siralama === s.key ? 'var(--yesil)' : 'var(--yazi-hafif)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>{s.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Boş durum */}
      {tarlalar.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16, lineHeight: 1 }}>🌾</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--yazi)', marginBottom: 8 }}>
            Henüz tarla eklenmemiş
          </div>
          <div style={{ fontSize: 14, color: 'var(--yazi-hafif)', marginBottom: 28, lineHeight: 1.5 }}>
            Tarlaları ekleyerek gider ve gelir takibi yapabilirsiniz.
          </div>
          <button
            onClick={() => { setDuzenlenen(null); setFormAcik(true) }}
            style={{
              background: 'var(--yesil)', color: '#fff', border: 'none',
              borderRadius: 12, padding: '14px 28px', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', minHeight: 52,
            }}
          >
            🌾 İlk Tarlayı Ekle
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {siralanmisTarlalar.map((tarla) => {
            const oz = tarlaOzeti(tarla.id, sezon?.id)
            const { emoji, renk1, renk2 } = urunBilgi(tarla.urun)
            const dekarBasi = tarla.dekar > 0 ? oz.toplamGider / tarla.dekar : 0
            const progressYuzde = maxDekarBasi > 0 ? (dekarBasi / maxDekarBasi) * 100 : 0
            const net = oz.toplamGelir - oz.toplamGider
            const netPozitif = net > 0
            const firma = firmalar.find(f => f.id === tarla.firma_id)

            // En büyük gider kalemi
            const tarlaHareketleri = hareketleriOku(sezon?.id).filter(h => h.tarla_id === tarla.id && h.yon === 'gider')
            const kalemToplam = {}
            tarlaHareketleri.forEach(h => {
              if (h.kalem) kalemToplam[h.kalem] = (kalemToplam[h.kalem] || 0) + (h.tutar || 0)
            })
            const enBuyukKalem = Object.entries(kalemToplam).sort((a, b) => b[1] - a[1])[0]
            const kalemBilgi = enBuyukKalem
              ? kalemler.find(k => k.ad === enBuyukKalem[0])
              : null

            return (
              <div
                key={tarla.id}
                onClick={() => setDetayTarla(tarla)}
                style={{
                  background: '#fff', borderRadius: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                {/* Gradient header */}
                <div style={{
                  background: `linear-gradient(135deg, ${renk1}, ${renk2})`,
                  padding: '16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 22 }}>{emoji}</span>
                      <span style={{
                        fontWeight: 800, fontSize: 16, color: '#fff',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{tarla.ad}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                      {[tarla.sahip, tarla.dekar ? `${tarla.dekar} dönüm` : null, tarla.urun].filter(Boolean).join(' · ')}
                    </div>
                    {firma && (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>
                        🏢 {firma.ad}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.25)', color: '#fff',
                      fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                      letterSpacing: 0.3,
                    }}>
                      {tarla.modul === 'sozlesmeli' ? 'Sözleşmeli' : 'Şahsi'}
                    </span>
                    {(oz.toplamGelir > 0 || oz.toplamGider > 0) && (
                      <span style={{
                        background: netPozitif ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                        color: '#fff', fontSize: 12, fontWeight: 800,
                        padding: '3px 8px', borderRadius: 20,
                      }}>
                        {netPozitif ? '+' : ''}{paraBiçim(net)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Gider + dekar başı */}
                <div style={{ padding: '12px 14px 0' }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', fontWeight: 600, marginBottom: 2 }}>📉 Gider</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: oz.toplamGider > 0 ? 'var(--kirmizi)' : 'var(--yazi-hafif)' }}>
                        {oz.toplamGider > 0 ? paraBiçim(oz.toplamGider) : '—'}
                      </div>
                    </div>
                    {tarla.dekar > 0 && oz.toplamGider > 0 && (
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', fontWeight: 600, marginBottom: 2 }}>📊 dk/başı</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--amber)' }}>
                          {paraBiçim(dekarBasi)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {oz.toplamGider > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ height: 5, background: 'var(--kenar)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${Math.max(progressYuzde, 4)}%`,
                          background: `linear-gradient(90deg, ${renk1}, ${renk2})`,
                          borderRadius: 999, transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  )}

                  {/* En büyük kalem + hareket sayısı */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    {enBuyukKalem ? (
                      <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{kalemBilgi?.ikon || '📌'}</span>
                        <span style={{ fontWeight: 600, color: 'var(--yazi)' }}>{enBuyukKalem[0]}</span>
                        <span>{paraBiçim(enBuyukKalem[1])}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--yazi-hafif)' }}>Kayıt yok</span>
                    )}
                    {tarlaHareketleri.length > 0 && (
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: 'var(--yazi-hafif)',
                        background: 'var(--zemin)', borderRadius: 6, padding: '2px 7px',
                      }}>
                        {tarlaHareketleri.length} işlem
                      </span>
                    )}
                  </div>
                </div>

                {/* Alt: Düzenle + Sil */}
                <div style={{
                  display: 'flex', gap: 8, padding: '10px 12px 12px',
                  borderTop: '1px solid var(--kenar)', marginTop: 'auto',
                }}>
                  <button
                    onClick={e => duzenleAc(e, tarla)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      background: 'var(--zemin)', border: '1.5px solid var(--kenar)',
                      color: 'var(--yazi)', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, padding: '10px 8px', borderRadius: 10, minHeight: 44,
                    }}
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setSilinecek(tarla) }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      background: 'var(--kirmizi-acik)', border: '1.5px solid transparent',
                      color: 'var(--kirmizi)', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, padding: '10px 14px', borderRadius: 10, minHeight: 44,
                    }}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {formAcik && (
        <TarlaForm
          duzenlenen={duzenlenen}
          onKapat={formKapat}
          onKaydet={() => { formKapat(); yenile() }}
        />
      )}

      {detayTarla && (
        <TarlaDetay
          tarla={detayTarla}
          sezon={sezon}
          onKapat={() => setDetayTarla(null)}
        />
      )}

      {silinecek && (
        <Onayla
          mesaj="Bu kayıt silinsin mi?"
          onOnayla={() => { tarlaSil(silinecek.id); setSilinecek(null); yenile() }}
          onIptal={() => setSilinecek(null)}
        />
      )}
    </div>
  )
}
