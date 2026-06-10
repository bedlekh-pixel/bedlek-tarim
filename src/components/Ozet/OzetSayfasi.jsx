import { useState, useEffect } from 'react'
import {
  sezonOzeti, hareketleriOku, hareketEkle,
  firmalariOku, tarlalariOku, kisileriOku, kalemleriOku, ayarlariOku
} from '../../store/db'
import { paraBiçim, kisaTarih, bugun } from '../../utils/format'

// ─── Hava Durumu ──────────────────────────────────────────────

const WMO = {
  0: { ikon: '☀️', ad: 'Açık' },
  1: { ikon: '🌤️', ad: 'Az bulutlu' },
  2: { ikon: '⛅', ad: 'Parçalı' },
  3: { ikon: '☁️', ad: 'Bulutlu' },
  45: { ikon: '🌫️', ad: 'Sisli' },
  48: { ikon: '🌫️', ad: 'Sisli' },
  51: { ikon: '🌦️', ad: 'Çiseleme' },
  53: { ikon: '🌦️', ad: 'Çiseleme' },
  55: { ikon: '🌦️', ad: 'Çiseleme' },
  61: { ikon: '🌧️', ad: 'Yağmurlu' },
  63: { ikon: '🌧️', ad: 'Yağmurlu' },
  65: { ikon: '🌧️', ad: 'Yağmurlu' },
  71: { ikon: '❄️', ad: 'Karlı' },
  73: { ikon: '❄️', ad: 'Karlı' },
  75: { ikon: '❄️', ad: 'Karlı' },
  80: { ikon: '🌧️', ad: 'Sağanak' },
  81: { ikon: '🌧️', ad: 'Sağanak' },
  82: { ikon: '⛈️', ad: 'Şiddetli' },
  95: { ikon: '⛈️', ad: 'Fırtına' },
  96: { ikon: '⛈️', ad: 'Dolulu' },
  99: { ikon: '⛈️', ad: 'Dolulu' },
}

const GUNLER = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

function HavaDurumu() {
  const [hava, setHava] = useState(null)
  const [yuklen, setYuklen] = useState(true)

  useEffect(() => {
    // Hilvan, Şanlıurfa koordinatları
    fetch('https://api.open-meteo.com/v1/forecast?latitude=37.58&longitude=38.97&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe%2FIstanbul&forecast_days=10')
      .then(r => r.json())
      .then(d => { setHava(d.daily); setYuklen(false) })
      .catch(() => setYuklen(false))
  }, [])

  if (yuklen) return (
    <div style={{ background: 'linear-gradient(135deg, #0F6E56, #1a9a72)', borderRadius: 16, padding: '16px 20px', marginBottom: 16, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
      🌤️ Hilvan hava durumu yükleniyor…
    </div>
  )

  if (!hava) return null

  return (
    <div style={{ background: 'linear-gradient(135deg, #0F6E56, #1a9a72)', borderRadius: 16, padding: '16px 20px', marginBottom: 16 }}>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <span>📍 Hilvan, Şanlıurfa — 10 Günlük Hava</span>
        <span style={{ fontSize: 11 }}>Open-Meteo</span>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {hava.time.map((tarih, i) => {
          const d = new Date(tarih)
          const gun = GUNLER[d.getDay()]
          const wmo = WMO[hava.weathercode[i]] || { ikon: '🌡️', ad: '' }
          const yagis = hava.precipitation_sum[i]
          return (
            <div key={tarih} style={{
              minWidth: 64, textAlign: 'center',
              background: i === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '10px 6px',
              border: i === 0 ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                {i === 0 ? 'Bugün' : gun}
              </div>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{wmo.ikon}</div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>
                {Math.round(hava.temperature_2m_max[i])}°
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                {Math.round(hava.temperature_2m_min[i])}°
              </div>
              {yagis > 0 && (
                <div style={{ fontSize: 10, color: '#93C5FD', marginTop: 2 }}>
                  {yagis.toFixed(1)}mm
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Hızlı Ödeme Modal ────────────────────────────────────────

function HizliOdemeModal({ sezon, onKapat, onKaydet }) {
  const firmalar = firmalariOku()
  const tarlalar = tarlalariOku()
  const kisiler = kisileriOku()
  const kalemler = kalemleriOku()

  const [form, setForm] = useState({
    kaynak: 'cep',
    firma_id: '',
    kalem: '',
    tutar: '',
    aciklama: '',
    tarla_id: '',
    kisi_id: '',
    tarih: bugun(),
  })

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const inputStil = {
    width: '100%', padding: '10px 12px', border: '1.5px solid var(--kenar)',
    borderRadius: 10, fontSize: 14, boxSizing: 'border-box',
    background: '#fff', outline: 'none',
  }

  const [hata, setHata] = useState('')

  const kaydet = () => {
    if (!form.tutar) { setHata('Tutar giriniz'); return }
    if (!form.kalem) { setHata('Kalem seçiniz'); return }
    setHata('')
    const kisi = kisiler.find(k => k.id === form.kisi_id)
    const tarla = tarlalar.find(t => t.id === form.tarla_id)
    const firma = firmalar.find(f2 => f2.id === form.firma_id)
    const aciklama = form.aciklama ||
      [kisi?.ad, tarla?.ad, firma?.ad].filter(Boolean).join(' · ') ||
      form.kalem

    hareketEkle({
      tarih: form.tarih,
      tur: 'harcama',
      yon: 'gider',
      kalem: form.kalem,
      tutar: parseFloat(form.tutar),
      kaynak: form.kaynak,
      firma_id: form.kaynak === 'avans' ? form.firma_id : '',
      tarla_id: form.tarla_id,
      kisi_id: form.kisi_id,
      aciklama,
      sezon: sezon?.id,
    })
    onKaydet()
    onKapat()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end',
    }} onClick={onKapat}>
      <div style={{
        width: '100%', maxWidth: 480, margin: '0 auto',
        background: '#fff', borderRadius: '20px 20px 0 0',
        padding: '24px 20px 32px', maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>⚡ Hızlı Ödeme</div>
          <button aria-label="Kapat" onClick={onKapat} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--yazi-hafif)', lineHeight: 1, padding: '4px 8px' }}>×</button>
        </div>

        {/* Kaynak seçimi */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Para nereden çıkıyor?</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ v: 'cep', l: '💳 Kendi Cebim' }, { v: 'avans', l: '🏢 Firma Avansı' }].map(o => (
              <button key={o.v} onClick={() => f('kaynak', o.v)} aria-pressed={form.kaynak === o.v} style={{
                flex: 1, padding: '10px', border: '1.5px solid',
                borderColor: form.kaynak === o.v ? 'var(--yesil)' : 'var(--kenar)',
                background: form.kaynak === o.v ? 'var(--yesil-acik)' : '#fff',
                borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: form.kaynak === o.v ? 'var(--yesil)' : 'var(--yazi)',
              }}>{o.l}</button>
            ))}
          </div>
        </div>

        {/* Firma seçimi (avans ise) */}
        {form.kaynak === 'avans' && (
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="hizli-firma" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Firma</label>
            <select id="hizli-firma" value={form.firma_id} onChange={e => f('firma_id', e.target.value)} style={inputStil}>
              <option value="">Firma seç</option>
              {firmalar.map(f2 => <option key={f2.id} value={f2.id}>{f2.ad}</option>)}
            </select>
          </div>
        )}

        {/* Kalem */}
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="hizli-kalem" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kalem</label>
          <select id="hizli-kalem" value={form.kalem} onChange={e => f('kalem', e.target.value)} style={inputStil}>
            <option value="">Kalem seç</option>
            {kalemler.map(k => <option key={k.id} value={k.ad}>{k.ikon} {k.ad}</option>)}
          </select>
        </div>

        {/* Tutar */}
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="hizli-tutar" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tutar (₺)</label>
          <input id="hizli-tutar" type="number" inputMode="decimal" value={form.tutar} onChange={e => f('tutar', e.target.value)}
            placeholder="0" style={inputStil} />
        </div>

        {/* Kişi */}
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="hizli-kisi" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kişi (opsiyonel)</label>
          <select id="hizli-kisi" value={form.kisi_id} onChange={e => f('kisi_id', e.target.value)} style={inputStil}>
            <option value="">Kişi seç</option>
            {kisiler.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}
          </select>
        </div>

        {/* Tarla */}
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="hizli-tarla" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarla (opsiyonel)</label>
          <select id="hizli-tarla" value={form.tarla_id} onChange={e => f('tarla_id', e.target.value)} style={inputStil}>
            <option value="">Tarla seç</option>
            {tarlalar.map(t => <option key={t.id} value={t.id}>{t.ad}</option>)}
          </select>
        </div>

        {/* Açıklama */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="hizli-aciklama" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Açıklama (opsiyonel)</label>
          <input id="hizli-aciklama" type="text" value={form.aciklama} onChange={e => f('aciklama', e.target.value)}
            placeholder="Ödeme açıklaması" style={inputStil} />
        </div>

        {hata && <div style={{ color: 'var(--kirmizi)', fontSize: 13, marginBottom: 10, fontWeight: 600 }}>⚠️ {hata}</div>}
        <button onClick={kaydet} style={{
          width: '100%', padding: '14px', background: 'var(--yesil)',
          color: '#fff', border: 'none', borderRadius: 12,
          fontSize: 15, fontWeight: 800, cursor: 'pointer',
        }}>
          ✅ Kaydet
        </button>
      </div>
    </div>
  )
}

// ─── Hızlı Hammadde Girişi Modal ─────────────────────────────

function HizliHammaddeModal({ sezon, onKapat, onKaydet }) {
  const firmalar = firmalariOku()
  const tarlalar = tarlalariOku()
  const tedarikciler = kisileriOku().filter(k => k.tur === 'tedarikci')
  const kalemler = kalemleriOku()

  const [form, setForm] = useState({
    kaynak: 'sozlesmeli',
    firma_id: '',
    kisi_id: '',
    kalem: '',
    miktar: '',
    birim: 'kg',
    birim_fiyat: '',
    tarla_id: '',
    aciklama: '',
    tarih: bugun(),
  })

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const tutar = (parseFloat(form.miktar) || 0) * (parseFloat(form.birim_fiyat) || 0)

  const inputStil = {
    width: '100%', padding: '10px 12px', border: '1.5px solid var(--kenar)',
    borderRadius: 10, fontSize: 14, boxSizing: 'border-box',
    background: '#fff', outline: 'none',
  }

  const kaydet = () => {
    if (!form.kalem || !form.miktar) return
    const firma = firmalar.find(f2 => f2.id === form.firma_id)
    const tarla = tarlalar.find(t => t.id === form.tarla_id)
    const aciklama = form.aciklama ||
      ['Hammadde', form.kalem, firma?.ad ? `— ${firma.ad}` : ''].filter(Boolean).join(' ')

    hareketEkle({
      tarih: form.tarih,
      tur: 'hammadde',
      yon: 'gider',
      kalem: form.kalem,
      miktar: parseFloat(form.miktar),
      birim: form.birim,
      birim_fiyat: parseFloat(form.birim_fiyat) || 0,
      tutar: tutar || 0,
      kaynak: form.kaynak === 'sozlesmeli' ? 'avans' : 'cep',
      firma_id: form.kaynak === 'sozlesmeli' ? form.firma_id : '',
      kisi_id: form.kisi_id || '',
      tarla_id: form.tarla_id,
      aciklama,
      sezon: sezon?.id,
    })
    onKaydet()
    onKapat()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end',
    }} onClick={onKapat}>
      <div style={{
        width: '100%', maxWidth: 480, margin: '0 auto',
        background: '#fff', borderRadius: '20px 20px 0 0',
        padding: '24px 20px 32px', maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>📦 Hızlı Hammadde Girişi</div>
          <button aria-label="Kapat" onClick={onKapat} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--yazi-hafif)', lineHeight: 1, padding: '4px 8px' }}>×</button>
        </div>

        {/* Kaynak */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kimden geldi?</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ v: 'sozlesmeli', l: '🏢 Sözleşmeliden' }, { v: 'sahsi', l: '💰 Şahsi' }].map(o => (
              <button key={o.v} onClick={() => f('kaynak', o.v)} aria-pressed={form.kaynak === o.v} style={{
                flex: 1, padding: '10px', border: '1.5px solid',
                borderColor: form.kaynak === o.v ? 'var(--yesil)' : 'var(--kenar)',
                background: form.kaynak === o.v ? 'var(--yesil-acik)' : '#fff',
                borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: form.kaynak === o.v ? 'var(--yesil)' : 'var(--yazi)',
              }}>{o.l}</button>
            ))}
          </div>
        </div>

        {/* Firma */}
        {form.kaynak === 'sozlesmeli' && (
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="hm-firma" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Firma</label>
            <select id="hm-firma" value={form.firma_id} onChange={e => f('firma_id', e.target.value)} style={inputStil}>
              <option value="">Firma seç</option>
              {firmalar.map(f2 => <option key={f2.id} value={f2.id}>{f2.ad}</option>)}
            </select>
          </div>
        )}

        {/* Tedarikçi */}
        {tedarikciler.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="hm-kisi" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tedarikçi (opsiyonel)</label>
            <select id="hm-kisi" value={form.kisi_id} onChange={e => f('kisi_id', e.target.value)} style={inputStil}>
              <option value="">Tedarikçi seç</option>
              {tedarikciler.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}
            </select>
          </div>
        )}

        {/* Kalem */}
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="hm-kalem" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Hammadde / Kalem</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {kalemler.map(k => (
              <button key={k.id} onClick={() => f('kalem', k.ad)} aria-pressed={form.kalem === k.ad} style={{
                padding: '6px 12px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer', fontSize: 12,
                fontWeight: form.kalem === k.ad ? 700 : 400,
                background: form.kalem === k.ad ? k.renk : '#fff',
                borderColor: form.kalem === k.ad ? k.renk : 'var(--kenar)',
                color: form.kalem === k.ad ? '#fff' : 'var(--yazi)',
              }}>{k.ikon} {k.ad}</button>
            ))}
          </div>
          <input id="hm-kalem" type="text" value={form.kalem} onChange={e => f('kalem', e.target.value)}
            placeholder="veya özel gir: Buğday tohumu..." style={inputStil} />
        </div>

        {/* Miktar + Birim */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 2 }}>
            <label htmlFor="hm-miktar" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Miktar</label>
            <input id="hm-miktar" type="number" inputMode="decimal" value={form.miktar} onChange={e => f('miktar', e.target.value)}
              placeholder="0" style={inputStil} />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="hm-birim" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Birim</label>
            <select id="hm-birim" value={form.birim} onChange={e => f('birim', e.target.value)} style={inputStil}>
              {['kg', 'lt', 'ton', 'çuval', 'adet'].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        {/* Birim Fiyat */}
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="hm-birim-fiyat" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Birim Fiyat (₺) {tutar > 0 && <span style={{ color: 'var(--yesil)', fontWeight: 700 }}>→ Toplam: {paraBiçim(tutar)}</span>}
          </label>
          <input id="hm-birim-fiyat" type="number" inputMode="decimal" value={form.birim_fiyat} onChange={e => f('birim_fiyat', e.target.value)}
            placeholder="0" style={inputStil} />
        </div>

        {/* Tarla */}
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="hm-tarla" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarla (opsiyonel)</label>
          <select id="hm-tarla" value={form.tarla_id} onChange={e => f('tarla_id', e.target.value)} style={inputStil}>
            <option value="">Tarla seç</option>
            {tarlalar.map(t => <option key={t.id} value={t.id}>{t.ad}</option>)}
          </select>
        </div>

        {/* Açıklama */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="hm-aciklama" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Marka / Açıklama (opsiyonel)</label>
          <input id="hm-aciklama" type="text" value={form.aciklama} onChange={e => f('aciklama', e.target.value)}
            placeholder="örn: Gübre markası, ilaç adı..." style={inputStil} />
        </div>

        <button onClick={kaydet} style={{
          width: '100%', padding: '14px', background: '#854F0B',
          color: '#fff', border: 'none', borderRadius: 12,
          fontSize: 15, fontWeight: 800, cursor: 'pointer',
        }}>
          ✅ Kaydet
        </button>
      </div>
    </div>
  )
}

// ─── Uyarı Kartları ───────────────────────────────────────────

function UyariKartlari({ sezonId }) {
  const firmalar = firmalariOku()
  const hareketler = hareketleriOku(sezonId)
  const ESIK = 10000

  const dusukAvanslar = firmalar.map(firma => {
    const firmaHareketleri = hareketler.filter(h => h.firma_id === firma.id)
    const toplamAvans = firmaHareketleri
      .filter(h => h.tur === 'nakit_avans' && h.yon === 'gelir')
      .reduce((t, h) => t + (h.tutar || 0), 0)
    const toplamHarcama = firmaHareketleri
      .filter(h => h.kaynak === 'avans' && h.yon === 'gider')
      .reduce((t, h) => t + (h.tutar || 0), 0)
    const kalan = toplamAvans - toplamHarcama
    return { firma, kalan }
  }).filter(x => x.kalan < ESIK && x.kalan >= 0)

  if (dusukAvanslar.length === 0) return null

  return (
    <div style={{ marginBottom: 16 }}>
      {dusukAvanslar.map(({ firma, kalan }) => (
        <div key={firma.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
          border: '1.5px solid #F59E0B',
          borderRadius: 14, padding: '12px 16px', marginBottom: 8,
        }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>
              {firma.ad} — Düşük Avans
            </div>
            <div style={{ fontSize: 12, color: '#B45309', marginTop: 2 }}>
              Kalan avans: <strong>{paraBiçim(kalan)}</strong> — 10.000₺ eşiğin altında
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Ana Sayfa ────────────────────────────────────────────────

export default function OzetSayfasi({ sezon, setSayfa }) {
  const [odemeAcik, setOdemeAcik] = useState(false)
  const [hammaddeAcik, setHammaddeAcik] = useState(false)
  const [yenile, setYenile] = useState(0)
  const [ozGizli, setOzGizli] = useState(() =>
    localStorage.getItem('bt_ozet_gizli') === 'true'
  )

  const ozGizliToggle = () => {
    const yeni = !ozGizli
    setOzGizli(yeni)
    localStorage.setItem('bt_ozet_gizli', yeni)
  }

  const ozet = sezonOzeti(sezon?.id)
  const hareketler = hareketleriOku(sezon?.id)
  const tarlalar = tarlalariOku()
  const kisiler = kisileriOku()
  const firmalar = firmalariOku()

  const sonHareketler = [...hareketler]
    .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
    .slice(0, 5)

  const kısayollar = [
    { ikon: '🏢', label: 'Sözleşmeli', sayfa: 'sozlesmeli', renk: '#185FA5', sayi: firmalar.length },
    { ikon: '💰', label: 'Şahsi', sayfa: 'sahsi', renk: '#7C3AED', sayi: null },
    { ikon: '🌾', label: 'Tarlalar', sayfa: 'tarlalar', renk: '#0F6E56', sayi: tarlalar.length },
    { ikon: '🚜', label: 'Hasat', sayfa: 'hasat', renk: '#D97706', sayi: null },
    { ikon: '👥', label: 'Kişiler', sayfa: 'kisiler', renk: '#374151', sayi: kisiler.length },
    { ikon: '📋', label: 'Raporlar', sayfa: 'raporlar', renk: '#854F0B', sayi: null },
  ]

  const net = ozet.net ?? (ozet.toplamGelir - ozet.toplamGider)
  const netPozitif = net >= 0

  return (
    <div className="sayfa" key={yenile}>

      {/* ── Hero Banner ── */}
      <div style={{
        background: netPozitif
          ? 'linear-gradient(135deg, #0F6E56 0%, #1a9a72 60%, #16a879 100%)'
          : 'linear-gradient(135deg, #991B1B 0%, #DC2626 60%, #EF4444 100%)',
        borderRadius: 20, marginBottom: 16,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* dekoratif daireler */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        {/* Üst satır: sezon adı + toggle */}
        <div
          onClick={ozGizliToggle}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: ozGizli ? '14px 20px' : '18px 20px 0',
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          <div>
            <div style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 800, fontSize: 15 }}>
              💰 {sezon?.ad || 'Sezon'}
            </div>
            {!ozGizli && sezon?.baslangic && sezon?.bitis && (
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>
                {kisaTarih(sezon.baslangic)} – {kisaTarih(sezon.bitis)}
              </div>
            )}
          </div>
          <span style={{
            background: 'rgba(255,255,255,0.2)', borderRadius: 8,
            padding: '5px 10px', color: '#fff', fontSize: 12, fontWeight: 700,
          }}>
            {ozGizli ? '👁 Göster' : '🙈 Gizle'}
          </span>
        </div>

        {/* Gizlenebilir içerik */}
        {!ozGizli && (
          <div style={{ padding: '14px 20px 20px' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>NET</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>
                {netPozitif ? '+' : ''}{paraBiçim(net)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 2 }}>GELİR</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>+{paraBiçim(ozet.toplamGelir)}</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 2 }}>GİDER</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>-{paraBiçim(ozet.toplamGider)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Hava Durumu ── */}
      <HavaDurumu />

      {/* ── Uyarı Kartları ── */}
      <UyariKartlari sezonId={sezon?.id} />

      {/* ── Hızlı Eylemler ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button onClick={() => setOdemeAcik(true)} style={{
          flex: 1, padding: '18px 10px',
          background: 'linear-gradient(135deg, var(--yesil), #1a9a72)',
          color: '#fff', border: 'none', borderRadius: 16,
          fontSize: 15, fontWeight: 800, cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 12px rgba(15,110,86,0.3)',
          minHeight: 80,
        }}>
          <span style={{ fontSize: 28 }}>⚡</span>
          Hızlı Ödeme
        </button>
        <button onClick={() => setHammaddeAcik(true)} style={{
          flex: 1, padding: '18px 10px',
          background: 'linear-gradient(135deg, #854F0B, #A16207)',
          color: '#fff', border: 'none', borderRadius: 16,
          fontSize: 15, fontWeight: 800, cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 12px rgba(133,79,11,0.3)',
          minHeight: 80,
        }}>
          <span style={{ fontSize: 28 }}>📦</span>
          Hammadde Gir
        </button>
      </div>

      {/* ── Navigasyon Kısayolları ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, marginBottom: 16,
      }}>
        {kısayollar.map(k => (
          <button key={k.sayfa} onClick={() => setSayfa(k.sayfa)} style={{
            padding: '16px 8px 14px', border: '1.5px solid var(--kenar)', borderRadius: 16,
            background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 5, minHeight: 90, position: 'relative',
          }}>
            <span style={{ fontSize: 26 }}>{k.ikon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: k.renk }}>{k.label}</span>
            {k.sayi != null && (
              <span style={{
                position: 'absolute', top: 8, right: 8,
                background: k.renk, color: '#fff',
                fontSize: 10, fontWeight: 700, borderRadius: 6,
                padding: '1px 5px', minWidth: 16, textAlign: 'center',
              }}>{k.sayi}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Son Hareketler ── */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: '16px 18px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--yazi)' }}>
          🕐 Son Hareketler
        </div>
        {sonHareketler.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--yazi-hafif)', padding: '20px 0', fontSize: 13 }}>
            Henüz kayıt yok
          </div>
        ) : sonHareketler.map(h => {
          const tarla = tarlalar.find(t => t.id === h.tarla_id)
          const firma = firmalar.find(f => f.id === h.firma_id)
          const alt = [tarla?.ad, firma?.ad, h.aciklama].filter(Boolean)[0] || ''
          const gelir = h.yon === 'gelir'
          const gosterilenTutar = (h.miktar && h.birim_fiyat) ? h.miktar * h.birim_fiyat : h.tutar
          return (
            <div key={h.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBlock: 11, borderBottom: '1px solid var(--kenar)',
            }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--yazi)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {h.kalem || h.tur}
                </div>
                {alt && (
                  <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {alt}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 800,
                  color: gelir ? 'var(--yesil)' : 'var(--kirmizi)',
                }}>
                  {gelir ? '+' : '-'}{paraBiçim(gosterilenTutar)}
                </div>
                <div style={{
                  fontSize: 10, color: 'var(--yazi-hafif)',
                  background: 'var(--zemin)', borderRadius: 5, padding: '2px 6px',
                }}>
                  {kisaTarih(h.tarih)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Modallar ── */}
      {odemeAcik && (
        <HizliOdemeModal
          sezon={sezon}
          onKapat={() => setOdemeAcik(false)}
          onKaydet={() => setYenile(n => n + 1)}
        />
      )}
      {hammaddeAcik && (
        <HizliHammaddeModal
          sezon={sezon}
          onKapat={() => setHammaddeAcik(false)}
          onKaydet={() => setYenile(n => n + 1)}
        />
      )}
    </div>
  )
}
