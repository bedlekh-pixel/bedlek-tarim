import { useState } from 'react'
import { hareketleriOku, hareketEkle, hareketSil, hareketDuzenle, tarlalariOku, kalemleriOku, tarlaEkle, kisileriOku, sezonKilitliMi } from '../../store/db'
import { paraBiçim, tarihBiçim, bugun } from '../../utils/format'
import Modal from '../../utils/Modal'
import Onayla from '../../utils/Onayla'
import IscilikSayfasi from './IscilikSayfasi'

const SANAYI_KALEMLER = [
  { id: 'servis', ad: 'Servis Ücreti', ikon: '🔧' },
  { id: 'tamirat', ad: 'Ekipman Tamiri', ikon: '⚙️' },
  { id: 'yedek_parca', ad: 'Yedek Parça', ikon: '🔩' },
  { id: 'iscilik', ad: 'İşçilik', ikon: '👷' },
  { id: 'nakliye', ad: 'Nakliye/Taşıma', ikon: '🚛' },
  { id: 'kira', ad: 'Ekipman/Araç Kirası', ikon: '🚜' },
  { id: 'akaryakit', ad: 'Akaryakıt', ikon: '⛽' },
  { id: 'diger', ad: 'Muhtelif', ikon: '📋' },
]

// ─── Tarla Seçici (inline tarla ekleme) ──────────────────────
function TarlaSecici({ tarlalar: baseTarlalar, secili, onSec, inputStil }) {
  const [tarlalar, setTarlalar] = useState(baseTarlalar)
  const [yeniAcik, setYeniAcik] = useState(false)
  const [yeniAd, setYeniAd] = useState('')
  const [yeniDekar, setYeniDekar] = useState('')
  const [yeniUrun, setYeniUrun] = useState('')

  function tarlaKaydet() {
    if (!yeniAd.trim()) return
    const yeni = tarlaEkle({ ad: yeniAd.trim(), dekar: parseFloat(yeniDekar) || 0, urun: yeniUrun.trim(), modul: 'sahsi' })
    setTarlalar(tarlalariOku())
    onSec(yeni.id)
    setYeniAd(''); setYeniDekar(''); setYeniUrun('')
    setYeniAcik(false)
  }

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Hangi Tarla?</label>
      <select value={secili} onChange={e => onSec(e.target.value)} style={inputStil}>
        <option value="">Seç (opsiyonel)</option>
        {tarlalar.map(t => <option key={t.id} value={t.id}>{t.ad} ({t.dekar} dk)</option>)}
      </select>
      {!yeniAcik ? (
        <button onClick={() => setYeniAcik(true)} style={{
          marginTop: 6, background: 'none', border: 'none', color: 'var(--yesil)',
          cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: 0,
        }}>+ Yeni tarla ekle</button>
      ) : (
        <div style={{ marginTop: 8, padding: 12, background: 'var(--yesil-acik)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input autoFocus value={yeniAd} onChange={e => setYeniAd(e.target.value)}
            placeholder="Tarla adı" style={{ ...inputStil, fontSize: 13, padding: '8px 10px' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" inputMode="decimal" value={yeniDekar} onChange={e => setYeniDekar(e.target.value)}
              placeholder="Dekar" style={{ ...inputStil, fontSize: 13, padding: '8px 10px', flex: 1 }} />
            <input value={yeniUrun} onChange={e => setYeniUrun(e.target.value)}
              placeholder="Ürün" style={{ ...inputStil, fontSize: 13, padding: '8px 10px', flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setYeniAcik(false)} style={{ flex: 1, padding: '8px', background: '#fff', border: '1px solid var(--kenar)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>İptal</button>
            <button onClick={tarlaKaydet} style={{ flex: 2, padding: '8px', background: 'var(--yesil)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✓ Ekle</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Şahsi Harcama Formu ─────────────────────────────────────
function HarcamaForm({ sezon, tarlalar, kalemler, onKapat, onKaydet, duzenlenen }) {
  const tedarikciler = kisileriOku().filter(k => k.tur === 'tedarikci')
  const [form, setForm] = useState(duzenlenen ? {
    tarih: duzenlenen.tarih || bugun(),
    tarla_id: duzenlenen.tarla_id || '',
    kalem: duzenlenen.kalem || '',
    miktar: duzenlenen.miktar != null ? String(duzenlenen.miktar) : '',
    birim: duzenlenen.birim || 'kg',
    birim_fiyat: duzenlenen.birim_fiyat != null ? String(duzenlenen.birim_fiyat) : '',
    tutar: duzenlenen.tutar != null ? String(duzenlenen.tutar) : '',
    aciklama: duzenlenen.aciklama || '',
    kisi_id: duzenlenen.kisi_id || '',
  } : { tarih: bugun(), tarla_id: '', kalem: '', miktar: '', birim: 'kg', birim_fiyat: '', tutar: '', aciklama: '', kisi_id: '' })

  function f(alan, deger) {
    setForm(prev => {
      const yeni = { ...prev, [alan]: deger }
      if (alan === 'miktar' || alan === 'birim_fiyat') {
        const m = alan === 'miktar' ? deger : prev.miktar
        const b = alan === 'birim_fiyat' ? deger : prev.birim_fiyat
        if (m && b) yeni.tutar = String(parseFloat(m) * parseFloat(b))
      }
      return yeni
    })
  }

  function kaydet() {
    const veri = {
      tarih: form.tarih, sezon: sezon?.id, modul: 'sahsi',
      yon: 'gider', tur: 'harcama', kaynak: 'cep',
      kalem: form.kalem, miktar: parseFloat(form.miktar) || 0,
      birim: form.birim, birim_fiyat: parseFloat(form.birim_fiyat) || 0,
      tutar: parseFloat(form.tutar) || 0,
      tarla_id: form.tarla_id || null, aciklama: form.aciklama,
      kisi_id: form.kisi_id || null,
    }
    if (duzenlenen) hareketDuzenle(duzenlenen.id, veri)
    else hareketEkle(veri)
    onKaydet()
  }

  const inp = { width: '100%', padding: '12px 14px', border: '1.5px solid var(--kenar)', borderRadius: 10, fontSize: 16, background: '#fff', outline: 'none' }

  return (
    <Modal onKapat={onKapat} genislik={520}>
      <div>
        <div style={{ position: 'sticky', top: 0, background: 'var(--zemin)', padding: '16px 16px 12px', borderBottom: '1px solid var(--kenar)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{duzenlenen ? '✏️ Harcama Düzenle' : '💰 Şahsi Harcama'}</div>
          <button onClick={onKapat} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--yazi-hafif)' }}>×</button>
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Ne aldın?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {kalemler.map(k => (
                <button key={k.id} onClick={() => f('kalem', k.ad)} style={{
                  padding: '8px 12px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer', fontSize: 13,
                  fontWeight: form.kalem === k.ad ? 700 : 400,
                  background: form.kalem === k.ad ? k.renk : '#fff',
                  borderColor: form.kalem === k.ad ? k.renk : 'var(--kenar)',
                  color: form.kalem === k.ad ? '#fff' : 'var(--yazi)',
                }}>{k.ikon} {k.ad}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Miktar</label>
              <input type="number" inputMode="numeric" value={form.miktar} onChange={e => f('miktar', e.target.value)} placeholder="0" style={inp} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Birim</label>
              <select value={form.birim} onChange={e => f('birim', e.target.value)} style={inp}>
                {['kg', 'lt', 'adet', 'çuval', 'ton'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Birim Fiyat (TL)</label>
            <input type="number" inputMode="decimal" value={form.birim_fiyat} onChange={e => f('birim_fiyat', e.target.value)} placeholder="0" style={inp} />
          </div>
          {form.tutar ? (
            <div style={{ background: 'var(--mor-acik)', border: '1.5px solid var(--mor)', borderRadius: 10, padding: '10px 14px', fontWeight: 700, color: 'var(--mor)', fontSize: 15 }}>
              Toplam: {paraBiçim(parseFloat(form.tutar))}
            </div>
          ) : null}
          {tedarikciler.length > 0 && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tedarikçi (opsiyonel)</label>
              <select value={form.kisi_id} onChange={e => f('kisi_id', e.target.value)} style={inp}>
                <option value="">Tedarikçi seç</option>
                {tedarikciler.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}
              </select>
            </div>
          )}
          <TarlaSecici tarlalar={tarlalariOku()} secili={form.tarla_id} onSec={id => f('tarla_id', id)} inputStil={inp} />
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarih</label>
            <input type="date" value={form.tarih} onChange={e => f('tarih', e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Açıklama (opsiyonel)</label>
            <input type="text" value={form.aciklama} onChange={e => f('aciklama', e.target.value)} placeholder="Notlar..." style={inp} />
          </div>
          <button onClick={kaydet} style={{ background: 'var(--mor)', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            ✓ {duzenlenen ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Sanayi & Hizmet Ödeme Formu ─────────────────────────────
function SanayiForm({ sezon, onKapat, onKaydet, duzenlenen }) {
  const kisiler = kisileriOku()
  const [form, setForm] = useState(duzenlenen ? {
    tarih: duzenlenen.tarih || bugun(),
    kalem: duzenlenen.kalem || '',
    tutar: duzenlenen.tutar != null ? String(duzenlenen.tutar) : '',
    aciklama: duzenlenen.aciklama || '',
    kisi_id: duzenlenen.kisi_id || '',
    fatura_no: duzenlenen.fatura_no || '',
  } : { tarih: bugun(), kalem: '', tutar: '', aciklama: '', kisi_id: '', fatura_no: '' })

  function f(alan, v) { setForm(p => ({ ...p, [alan]: v })) }

  function kaydet() {
    if (!form.tutar) return
    const veri = {
      tarih: form.tarih, sezon: sezon?.id,
      modul: 'sanayi', yon: 'gider', tur: 'sanayi_odeme',
      kalem: form.kalem, tutar: parseFloat(form.tutar) || 0,
      aciklama: form.aciklama, kisi_id: form.kisi_id || null,
      fatura_no: form.fatura_no,
    }
    if (duzenlenen) hareketDuzenle(duzenlenen.id, veri)
    else hareketEkle(veri)
    onKaydet()
  }

  const inp = { width: '100%', padding: '12px 14px', border: '1.5px solid var(--kenar)', borderRadius: 10, fontSize: 15, background: '#fff' }

  return (
    <Modal onKapat={onKapat} genislik={500}>
      <div>
        <div style={{ position: 'sticky', top: 0, background: 'var(--zemin)', padding: '16px 16px 12px', borderBottom: '1px solid var(--kenar)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{duzenlenen ? '✏️ Ödeme Düzenle' : '🏭 Sanayi & Hizmet Ödemesi'}</div>
          <button onClick={onKapat} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--yazi-hafif)' }}>×</button>
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Kalem seçimi */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Ödeme Türü</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SANAYI_KALEMLER.map(k => (
                <button key={k.id} onClick={() => f('kalem', k.ad)} style={{
                  padding: '8px 12px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer', fontSize: 13,
                  fontWeight: form.kalem === k.ad ? 700 : 400,
                  background: form.kalem === k.ad ? '#374151' : '#fff',
                  borderColor: form.kalem === k.ad ? '#374151' : 'var(--kenar)',
                  color: form.kalem === k.ad ? '#fff' : 'var(--yazi)',
                }}>{k.ikon} {k.ad}</button>
              ))}
            </div>
          </div>

          {/* Tutar */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tutar (TL)</label>
            <input type="number" inputMode="numeric" value={form.tutar} onChange={e => f('tutar', e.target.value)} placeholder="0" style={inp} />
          </div>

          {/* Ödenen kişi/firma */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kime Ödendi?</label>
            <select value={form.kisi_id} onChange={e => f('kisi_id', e.target.value)} style={inp}>
              <option value="">Seç (opsiyonel)</option>
              {kisiler.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}
            </select>
          </div>

          {/* Fatura/Fiş No */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Fatura / Fiş No (opsiyonel)</label>
            <input type="text" value={form.fatura_no} onChange={e => f('fatura_no', e.target.value)} placeholder="FTR-001" style={inp} />
          </div>

          {/* Tarih */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarih</label>
            <input type="date" value={form.tarih} onChange={e => f('tarih', e.target.value)} style={inp} />
          </div>

          {/* Açıklama */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Açıklama</label>
            <textarea value={form.aciklama} onChange={e => f('aciklama', e.target.value)}
              placeholder="Traktör fren tamiri, Erkan Petrol yakıt faturası..." rows={2}
              style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
          </div>

          <button onClick={kaydet} style={{ background: '#374151', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            ✓ {duzenlenen ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Sanayi & Hizmet Listesi ─────────────────────────────────
function SanayiListesi({ sezon }) {
  const [formAcik, setFormAcik] = useState(false)
  const [duzenlenen, setDuzenlenen] = useState(null)
  const [silinecek, setSilinecek] = useState(null)
  const [tick, setTick] = useState(0)
  const kisiler = kisileriOku()

  const hareketler = hareketleriOku(sezon?.id).filter(h => h.modul === 'sanayi')
  const toplamGider = hareketler.reduce((t, h) => t + (h.tutar || 0), 0)

  // Kalem bazlı gruplama
  const kalemGruplari = {}
  hareketler.forEach(h => {
    const key = h.kalem || 'Diğer'
    if (!kalemGruplari[key]) kalemGruplari[key] = []
    kalemGruplari[key].push(h)
  })

  function yenile() { setTick(t => t + 1) }
  function formKapat() { setFormAcik(false); setDuzenlenen(null) }

  return (
    <div>
      {/* Özet bar */}
      <div style={{
        background: '#374151', borderRadius: 12, padding: '14px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
      }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Sanayi & Hizmet Toplam</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{paraBiçim(toplamGider)}</div>
        </div>
        <button onClick={() => { setDuzenlenen(null); setFormAcik(true) }} style={{
          background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)',
          color: '#fff', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 700,
        }}>+ Ödeme Ekle</button>
      </div>

      {/* Kalem bazlı gruplama */}
      {Object.entries(kalemGruplari).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--yazi-hafif)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏭</div>
          <div style={{ marginBottom: 4 }}>Henüz kayıt yok</div>
          <div style={{ fontSize: 12 }}>Servis, tamirat, işçilik ödemelerini buraya ekle</div>
        </div>
      ) : (
        Object.entries(kalemGruplari).map(([kalem, liste]) => {
          const kalemToplam = liste.reduce((t, h) => t + (h.tutar || 0), 0)
          const kalemBilgi = SANAYI_KALEMLER.find(k => k.ad === kalem)
          return (
            <div key={kalem} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {kalemBilgi?.ikon || '📋'} {kalem}
                </div>
                <div style={{ fontWeight: 700, color: '#374151' }}>{paraBiçim(kalemToplam)}</div>
              </div>
              {[...liste].sort((a, b) => new Date(b.tarih) - new Date(a.tarih)).map(h => {
                const kisi = kisiler.find(k => k.id === h.kisi_id)
                return (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBlock: 8, borderBottom: '1px solid var(--kenar)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {kisi ? kisi.ad : h.aciklama || h.kalem}
                      </div>
                      {h.aciklama && kisi && <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 1 }}>{h.aciklama}</div>}
                      <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 1, display: 'flex', gap: 8 }}>
                        <span>{tarihBiçim(h.tarih)}</span>
                        {h.fatura_no && <span style={{ background: '#f3f4f6', padding: '0 4px', borderRadius: 3 }}>{h.fatura_no}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--kirmizi)' }}>-{paraBiçim(h.tutar)}</div>
                      <button onClick={() => { setDuzenlenen(h); setFormAcik(true) }} title="Düzenle" style={{
                        background: 'none', border: '1px solid var(--kenar)', color: 'var(--yazi-hafif)',
                        cursor: 'pointer', fontSize: 12, padding: '2px 6px', borderRadius: 6,
                      }}>✏️</button>
                      <button onClick={() => setSilinecek(h)} title="Sil" style={{
                        background: 'none', border: 'none', color: 'var(--yazi-hafif)', cursor: 'pointer', fontSize: 16, padding: '2px',
                      }}>×</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })
      )}

      {formAcik && (
        <SanayiForm sezon={sezon} duzenlenen={duzenlenen} onKapat={formKapat} onKaydet={() => { formKapat(); yenile() }} />
      )}
      {silinecek && (
        <Onayla
          mesaj="Bu kayıt silinsin mi?"
          onEvet={() => { hareketSil(silinecek.id); setSilinecek(null); yenile() }}
          onHayir={() => setSilinecek(null)}
        />
      )}
    </div>
  )
}

// ─── Şahsi Ana Sayfa ─────────────────────────────────────────
export default function SahsiSayfasi({ sezon }) {
  const [sekme, setSekme] = useState('harcama')
  const [formAcik, setFormAcik] = useState(false)
  const [duzenlenen, setDuzenlenen] = useState(null)
  const [silinecek, setSilinecek] = useState(null)
  const [tick, setTick] = useState(0)
  const [filtreTur, setFiltreTur] = useState('tumu')
  const [filtreArama, setFiltreArama] = useState('')
  const tarlalar = tarlalariOku()
  const kalemler = kalemleriOku()

  const tumHareketler = hareketleriOku(sezon?.id).filter(h => h.modul === 'sahsi')
  const toplamGider = tumHareketler.reduce((t, h) => t + (h.tutar || 0), 0)

  const hareketler = tumHareketler
    .filter(h => filtreTur === 'tumu' ||
      (filtreTur === 'gelir' && h.yon === 'gelir') ||
      (filtreTur === 'gider' && h.yon === 'gider') ||
      (filtreTur === 'iscilik' && h.kalem === 'İşçilik'))
    .filter(h => !filtreArama ||
      h.kalem?.toLowerCase().includes(filtreArama.toLowerCase()) ||
      h.aciklama?.toLowerCase().includes(filtreArama.toLowerCase()))

  const tarlaGruplari = {}
  hareketler.forEach(h => {
    const key = h.tarla_id || '__genel'
    if (!tarlaGruplari[key]) tarlaGruplari[key] = []
    tarlaGruplari[key].push(h)
  })

  function yenile() { setTick(t => t + 1) }
  function formKapat() { setFormAcik(false); setDuzenlenen(null) }

  const SEKMELER = [
    { id: 'harcama', label: '💰 Şahsi' },
    { id: 'sanayi', label: '🏭 Sanayi' },
    { id: 'iscilik', label: '👷 İşçilik' },
  ]

  return (
    <div className="sayfa">
      {/* Sekme navigasyonu */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {SEKMELER.map(s => (
          <button key={s.id} onClick={() => setSekme(s.id)} style={{
            flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid', cursor: 'pointer',
            fontWeight: 700, fontSize: 13,
            background: sekme === s.id ? (s.id === 'sanayi' ? '#374151' : s.id === 'iscilik' ? '#C2410C' : 'var(--mor)') : '#fff',
            borderColor: sekme === s.id ? (s.id === 'sanayi' ? '#374151' : s.id === 'iscilik' ? '#C2410C' : 'var(--mor)') : 'var(--kenar)',
            color: sekme === s.id ? '#fff' : 'var(--yazi)',
          }}>{s.label}</button>
        ))}
      </div>

      {/* Şahsi Harcamalar */}
      {sekme === 'harcama' && (
        <>
          <div style={{
            background: 'var(--mor)', borderRadius: 12, padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
          }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Şahsi Toplam Gider</div>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{paraBiçim(toplamGider)}</div>
            </div>
            <button onClick={() => {
              if (sezonKilitliMi(sezon?.id)) {
                alert('Bu sezon kilitlidir. Yeni hareket eklenemez.')
                return
              }
              setDuzenlenen(null)
              setFormAcik(true)
            }} style={{
              background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)',
              color: '#fff', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            }}>+ Harcama Ekle</button>
          </div>

          {/* Filtre Bar */}
          <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="text"
              placeholder="Kalem, açıklama ara..."
              value={filtreArama}
              onChange={e => setFiltreArama(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', border: '1.5px solid var(--kenar)',
                borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'tumu', label: 'Tümü' },
                { id: 'gider', label: 'Gider' },
                { id: 'gelir', label: 'Gelir' },
                { id: 'iscilik', label: 'İşçilik' },
              ].map(btn => (
                <button key={btn.id} onClick={() => setFiltreTur(btn.id)} style={{
                  borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: '1.5px solid var(--kenar)',
                  background: filtreTur === btn.id ? 'var(--yesil)' : '#fff',
                  color: filtreTur === btn.id ? '#fff' : 'var(--yazi)',
                  borderColor: filtreTur === btn.id ? 'var(--yesil)' : 'var(--kenar)',
                }}>{btn.label}</button>
              ))}
            </div>
          </div>

          {Object.entries(tarlaGruplari).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--yazi-hafif)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💰</div>
              Henüz şahsi harcama yok
            </div>
          ) : (
            Object.entries(tarlaGruplari).map(([tarlaId, liste]) => {
              const tarla = tarlalar.find(t => t.id === tarlaId)
              const toplam = liste.reduce((s, h) => s + (h.tutar || 0), 0)
              return (
                <div key={tarlaId} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>🌾 {tarla?.ad || 'Genel'}</div>
                    <div style={{ fontWeight: 700, color: 'var(--mor)' }}>{paraBiçim(toplam)}</div>
                  </div>
                  {liste.map(h => (
                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBlock: 8, borderBottom: '1px solid var(--kenar)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{h.kalem}</div>
                        <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 1 }}>
                          {h.miktar ? `${h.miktar} ${h.birim} · ` : ''}{tarihBiçim(h.tarih)}
                        </div>
                        {h.aciklama && <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>{h.aciklama}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--kirmizi)' }}>-{paraBiçim(h.tutar)}</div>
                        <button onClick={() => { setDuzenlenen(h); setFormAcik(true) }} title="Düzenle" style={{
                          background: 'none', border: '1px solid var(--kenar)', color: 'var(--yazi-hafif)',
                          cursor: 'pointer', fontSize: 12, padding: '2px 6px', borderRadius: 6,
                        }}>✏️</button>
                        <button onClick={() => setSilinecek(h)} title="Sil" style={{
                          background: 'none', border: 'none', color: 'var(--yazi-hafif)', cursor: 'pointer', fontSize: 16, padding: '2px',
                        }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })
          )}

          {formAcik && (
            <HarcamaForm sezon={sezon} tarlalar={tarlalar} kalemler={kalemler}
              duzenlenen={duzenlenen} onKapat={formKapat} onKaydet={() => { formKapat(); yenile() }} />
          )}
          {silinecek && (
            <Onayla
              mesaj="Bu kayıt silinsin mi?"
              onEvet={() => { hareketSil(silinecek.id); setSilinecek(null); yenile() }}
              onHayir={() => setSilinecek(null)}
            />
          )}
        </>
      )}

      {/* Sanayi & Hizmet */}
      {sekme === 'sanayi' && <SanayiListesi sezon={sezon} />}

      {/* İşçilik */}
      {sekme === 'iscilik' && <IscilikSayfasi sezon={sezon} />}
    </div>
  )
}
