import { useState } from 'react'
import { hareketleriOku, hareketEkle, hareketSil, hareketDuzenle, tarlalariOku, kisileriOku } from '../../store/db'
import { paraBiçim, sayiBiçim, tarihBiçim, bugun } from '../../utils/format'
import Modal from '../../utils/Modal'
import Onayla from '../../utils/Onayla'

function TeslimatForm({ sezon, tarlalar, kisiler, onKapat, onKaydet, duzenlenen }) {
  const [form, setForm] = useState(duzenlenen ? {
    tarih: duzenlenen.tarih || bugun(),
    fis_no: duzenlenen.fis_no || '',
    tarla_id: duzenlenen.tarla_id || '',
    kisi_id: duzenlenen.kisi_id || '',
    net_kg: duzenlenen.miktar != null ? String(duzenlenen.miktar) : '',
    polar_yuzde: duzenlenen.polar_yuzde != null ? String(duzenlenen.polar_yuzde) : '',
    kg_fiyat: duzenlenen.birim_fiyat != null ? String(duzenlenen.birim_fiyat) : '',
    tutar: duzenlenen.tutar != null ? String(duzenlenen.tutar) : '',
    urun: duzenlenen.kalem || '',
    aciklama: duzenlenen.aciklama || '',
  } : {
    tarih: bugun(), fis_no: '', tarla_id: '', kisi_id: '',
    net_kg: '', polar_yuzde: '', kg_fiyat: '', tutar: '',
    urun: '', aciklama: '',
  })

  function f(alan, deger) {
    setForm(prev => {
      const yeni = { ...prev, [alan]: deger }
      if (alan === 'net_kg' || alan === 'kg_fiyat') {
        const kg = alan === 'net_kg' ? deger : prev.net_kg
        const fiyat = alan === 'kg_fiyat' ? deger : prev.kg_fiyat
        if (kg && fiyat) yeni.tutar = String(parseFloat(kg) * parseFloat(fiyat))
      }
      return yeni
    })
  }

  function kaydet() {
    const veri = {
      tarih: form.tarih,
      sezon: sezon?.id,
      tur: 'hasat',
      yon: 'gelir',
      kalem: form.urun || 'Hasat',
      tarla_id: form.tarla_id || null,
      kisi_id: form.kisi_id || null,
      miktar: parseFloat(form.net_kg) || 0,
      birim: 'kg',
      birim_fiyat: parseFloat(form.kg_fiyat) || 0,
      tutar: parseFloat(form.tutar) || 0,
      aciklama: [form.fis_no ? `Fiş: ${form.fis_no}` : '', form.polar_yuzde ? `Polar: %${form.polar_yuzde}` : '', form.aciklama].filter(Boolean).join(' | '),
      fis_no: form.fis_no,
      polar_yuzde: parseFloat(form.polar_yuzde) || null,
    }
    if (duzenlenen) {
      hareketDuzenle(duzenlenen.id, veri)
    } else {
      hareketEkle(veri)
    }
    onKaydet()
  }

  const inputStil = {
    width: '100%', padding: '12px 14px', border: '1.5px solid var(--kenar)',
    borderRadius: 10, fontSize: 15, background: '#fff',
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
            {duzenlenen ? '✏️ Teslimat Düzenle' : '🚜 Hasat / Teslimat'}
          </div>
          <button onClick={onKapat} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--yazi-hafif)' }}>×</button>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ürün</label>
            <input value={form.urun} onChange={e => f('urun', e.target.value)}
              placeholder="Şeker Pancarı, Patates..." style={inputStil} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Fiş No</label>
              <input value={form.fis_no} onChange={e => f('fis_no', e.target.value)}
                placeholder="12345" style={inputStil} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Polar % (opsiyonel)</label>
              <input type="number" inputMode="decimal" value={form.polar_yuzde}
                onChange={e => f('polar_yuzde', e.target.value)} placeholder="18.5" style={inputStil} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Net KG</label>
            <input type="number" inputMode="numeric" value={form.net_kg}
              onChange={e => f('net_kg', e.target.value)} placeholder="0" style={inputStil} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>KG Fiyatı (TL)</label>
            <input type="number" inputMode="decimal" value={form.kg_fiyat}
              onChange={e => f('kg_fiyat', e.target.value)} placeholder="0.00" style={inputStil} />
          </div>
          {form.tutar ? (
            <div style={{
              background: 'var(--yesil-acik)', border: '1.5px solid var(--yesil)',
              borderRadius: 10, padding: '10px 14px',
              fontWeight: 700, color: 'var(--yesil)', fontSize: 15,
            }}>
              Kamyon Değeri: {paraBiçim(parseFloat(form.tutar))}
            </div>
          ) : null}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarla</label>
            <select value={form.tarla_id} onChange={e => f('tarla_id', e.target.value)} style={inputStil}>
              <option value="">Seç...</option>
              {tarlalar.map(t => <option key={t.id} value={t.id}>{t.ad}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kime Teslim Edildi?</label>
            <select value={form.kisi_id} onChange={e => f('kisi_id', e.target.value)} style={inputStil}>
              <option value="">Seç (opsiyonel)</option>
              {kisiler.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarih</label>
            <input type="date" value={form.tarih} onChange={e => f('tarih', e.target.value)} style={inputStil} />
          </div>
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

export default function HasatSayfasi({ sezon }) {
  const [formAcik, setFormAcik] = useState(false)
  const [duzenlenen, setDuzenlenen] = useState(null)
  const [silinecek, setSilinecek] = useState(null)
  const [tick, setTick] = useState(0)
  const tarlalar = tarlalariOku()
  const kisiler = kisileriOku()
  const hareketler = hareketleriOku(sezon?.id).filter(h => h.tur === 'hasat')

  const toplamKg = hareketler.reduce((t, h) => t + (h.miktar || 0), 0)
  const toplamGelir = hareketler.reduce((t, h) => t + (h.tutar || 0), 0)
  const ortKgFiyat = toplamKg > 0 ? toplamGelir / toplamKg : 0

  // Tarla bazlı özet
  const tarlaOzetleri = {}
  hareketler.forEach(h => {
    const key = h.tarla_id || '__genel'
    if (!tarlaOzetleri[key]) tarlaOzetleri[key] = { kg: 0, tutar: 0 }
    tarlaOzetleri[key].kg += h.miktar || 0
    tarlaOzetleri[key].tutar += h.tutar || 0
  })

  function yenile() { setTick(t => t + 1) }

  function duzenleAc(h) {
    setDuzenlenen(h)
    setFormAcik(true)
  }

  function formKapat() {
    setFormAcik(false)
    setDuzenlenen(null)
  }

  return (
    <div className="sayfa">
      {/* Özet kartları */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, background: 'var(--yesil-acik)', borderRadius: 12, padding: '14px' }}>
          <div style={{ fontSize: 11, color: 'var(--yesil)', fontWeight: 600 }}>Toplam KG</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--yesil)' }}>{sayiBiçim(toplamKg)}</div>
        </div>
        <div style={{ flex: 1, background: 'var(--yesil)', borderRadius: 12, padding: '14px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Toplam Gelir</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{paraBiçim(toplamGelir)}</div>
        </div>
      </div>

      {ortKgFiyat > 0 && (
        <div style={{
          background: 'var(--amber-acik)', borderRadius: 12, padding: '12px 16px',
          marginBottom: 16, fontWeight: 600, color: 'var(--amber)', fontSize: 14,
        }}>
          Ortalama KG Fiyatı: {ortKgFiyat.toFixed(2)} TL/kg
        </div>
      )}

      {/* Tarla bazlı özet */}
      {Object.keys(tarlaOzetleri).length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Tarla Bazlı Verim</div>
          {Object.entries(tarlaOzetleri).map(([tarlaId, oz]) => {
            const tarla = tarlalar.find(t => t.id === tarlaId)
            const dekarVerim = tarla?.dekar > 0 ? oz.kg / tarla.dekar : 0
            return (
              <div key={tarlaId} style={{
                display: 'flex', justifyContent: 'space-between',
                paddingBlock: 8, borderBottom: '1px solid var(--kenar)', fontSize: 13,
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{tarla?.ad || 'Genel'}</div>
                  {tarla?.dekar > 0 && <div style={{ color: 'var(--yazi-hafif)', fontSize: 11 }}>
                    {sayiBiçim(Math.round(dekarVerim))} kg/dk
                  </div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{sayiBiçim(oz.kg)} kg</div>
                  <div style={{ color: 'var(--yesil)', fontWeight: 600 }}>{paraBiçim(oz.tutar)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Teslimatlar</div>
        <button onClick={() => { setDuzenlenen(null); setFormAcik(true) }} style={{
          background: 'var(--yesil)', color: '#fff', border: 'none',
          borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>+ Ekle</button>
      </div>

      {hareketler.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--yazi-hafif)' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🚜</div>
          Henüz teslimat kaydı yok
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {[...hareketler].sort((a, b) => new Date(b.tarih) - new Date(a.tarih)).map(h => {
            const tarla = tarlalar.find(t => t.id === h.tarla_id)
            return (
              <div key={h.id} style={{
                paddingBlock: 10, borderBottom: '1px solid var(--kenar)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {h.kalem} {h.fis_no ? `#${h.fis_no}` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 2 }}>
                    {sayiBiçim(h.miktar)} kg · {h.birim_fiyat ? `${h.birim_fiyat} TL/kg · ` : ''}
                    {tarla?.ad ? `${tarla.ad} · ` : ''}{tarihBiçim(h.tarih)}
                  </div>
                  {h.aciklama && <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>{h.aciklama}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, color: 'var(--yesil)', fontSize: 14 }}>+{paraBiçim(h.tutar)}</div>
                  <button
                    onClick={() => duzenleAc(h)}
                    title="Düzenle"
                    style={{
                      background: 'none', border: '1px solid var(--kenar)',
                      color: 'var(--yazi-hafif)', cursor: 'pointer',
                      fontSize: 12, padding: '2px 6px', borderRadius: 6,
                    }}
                  >✏️</button>
                  <button
                    onClick={() => setSilinecek(h)}
                    title="Sil"
                    style={{
                      background: 'none', border: 'none', color: 'var(--yazi-hafif)', cursor: 'pointer', fontSize: 16,
                    }}
                  >×</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {formAcik && (
        <TeslimatForm
          sezon={sezon}
          tarlalar={tarlalar}
          kisiler={kisiler}
          duzenlenen={duzenlenen}
          onKapat={formKapat}
          onKaydet={() => { formKapat(); yenile() }}
        />
      )}

      {silinecek && (
        <Onayla
          mesaj="Bu kayıt silinsin mi?"
          onOnayla={() => { hareketSil(silinecek.id); setSilinecek(null); yenile() }}
          onIptal={() => setSilinecek(null)}
        />
      )}
    </div>
  )
}
