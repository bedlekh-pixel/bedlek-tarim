import { useState } from 'react'
import {
  isciGruplariniOku, isciGrubuEkle, isciGrubuDuzenle, isciGrubuSil,
  iscilikKayitlariniOku, iscilikKaydiEkle, iscilikKaydiDuzenle, iscilikKaydiSil,
  tarlalariOku,
} from '../../store/db'
import { paraBiçim, tarihBiçim, bugun } from '../../utils/format'
import Modal from '../../utils/Modal'
import Onayla from '../../utils/Onayla'

// ─── Grup Formu ──────────────────────────────────────────────
function GrupForm({ onKapat, onKaydet, duzenlenen }) {
  const [form, setForm] = useState(duzenlenen || {
    ad: '', tur: 'grup', kisi_sayisi: '', gunluk_ucret: '', not: '',
  })
  function f(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function kaydet() {
    if (!form.ad.trim()) return
    const veri = {
      ...form,
      kisi_sayisi: parseInt(form.kisi_sayisi) || 1,
      gunluk_ucret: parseFloat(form.gunluk_ucret) || 0,
    }
    if (duzenlenen) isciGrubuDuzenle(duzenlenen.id, veri)
    else isciGrubuEkle(veri)
    onKaydet()
  }

  const inp = {
    width: '100%', padding: '12px 14px', border: '1.5px solid var(--kenar)',
    borderRadius: 10, fontSize: 15, background: '#fff',
  }

  return (
    <Modal onKapat={onKapat} genislik={440}>
      <div style={{ padding: '20px 20px 24px' }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          {duzenlenen ? '✏️ Grubu Düzenle' : '👷 Yeni İşçi / Grup'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ad / Grup Adı</label>
            <input autoFocus value={form.ad} onChange={e => f('ad', e.target.value)}
              placeholder="Çapacılar, Hasat Ekibi, Ahmet Yılmaz..." style={inp} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Tür</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'bireysel', label: '👤 Bireysel', desc: 'Tek kişi' },
                { id: 'grup', label: '👥 Grup', desc: 'Birden fazla' },
              ].map(t => (
                <button key={t.id} onClick={() => f('tur', t.id)} style={{
                  flex: 1, padding: '11px 8px', borderRadius: 10, border: '1.5px solid',
                  cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  background: form.tur === t.id ? '#374151' : '#fff',
                  borderColor: form.tur === t.id ? '#374151' : 'var(--kenar)',
                  color: form.tur === t.id ? '#fff' : 'var(--yazi)',
                }}>
                  {t.label}
                  <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.7 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                {form.tur === 'grup' ? 'Tipik Kişi Sayısı' : 'Kişi Sayısı'}
              </label>
              <input type="number" inputMode="numeric" value={form.kisi_sayisi}
                onChange={e => f('kisi_sayisi', e.target.value)} placeholder="1" style={inp} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Günlük Ücret / Kişi (TL)
              </label>
              <input type="number" inputMode="decimal" value={form.gunluk_ucret}
                onChange={e => f('gunluk_ucret', e.target.value)} placeholder="0" style={inp} />
            </div>
          </div>

          {form.kisi_sayisi && form.gunluk_ucret && (
            <div style={{
              background: '#f0fdf4', border: '1.5px solid var(--yesil)',
              borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--yesil)', fontWeight: 600,
            }}>
              Günlük toplam: {paraBiçim(parseFloat(form.kisi_sayisi) * parseFloat(form.gunluk_ucret))} ({form.kisi_sayisi} kişi × {paraBiçim(parseFloat(form.gunluk_ucret))})
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Not (opsiyonel)</label>
            <input value={form.not} onChange={e => f('not', e.target.value)}
              placeholder="Kısa not..." style={inp} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onKapat} style={{
              flex: 1, padding: '12px', background: '#f3f4f6', border: 'none',
              borderRadius: 10, cursor: 'pointer', fontWeight: 600,
            }}>İptal</button>
            <button onClick={kaydet} style={{
              flex: 2, padding: '12px', background: '#374151', color: '#fff',
              border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
            }}>✓ Kaydet</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Çalışma Kaydı Formu ─────────────────────────────────────
function KayitForm({ sezon, onKapat, onKaydet, duzenlenen }) {
  const gruplar = isciGruplariniOku()
  const tarlalar = tarlalariOku()

  const [form, setForm] = useState(() => {
    if (duzenlenen) return {
      grup_id: duzenlenen.grup_id || '',
      tarla_id: duzenlenen.tarla_id || '',
      baslangic: duzenlenen.baslangic || bugun(),
      bitis: duzenlenen.bitis || bugun(),
      gun_sayisi: duzenlenen.gun_sayisi != null ? String(duzenlenen.gun_sayisi) : '',
      kisi_sayisi: duzenlenen.kisi_sayisi != null ? String(duzenlenen.kisi_sayisi) : '',
      gunluk_ucret: duzenlenen.gunluk_ucret != null ? String(duzenlenen.gunluk_ucret) : '',
      toplam: duzenlenen.toplam != null ? String(duzenlenen.toplam) : '',
      is_tanimi: duzenlenen.is_tanimi || '',
      aciklama: duzenlenen.aciklama || '',
    }
    return {
      grup_id: '', tarla_id: '', baslangic: bugun(), bitis: bugun(),
      gun_sayisi: '', kisi_sayisi: '', gunluk_ucret: '', toplam: '', is_tanimi: '', aciklama: '',
    }
  })

  function f(k, v) {
    setForm(prev => {
      const yeni = { ...prev, [k]: v }

      // Grup seçilince kişi sayısı ve ücret otomatik doldur
      if (k === 'grup_id') {
        const grup = gruplar.find(g => g.id === v)
        if (grup) {
          yeni.kisi_sayisi = String(grup.kisi_sayisi || 1)
          yeni.gunluk_ucret = String(grup.gunluk_ucret || 0)
        }
      }

      // Tarih aralığından gün sayısı hesapla
      if (k === 'baslangic' || k === 'bitis') {
        const bas = k === 'baslangic' ? v : prev.baslangic
        const bit = k === 'bitis' ? v : prev.bitis
        if (bas && bit) {
          const gunler = Math.round((new Date(bit) - new Date(bas)) / 86400000) + 1
          if (gunler > 0) yeni.gun_sayisi = String(gunler)
        }
      }

      // Toplam hesapla
      const gun = k === 'gun_sayisi' ? v : yeni.gun_sayisi
      const kisi = k === 'kisi_sayisi' ? v : yeni.kisi_sayisi
      const ucret = k === 'gunluk_ucret' ? v : yeni.gunluk_ucret
      if (gun && kisi && ucret) {
        yeni.toplam = String(parseFloat(gun) * parseFloat(kisi) * parseFloat(ucret))
      }

      return yeni
    })
  }

  function kaydet() {
    if (!form.grup_id || !form.gun_sayisi || !form.kisi_sayisi) return
    const veri = {
      sezon: sezon?.id,
      grup_id: form.grup_id,
      tarla_id: form.tarla_id || null,
      baslangic: form.baslangic,
      bitis: form.bitis,
      gun_sayisi: parseFloat(form.gun_sayisi) || 0,
      kisi_sayisi: parseInt(form.kisi_sayisi) || 1,
      gunluk_ucret: parseFloat(form.gunluk_ucret) || 0,
      toplam: parseFloat(form.toplam) || 0,
      is_tanimi: form.is_tanimi,
      aciklama: form.aciklama,
      odendi: false,
      odeme_tarihi: null,
    }
    if (duzenlenen) {
      iscilikKaydiDuzenle(duzenlenen.id, veri)
    } else {
      iscilikKaydiEkle(veri)
    }
    onKaydet()
  }

  const inp = {
    width: '100%', padding: '11px 13px', border: '1.5px solid var(--kenar)',
    borderRadius: 10, fontSize: 15, background: '#fff',
  }

  const seciliGrup = gruplar.find(g => g.id === form.grup_id)

  return (
    <Modal onKapat={onKapat} genislik={520}>
      <div>
        <div style={{
          position: 'sticky', top: 0, background: 'var(--zemin)',
          padding: '16px 16px 12px', borderBottom: '1px solid var(--kenar)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {duzenlenen ? '✏️ Kayıt Düzenle' : '📋 Çalışma Kaydı Ekle'}
          </div>
          <button onClick={onKapat} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--yazi-hafif)' }}>×</button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Grup seçimi */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>İşçi / Grup</label>
            <select value={form.grup_id} onChange={e => f('grup_id', e.target.value)} style={inp}>
              <option value="">Grup seç...</option>
              {gruplar.map(g => (
                <option key={g.id} value={g.id}>
                  {g.tur === 'grup' ? '👥' : '👤'} {g.ad} ({g.kisi_sayisi} kişi · {paraBiçim(g.gunluk_ucret)}/gün)
                </option>
              ))}
            </select>
          </div>

          {/* Tarla */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Hangi Tarlada?</label>
            <select value={form.tarla_id} onChange={e => f('tarla_id', e.target.value)} style={inp}>
              <option value="">Seç (opsiyonel)</option>
              {tarlalar.map(t => <option key={t.id} value={t.id}>{t.ad} ({t.dekar} dk)</option>)}
            </select>
          </div>

          {/* İş tanımı */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Yapılan İş</label>
            <input value={form.is_tanimi} onChange={e => f('is_tanimi', e.target.value)}
              placeholder="Çapa, hasat, dikim, taşıma..." style={inp} />
          </div>

          {/* Tarih aralığı */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Çalışma Dönemi</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="date" value={form.baslangic} onChange={e => f('baslangic', e.target.value)} style={{ ...inp, flex: 1 }} />
              <span style={{ color: 'var(--yazi-hafif)', fontSize: 13, flexShrink: 0 }}>→</span>
              <input type="date" value={form.bitis} onChange={e => f('bitis', e.target.value)} style={{ ...inp, flex: 1 }} />
            </div>
          </div>

          {/* Gün, Kişi, Ücret */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Gün Sayısı</label>
              <input type="number" inputMode="numeric" value={form.gun_sayisi}
                onChange={e => f('gun_sayisi', e.target.value)} placeholder="0" style={inp} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Kişi Sayısı</label>
              <input type="number" inputMode="numeric" value={form.kisi_sayisi}
                onChange={e => f('kisi_sayisi', e.target.value)} placeholder="1" style={inp} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>TL/Gün/Kişi</label>
              <input type="number" inputMode="decimal" value={form.gunluk_ucret}
                onChange={e => f('gunluk_ucret', e.target.value)} placeholder="0" style={inp} />
            </div>
          </div>

          {/* Hesaplanan toplam */}
          {form.toplam ? (
            <div style={{
              background: '#FFF7ED', border: '1.5px solid #C2410C',
              borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 12, color: '#9A3412', fontWeight: 600, marginBottom: 4 }}>
                Hesaplanan Toplam Ücret
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#C2410C' }}>
                {paraBiçim(parseFloat(form.toplam))}
              </div>
              <div style={{ fontSize: 11, color: '#9A3412', marginTop: 4 }}>
                {form.gun_sayisi} gün × {form.kisi_sayisi} kişi × {paraBiçim(parseFloat(form.gunluk_ucret))}
              </div>
            </div>
          ) : null}

          {/* Açıklama */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Açıklama (opsiyonel)</label>
            <input value={form.aciklama} onChange={e => f('aciklama', e.target.value)}
              placeholder="Ek notlar..." style={inp} />
          </div>

          <button onClick={kaydet} style={{
            background: '#C2410C', color: '#fff', border: 'none',
            borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>
            ✓ {duzenlenen ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Ödeme Modal ─────────────────────────────────────────────
function OdemeModal({ kayit, onOdendi, onKapat }) {
  const [tarih, setTarih] = useState(bugun())
  const [tutar, setTutar] = useState(String(kayit.toplam || 0))

  return (
    <Modal onKapat={onKapat} genislik={380}>
      <div style={{ padding: '20px 20px 24px' }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>💸 Ödeme Yap</div>
        <div style={{ fontSize: 13, color: 'var(--yazi-hafif)', marginBottom: 16 }}>
          Bu çalışma kaydı ödenmiş olarak işaretlenecek
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ödeme Tutarı (TL)</label>
            <input type="number" inputMode="numeric" value={tutar}
              onChange={e => setTutar(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--kenar)', borderRadius: 10, fontSize: 18, fontWeight: 700, background: '#fff' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ödeme Tarihi</label>
            <input type="date" value={tarih} onChange={e => setTarih(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--kenar)', borderRadius: 10, fontSize: 15, background: '#fff' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={onKapat} style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>İptal</button>
            <button onClick={() => onOdendi(parseFloat(tutar) || kayit.toplam, tarih)} style={{
              flex: 2, padding: '12px', background: 'var(--yesil)', color: '#fff',
              border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
            }}>✓ Ödendi Olarak İşaretle</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Ana İşçilik Bileşeni ─────────────────────────────────────
export default function IscilikSayfasi({ sezon }) {
  const [sekme, setSekme] = useState('kayitlar')
  const [kayitFormAcik, setKayitFormAcik] = useState(false)
  const [grupFormAcik, setGrupFormAcik] = useState(false)
  const [duzKayit, setDuzKayit] = useState(null)
  const [duzGrup, setDuzGrup] = useState(null)
  const [silinecekKayit, setSilinecekKayit] = useState(null)
  const [silinecekGrup, setSilinecekGrup] = useState(null)
  const [odemeKayit, setOdemeKayit] = useState(null)
  const [tick, setTick] = useState(0)

  const gruplar = isciGruplariniOku()
  const kayitlar = iscilikKayitlariniOku(sezon?.id)
  const tarlalar = tarlalariOku()

  function yenile() { setTick(t => t + 1) }

  const toplamAlacak = kayitlar.reduce((t, k) => t + (k.toplam || 0), 0)
  const toplamOdenen = kayitlar.filter(k => k.odendi).reduce((t, k) => t + (k.odeme_tutari || k.toplam || 0), 0)
  const toplamKalan = toplamAlacak - toplamOdenen

  function odemeYap(kayit, tutar, tarih) {
    iscilikKaydiDuzenle(kayit.id, {
      odendi: true,
      odeme_tutari: tutar,
      odeme_tarihi: tarih,
    })
    setOdemeKayit(null)
    yenile()
  }

  function odemeyiGeriAl(kayit) {
    iscilikKaydiDuzenle(kayit.id, {
      odendi: false,
      odeme_tutari: null,
      odeme_tarihi: null,
    })
    yenile()
  }

  return (
    <div>
      {/* Özet kartları */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, background: '#FFF7ED', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: '#9A3412', fontWeight: 700 }}>Toplam Alacak</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#C2410C' }}>{paraBiçim(toplamAlacak)}</div>
        </div>
        <div style={{ flex: 1, background: 'var(--yesil-acik)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: 'var(--yesil)', fontWeight: 700 }}>Ödenen</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--yesil)' }}>{paraBiçim(toplamOdenen)}</div>
        </div>
        <div style={{
          flex: 1, borderRadius: 12, padding: '12px 14px',
          background: toplamKalan > 0 ? 'var(--kirmizi-acik)' : 'var(--yesil-acik)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: toplamKalan > 0 ? 'var(--kirmizi)' : 'var(--yesil)' }}>Kalan Borç</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: toplamKalan > 0 ? 'var(--kirmizi)' : 'var(--yesil)' }}>{paraBiçim(toplamKalan)}</div>
        </div>
      </div>

      {/* Sekme */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { id: 'kayitlar', label: '📋 Çalışma Kayıtları' },
          { id: 'gruplar', label: '👥 İşçiler / Gruplar' },
        ].map(s => (
          <button key={s.id} onClick={() => setSekme(s.id)} style={{
            flex: 1, padding: '9px', borderRadius: 10, border: '1.5px solid', cursor: 'pointer',
            fontWeight: 700, fontSize: 12,
            background: sekme === s.id ? '#C2410C' : '#fff',
            borderColor: sekme === s.id ? '#C2410C' : 'var(--kenar)',
            color: sekme === s.id ? '#fff' : 'var(--yazi)',
          }}>{s.label}</button>
        ))}
      </div>

      {/* Çalışma Kayıtları */}
      {sekme === 'kayitlar' && (
        <>
          <button onClick={() => { setDuzKayit(null); setKayitFormAcik(true) }} style={{
            width: '100%', padding: '12px', marginBottom: 16,
            background: '#C2410C', color: '#fff', border: 'none',
            borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14,
          }}>+ Çalışma Kaydı Ekle</button>

          {kayitlar.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--yazi-hafif)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
              <div>Henüz çalışma kaydı yok</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Önce işçi/grup tanımla, sonra kayıt ekle</div>
            </div>
          ) : (
            // Grup bazlı gruplama
            (() => {
              const grpMap = {}
              kayitlar.forEach(k => {
                const key = k.grup_id || '__genel'
                if (!grpMap[key]) grpMap[key] = []
                grpMap[key].push(k)
              })
              return Object.entries(grpMap).map(([gId, liste]) => {
                const grup = gruplar.find(g => g.id === gId)
                const grpToplam = liste.reduce((t, k) => t + (k.toplam || 0), 0)
                const grpOdenen = liste.filter(k => k.odendi).reduce((t, k) => t + (k.odeme_tutari || k.toplam || 0), 0)
                const grpKalan = grpToplam - grpOdenen
                return (
                  <div key={gId} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                    {/* Grup başlık */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>
                          {grup?.tur === 'bireysel' ? '👤' : '👥'} {grup?.ad || 'Diğer'}
                        </div>
                        {grup && (
                          <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 2 }}>
                            {grup.kisi_sayisi} kişi · {paraBiçim(grup.gunluk_ucret)}/gün/kişi
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--yazi-hafif)' }}>Toplam / Kalan</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: grpKalan > 0 ? 'var(--kirmizi)' : 'var(--yesil)' }}>
                          {paraBiçim(grpToplam)} / {paraBiçim(grpKalan)}
                        </div>
                      </div>
                    </div>

                    {/* Kayıtlar */}
                    {[...liste].sort((a, b) => new Date(b.baslangic) - new Date(a.baslangic)).map(k => {
                      const tarla = tarlalar.find(t => t.id === k.tarla_id)
                      return (
                        <div key={k.id} style={{
                          paddingBlock: 10, borderTop: '1px solid var(--kenar)',
                          opacity: k.odendi ? 0.65 : 1,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>
                                  {k.is_tanimi || 'Çalışma'}
                                </span>
                                {k.odendi ? (
                                  <span style={{
                                    background: '#dcfce7', color: '#15803d',
                                    fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 4,
                                  }}>✓ Ödendi</span>
                                ) : (
                                  <span style={{
                                    background: '#fef2f2', color: '#dc2626',
                                    fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 4,
                                  }}>⏳ Bekliyor</span>
                                )}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 3 }}>
                                {tarihBiçim(k.baslangic)}
                                {k.bitis !== k.baslangic ? ` – ${tarihBiçim(k.bitis)}` : ''}
                                {' · '}{k.gun_sayisi} gün · {k.kisi_sayisi} kişi
                                {tarla ? ` · ${tarla.ad}` : ''}
                              </div>
                              {k.odendi && k.odeme_tarihi && (
                                <div style={{ fontSize: 11, color: 'var(--yesil)', marginTop: 2 }}>
                                  Ödeme: {tarihBiçim(k.odeme_tarihi)}
                                  {k.odeme_tutari && k.odeme_tutari !== k.toplam ? ` · ${paraBiçim(k.odeme_tutari)}` : ''}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: '#C2410C' }}>
                                {paraBiçim(k.toplam)}
                              </div>
                              {!k.odendi && (
                                <button onClick={() => setOdemeKayit(k)} style={{
                                  background: 'var(--yesil)', color: '#fff', border: 'none',
                                  borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                                }}>Öde</button>
                              )}
                              {k.odendi && (
                                <button onClick={() => odemeyiGeriAl(k)} style={{
                                  background: 'none', border: '1px solid var(--kenar)', color: 'var(--yazi-hafif)',
                                  borderRadius: 7, padding: '4px 8px', cursor: 'pointer', fontSize: 10,
                                }}>Geri Al</button>
                              )}
                              <button onClick={() => { setDuzKayit(k); setKayitFormAcik(true) }} style={{
                                background: 'none', border: '1px solid var(--kenar)', color: 'var(--yazi-hafif)',
                                cursor: 'pointer', fontSize: 12, padding: '4px 7px', borderRadius: 6,
                              }}>✏️</button>
                              <button onClick={() => setSilinecekKayit(k)} style={{
                                background: 'none', border: 'none', color: 'var(--yazi-hafif)',
                                cursor: 'pointer', fontSize: 16, padding: '2px',
                              }}>×</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })
            })()
          )}
        </>
      )}

      {/* Gruplar */}
      {sekme === 'gruplar' && (
        <>
          <button onClick={() => { setDuzGrup(null); setGrupFormAcik(true) }} style={{
            width: '100%', padding: '12px', marginBottom: 16,
            background: '#374151', color: '#fff', border: 'none',
            borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14,
          }}>+ İşçi / Grup Tanımla</button>

          {gruplar.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--yazi-hafif)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
              Henüz işçi/grup tanımlı değil
            </div>
          ) : (
            <div className="grid-2">
              {gruplar.map(g => {
                const gKayitlar = kayitlar.filter(k => k.grup_id === g.id)
                const gToplam = gKayitlar.reduce((t, k) => t + (k.toplam || 0), 0)
                const gOdenen = gKayitlar.filter(k => k.odendi).reduce((t, k) => t + (k.odeme_tutari || k.toplam || 0), 0)
                const gunlukToplam = (g.kisi_sayisi || 1) * (g.gunluk_ucret || 0)
                return (
                  <div key={g.id} style={{
                    background: '#fff', borderRadius: 12, padding: 16,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>
                          {g.tur === 'bireysel' ? '👤' : '👥'} {g.ad}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', marginTop: 3 }}>
                          {g.kisi_sayisi} kişi · {paraBiçim(g.gunluk_ucret)}/gün
                        </div>
                        <div style={{ fontSize: 12, color: '#C2410C', fontWeight: 600, marginTop: 2 }}>
                          Günlük: {paraBiçim(gunlukToplam)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setDuzGrup(g); setGrupFormAcik(true) }} style={{
                          background: 'none', border: '1px solid var(--kenar)', color: 'var(--yazi-hafif)',
                          cursor: 'pointer', fontSize: 12, padding: '4px 7px', borderRadius: 6,
                        }}>✏️</button>
                        <button onClick={() => setSilinecekGrup(g)} style={{
                          background: 'none', border: 'none', color: 'var(--yazi-hafif)',
                          cursor: 'pointer', fontSize: 16, padding: '2px',
                        }}>×</button>
                      </div>
                    </div>

                    {gKayitlar.length > 0 && (
                      <div style={{ paddingTop: 10, borderTop: '1px solid var(--kenar)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: 'var(--yazi-hafif)' }}>{gKayitlar.length} kayıt</span>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ color: 'var(--kirmizi)', fontWeight: 700 }}>{paraBiçim(gToplam - gOdenen)} kalan</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {g.not && (
                      <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 8, fontStyle: 'italic' }}>
                        {g.not}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Formlar */}
      {kayitFormAcik && (
        <KayitForm sezon={sezon} duzenlenen={duzKayit}
          onKapat={() => { setKayitFormAcik(false); setDuzKayit(null) }}
          onKaydet={() => { setKayitFormAcik(false); setDuzKayit(null); yenile() }} />
      )}
      {grupFormAcik && (
        <GrupForm duzenlenen={duzGrup}
          onKapat={() => { setGrupFormAcik(false); setDuzGrup(null) }}
          onKaydet={() => { setGrupFormAcik(false); setDuzGrup(null); yenile() }} />
      )}
      {odemeKayit && (
        <OdemeModal kayit={odemeKayit}
          onOdendi={(tutar, tarih) => odemeYap(odemeKayit, tutar, tarih)}
          onKapat={() => setOdemeKayit(null)} />
      )}
      {silinecekKayit && (
        <Onayla mesaj="Bu çalışma kaydı silinsin mi?"
          onEvet={() => { iscilikKaydiSil(silinecekKayit.id); setSilinecekKayit(null); yenile() }}
          onHayir={() => setSilinecekKayit(null)} />
      )}
      {silinecekGrup && (
        <Onayla mesaj={`"${silinecekGrup.ad}" silinsin mi? Bu gruba ait kayıtlar etkilenmez.`}
          onEvet={() => { isciGrubuSil(silinecekGrup.id); setSilinecekGrup(null); yenile() }}
          onHayir={() => setSilinecekGrup(null)} />
      )}
    </div>
  )
}
