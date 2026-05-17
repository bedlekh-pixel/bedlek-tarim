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

  const kaydet = () => {
    if (!form.kalem || !form.tutar) return
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
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 20 }}>⚡ Hızlı Ödeme</div>

        {/* Kaynak seçimi */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Para nereden çıkıyor?</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ v: 'cep', l: '💳 Kendi Cebim' }, { v: 'avans', l: '🏢 Firma Avansı' }].map(o => (
              <button key={o.v} onClick={() => f('kaynak', o.v)} style={{
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
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Firma</label>
            <select value={form.firma_id} onChange={e => f('firma_id', e.target.value)} style={inputStil}>
              <option value="">Firma seç</option>
              {firmalar.map(f2 => <option key={f2.id} value={f2.id}>{f2.ad}</option>)}
            </select>
          </div>
        )}

        {/* Kalem */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kalem</label>
          <select value={form.kalem} onChange={e => f('kalem', e.target.value)} style={inputStil}>
            <option value="">Kalem seç</option>
            {kalemler.map(k => <option key={k.id} value={k.ad}>{k.ikon} {k.ad}</option>)}
          </select>
        </div>

        {/* Tutar */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tutar (₺)</label>
          <input type="number" value={form.tutar} onChange={e => f('tutar', e.target.value)}
            placeholder="0" style={inputStil} />
        </div>

        {/* Kişi */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kişi (opsiyonel)</label>
          <select value={form.kisi_id} onChange={e => f('kisi_id', e.target.value)} style={inputStil}>
            <option value="">Kişi seç</option>
            {kisiler.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}
          </select>
        </div>

        {/* Tarla */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarla (opsiyonel)</label>
          <select value={form.tarla_id} onChange={e => f('tarla_id', e.target.value)} style={inputStil}>
            <option value="">Tarla seç</option>
            {tarlalar.map(t => <option key={t.id} value={t.id}>{t.ad}</option>)}
          </select>
        </div>

        {/* Açıklama */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Açıklama (opsiyonel)</label>
          <input type="text" value={form.aciklama} onChange={e => f('aciklama', e.target.value)}
            placeholder="Ödeme açıklaması" style={inputStil} />
        </div>

        <button onClick={kaydet} style={{
          width: '100%', padding: '14px', background: 'var(--yesil)',
          color: '#fff', border: 'none', borderRadius: 12,
          fontSize: 15, fontWeight: 800, cursor: 'pointer',
        }}>
          ✅ Kaydет
        </button>
      </div>
    </div>
  )
}

// ─── Hızlı Hammadde Girişi Modal ─────────────────────────────

function HizliHammaddeModal({ sezon, onKapat, onKaydet }) {
  const firmalar = firmalariOku()
  const tarlalar = tarlalariOku()

  const [form, setForm] = useState({
    kaynak: 'sozlesmeli',
    firma_id: '',
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
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 20 }}>📦 Hızlı Hammadde Girişi</div>

        {/* Kaynak */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kimden geldi?</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ v: 'sozlesmeli', l: '🏢 Sözleşmeliden' }, { v: 'sahsi', l: '💰 Şahsi' }].map(o => (
              <button key={o.v} onClick={() => f('kaynak', o.v)} style={{
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
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Firma</label>
            <select value={form.firma_id} onChange={e => f('firma_id', e.target.value)} style={inputStil}>
              <option value="">Firma seç</option>
              {firmalar.map(f2 => <option key={f2.id} value={f2.id}>{f2.ad}</option>)}
            </select>
          </div>
        )}

        {/* Kalem */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Hammadde</label>
          <input type="text" value={form.kalem} onChange={e => f('kalem', e.target.value)}
            placeholder="örn: Buğday tohumu, Gübre..." style={inputStil} />
        </div>

        {/* Miktar + Birim */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Miktar</label>
            <input type="number" value={form.miktar} onChange={e => f('miktar', e.target.value)}
              placeholder="0" style={inputStil} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Birim</label>
            <select value={form.birim} onChange={e => f('birim', e.target.value)} style={inputStil}>
              {['kg', 'lt', 'ton', 'çuval', 'adet'].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        {/* Birim Fiyat */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Birim Fiyat (₺) {tutar > 0 && <span style={{ color: 'var(--yesil)', fontWeight: 700 }}>→ Toplam: {paraBiçim(tutar)}</span>}
          </label>
          <input type="number" value={form.birim_fiyat} onChange={e => f('birim_fiyat', e.target.value)}
            placeholder="0" style={inputStil} />
        </div>

        {/* Tarla */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarla (opsiyonel)</label>
          <select value={form.tarla_id} onChange={e => f('tarla_id', e.target.value)} style={inputStil}>
            <option value="">Tarla seç</option>
            {tarlalar.map(t => <option key={t.id} value={t.id}>{t.ad}</option>)}
          </select>
        </div>

        {/* Açıklama */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Açıklama (opsiyonel)</label>
          <input type="text" value={form.aciklama} onChange={e => f('aciklama', e.target.value)}
            placeholder="Ek not" style={inputStil} />
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

// ─── Ana Sayfa ────────────────────────────────────────────────

export default function OzetSayfasi({ sezon, setSayfa }) {
  const [odemeAcik, setOdemeAcik] = useState(false)
  const [hammaddeAcik, setHammaddeAcik] = useState(false)
  const [yenile, setYenile] = useState(0)

  const ozet = sezonOzeti(sezon?.id)
  const hareketler = hareketleriOku(sezon?.id)
  const tarlalar = tarlalariOku()
  const firmalar = firmalariOku()

  const sonHareketler = [...hareketler]
    .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
    .slice(0, 5)

  const kısayollar = [
    { ikon: '🏢', label: 'Sözleşmeli', sayfa: 'sozlesmeli', renk: '#185FA5' },
    { ikon: '💰', label: 'Şahsi', sayfa: 'sahsi', renk: '#7C3AED' },
    { ikon: '🌾', label: 'Tarlalar', sayfa: 'tarlalar', renk: '#0F6E56' },
    { ikon: '🚜', label: 'Hasat', sayfa: 'hasat', renk: '#D97706' },
    { ikon: '👥', label: 'Kişiler', sayfa: 'kisiler', renk: '#374151' },
    { ikon: '📋', label: 'Raporlar', sayfa: 'raporlar', renk: '#854F0B' },
  ]

  return (
    <div className="sayfa" key={yenile}>

      {/* Hava Durumu */}
      <HavaDurumu />

      {/* Stat Kartları */}
      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div style={{ background: 'var(--yesil-acik)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--yesil)', fontWeight: 700, marginBottom: 4 }}>💚 Toplam Gelir</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--yesil)' }}>{paraBiçim(ozet.toplamGelir)}</div>
        </div>
        <div style={{ background: 'var(--kirmizi-acik)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--kirmizi)', fontWeight: 700, marginBottom: 4 }}>🔴 Toplam Gider</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--kirmizi)' }}>{paraBiçim(ozet.toplamGider)}</div>
        </div>
        <div style={{ background: ozet.net >= 0 ? 'var(--yesil)' : 'var(--kirmizi)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 4 }}>📊 Net</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
            {ozet.net >= 0 ? '+' : ''}{paraBiçim(ozet.net)}
          </div>
        </div>
      </div>

      {/* Hızlı Eylemler */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button onClick={() => setOdemeAcik(true)} style={{
          flex: 1, padding: '14px 10px', background: 'var(--yesil)',
          color: '#fff', border: 'none', borderRadius: 14,
          fontSize: 14, fontWeight: 800, cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          Hızlı Ödeme
        </button>
        <button onClick={() => setHammaddeAcik(true)} style={{
          flex: 1, padding: '14px 10px', background: '#854F0B',
          color: '#fff', border: 'none', borderRadius: 14,
          fontSize: 14, fontWeight: 800, cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 24 }}>📦</span>
          Hammadde Gir
        </button>
      </div>

      {/* Kısayollar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, marginBottom: 16,
      }}>
        {kısayollar.map(k => (
          <button key={k.sayfa} onClick={() => setSayfa(k.sayfa)} style={{
            padding: '14px 8px', border: 'none', borderRadius: 14,
            background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 24 }}>{k.ikon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: k.renk }}>{k.label}</span>
          </button>
        ))}
      </div>

      {/* Son Hareketler */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🕐 Son Hareketler</div>
        {sonHareketler.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--yazi-hafif)', padding: '20px 0', fontSize: 13 }}>
            Henüz kayıt yok
          </div>
        ) : sonHareketler.map(h => {
          const tarla = tarlalar.find(t => t.id === h.tarla_id)
          const firma = firmalar.find(f => f.id === h.firma_id)
          return (
            <div key={h.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBlock: 9, borderBottom: '1px solid var(--kenar)',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{h.kalem || h.tur}</div>
                <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>
                  {tarla?.ad || firma?.ad || h.aciklama || ''} · {kisaTarih(h.tarih)}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: h.yon === 'gelir' ? 'var(--yesil)' : 'var(--kirmizi)' }}>
                {h.yon === 'gelir' ? '+' : '-'}{paraBiçim(h.tutar)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modallar */}
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
