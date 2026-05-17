import { useState, useRef, useEffect } from 'react'
import {
  firmalariOku, firmaEkle, firmaDuzenle, firmaSil,
  hareketleriOku, hareketEkle, hareketDuzenle, hareketSil,
  tarlalariOku, kalemleriOku, kisileriOku, firmaOzeti
} from '../../store/db'
import Modal from '../../utils/Modal'
import Onayla from '../../utils/Onayla'
import { paraBiçim, tarihBiçim, bugun } from '../../utils/format'

// ─── Firma Bakiye Kartı ───────────────────────────────────────
function BakiyeKarti({ firma, sezon }) {
  const oz = firmaOzeti(firma.id, sezon?.id)
  const pozitif = oz.kalan >= 0

  return (
    <div style={{
      background: pozitif ? 'var(--yesil)' : 'var(--kirmizi)',
      borderRadius: 12, padding: '14px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 8,
    }}>
      <div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Kalan Avans</div>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{paraBiçim(oz.kalan)}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Gelen: {paraBiçim(oz.gelenNakit)}</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Harcanan: {paraBiçim(oz.harcanan)}</div>
      </div>
    </div>
  )
}

// ─── Adım Adım Form (Yeni Ekleme + Düzenleme) ────────────────
function Etiket({ bg, renk, children }) {
  return (
    <span style={{ background: bg, color: renk, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>
      {children}
    </span>
  )
}

function HammaddeForm({ form, f, kalemler, inputStil, kaydet, duzMod, renk, aciklamaPlaceholder, gosterFiyat }) {
  const birimler = ['kg', 'lt', 'adet', 'çuval', 'ton']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kalem</label>
        <select value={form.kalem} onChange={e => f('kalem', e.target.value)} style={inputStil}>
          <option value="">Seç...</option>
          {kalemler.map(k => <option key={k.id} value={k.ad}>{k.ikon} {k.ad}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 2 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Miktar</label>
          <input type="number" inputMode="numeric" value={form.miktar}
            onChange={e => f('miktar', e.target.value)} placeholder="0" style={inputStil} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Birim</label>
          <select value={form.birim} onChange={e => f('birim', e.target.value)} style={inputStil}>
            {birimler.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>
      {gosterFiyat && (
        <>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Birim Fiyat (TL)</label>
            <input type="number" inputMode="decimal" value={form.birim_fiyat}
              onChange={e => f('birim_fiyat', e.target.value)} placeholder="0" style={inputStil} />
          </div>
          {form.tutar ? (
            <div style={{
              background: '#f0fdf4', border: '1.5px solid var(--yesil)',
              borderRadius: 10, padding: '10px 14px', fontWeight: 700, color: 'var(--yesil)',
            }}>
              Toplam: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(parseFloat(form.tutar))}
            </div>
          ) : null}
        </>
      )}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarih</label>
        <input type="date" value={form.tarih} onChange={e => f('tarih', e.target.value)} style={inputStil} />
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Açıklama (opsiyonel)</label>
        <input type="text" value={form.aciklama} onChange={e => f('aciklama', e.target.value)}
          placeholder={aciklamaPlaceholder} style={inputStil} />
      </div>
      <button onClick={kaydet} style={{
        background: renk, color: '#fff', border: 'none',
        borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
      }}>
        ✓ {duzMod ? 'Güncelle' : 'Kaydet'}
      </button>
    </div>
  )
}

function TipButonu({ ikon, renk, bg, baslik, aciklama, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '12px 14px', background: bg, border: `1.5px solid ${renk}`,
      borderRadius: 10, cursor: 'pointer', textAlign: 'left', width: '100%',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{ikon}</span>
      <div>
        <div style={{ fontWeight: 700, color: renk, fontSize: 14 }}>{baslik}</div>
        <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 2 }}>{aciklama}</div>
      </div>
    </button>
  )
}

function HareketForm({ firma, sezon, tarlalar, kalemler, onKapat, onKaydet, duzenlenen }) {
  const duzMod = !!duzenlenen
  const tedarikciler = kisileriOku().filter(k => k.tur === 'tedarikci')

  function tipBelirle(h) {
    if (!h) return null
    if (h.tur === 'nakit_avans') return 'gelir_nakit'
    if (h.tur === 'hammadde' && h.kaynak === 'firma') return 'hammadde_firma'
    if (h.tur === 'hammadde' && h.kaynak === 'cep') return 'hammadde_sahsi'
    if (h.tur === 'hammadde' && h.kaynak === 'tedarikci') return 'hammadde_tedarikci'
    if (h.tur === 'harcama') return 'harcama'
    // geriye dönük uyumluluk
    if (h.tur === 'hammadde') return 'hammadde_firma'
    return null
  }

  const [tip, setTip] = useState(duzenlenen ? tipBelirle(duzenlenen) : null)
  const [form, setForm] = useState(duzenlenen ? {
    tarih: duzenlenen.tarih || bugun(),
    kaynak: duzenlenen.kaynak || 'avans',
    tarla_id: duzenlenen.tarla_id || '',
    kalem: duzenlenen.kalem || '',
    miktar: duzenlenen.miktar != null ? String(duzenlenen.miktar) : '',
    birim: duzenlenen.birim || 'kg',
    birim_fiyat: duzenlenen.birim_fiyat != null ? String(duzenlenen.birim_fiyat) : '',
    tutar: duzenlenen.tutar != null ? String(duzenlenen.tutar) : '',
    aciklama: duzenlenen.aciklama || '',
    tedarikci_id: duzenlenen.kisi_id || '',
  } : {
    tarih: bugun(), kaynak: 'avans', tarla_id: '',
    kalem: '', miktar: '', birim: 'kg', birim_fiyat: '', tutar: '',
    aciklama: '', tedarikci_id: '',
  })

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
    const hareket = {
      tarih: form.tarih,
      sezon: sezon?.id,
      firma_id: firma.id,
      modul: 'sozlesmeli',
      aciklama: form.aciklama,
      tarla_id: form.tarla_id || null,
    }

    if (tip === 'gelir_nakit') {
      Object.assign(hareket, {
        tur: 'nakit_avans', yon: 'gelir',
        kalem: 'Nakit Avans', tutar: parseFloat(form.tutar) || 0,
      })
    } else if (tip === 'hammadde_firma') {
      Object.assign(hareket, {
        tur: 'hammadde', yon: 'gelir', kaynak: 'firma',
        kalem: form.kalem, miktar: parseFloat(form.miktar) || 0,
        birim: form.birim, tutar: 0,
      })
    } else if (tip === 'hammadde_sahsi') {
      Object.assign(hareket, {
        tur: 'hammadde', yon: 'gider', kaynak: 'cep',
        kalem: form.kalem, miktar: parseFloat(form.miktar) || 0,
        birim: form.birim, birim_fiyat: parseFloat(form.birim_fiyat) || 0,
        tutar: parseFloat(form.tutar) || 0,
      })
    } else if (tip === 'hammadde_tedarikci') {
      Object.assign(hareket, {
        tur: 'hammadde', yon: 'gider', kaynak: 'tedarikci',
        kalem: form.kalem, miktar: parseFloat(form.miktar) || 0,
        birim: form.birim, birim_fiyat: parseFloat(form.birim_fiyat) || 0,
        tutar: parseFloat(form.tutar) || 0,
        kisi_id: form.tedarikci_id || null,
      })
    } else if (tip === 'harcama') {
      Object.assign(hareket, {
        tur: 'harcama', yon: 'gider',
        kalem: form.kalem, miktar: parseFloat(form.miktar) || 0,
        birim: form.birim, birim_fiyat: parseFloat(form.birim_fiyat) || 0,
        tutar: parseFloat(form.tutar) || 0,
        kaynak: form.kaynak,
      })
    }

    if (duzMod) {
      hareketDuzenle(duzenlenen.id, hareket)
    } else {
      hareketEkle(hareket)
    }
    onKaydet()
  }

  const inputStil = {
    width: '100%', padding: '12px 14px', border: '1.5px solid var(--kenar)',
    borderRadius: 10, fontSize: 16, background: '#fff', outline: 'none',
  }
  const btnStil = (aktif) => ({
    flex: 1, padding: '14px 8px', borderRadius: 10, border: '1.5px solid',
    cursor: 'pointer', fontSize: 14, fontWeight: 600, textAlign: 'center',
    background: aktif ? 'var(--yesil)' : '#fff',
    borderColor: aktif ? 'var(--yesil)' : 'var(--kenar)',
    color: aktif ? '#fff' : 'var(--yazi)',
  })

  return (
    <Modal onKapat={onKapat} genislik={540}>
      <div>
        {/* Başlık */}
        <div style={{
          position: 'sticky', top: 0, background: 'var(--zemin)',
          padding: '16px 16px 12px', borderBottom: '1px solid var(--kenar)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {duzMod ? '✏️ Hareketi Düzenle' :
              tip === null ? 'Ne eklemek istiyorsun?' :
              tip === 'gelir_nakit' ? '💵 Nakit Avans' :
              tip === 'hammadde_firma' ? '📦 Firmadan Hammadde' :
              tip === 'hammadde_sahsi' ? '💰 Şahsi Hammadde' :
              tip === 'hammadde_tedarikci' ? '🏪 Tedarikçiden Hammadde' :
              '🛒 Harcama'}
          </div>
          <button onClick={onKapat} style={{
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
            color: 'var(--yazi-hafif)', lineHeight: 1,
          }}>×</button>
        </div>

        <div style={{ padding: '16px' }}>
          {/* ADIM 0: Tip seçimi (sadece yeni ekleme modunda) */}
          {tip === null && !duzMod && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Ne eklemek istiyorsun?
              </div>

              {/* Nakit */}
              <TipButonu
                ikon="💵" renk="var(--yesil)" bg="var(--yesil-acik)"
                baslik="Firmadan Nakit Avans"
                aciklama="Para geldi, avans bakiyesine eklenir"
                onClick={() => setTip('gelir_nakit')}
              />

              <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', fontWeight: 700, marginTop: 4, marginBottom: 2 }}>
                📦 HAMMADDE KAYNAĞI
              </div>

              <TipButonu
                ikon="🏢" renk="var(--mavi)" bg="var(--mavi-acik)"
                baslik="Firmadan Hammadde"
                aciklama="Firma verdi — tohum, gübre vb. (fiyatsız, avans düşmez)"
                onClick={() => setTip('hammadde_firma')}
              />
              <TipButonu
                ikon="💰" renk="var(--mor)" bg="var(--mor-acik)"
                baslik="Şahsi Hammadde"
                aciklama="Kendi cebimden aldım — fiyat girilir"
                onClick={() => setTip('hammadde_sahsi')}
              />
              <TipButonu
                ikon="🏪" renk="var(--amber)" bg="var(--amber-acik)"
                baslik="Tedarikçiden Hammadde"
                aciklama="Tedarikçiden satın alındı — tedarikçi seçilir, fiyat girilir"
                onClick={() => setTip('hammadde_tedarikci')}
              />

              <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', fontWeight: 700, marginTop: 4, marginBottom: 2 }}>
                🛒 DİĞER
              </div>

              <TipButonu
                ikon="🛒" renk="var(--kirmizi)" bg="var(--kirmizi-acik)"
                baslik="Genel Harcama"
                aciklama="Avans veya kendi cebimden — mazot, işçilik, hizmet vb."
                onClick={() => setTip('harcama')}
              />
            </div>
          )}

          {/* Nakit Avans Formu */}
          {tip === 'gelir_nakit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tutar (TL)</label>
                <input type="number" inputMode="numeric" value={form.tutar}
                  onChange={e => f('tutar', e.target.value)} placeholder="0" style={inputStil} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarih</label>
                <input type="date" value={form.tarih} onChange={e => f('tarih', e.target.value)} style={inputStil} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Açıklama (opsiyonel)</label>
                <input type="text" value={form.aciklama} onChange={e => f('aciklama', e.target.value)}
                  placeholder="Tohum alımı için..." style={inputStil} />
              </div>
              <button onClick={kaydet} style={{
                background: 'var(--yesil)', color: '#fff', border: 'none',
                borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              }}>
                ✓ {duzMod ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          )}

          {/* Firmadan Hammadde (fiyatsız) */}
          {tip === 'hammadde_firma' && (
            <HammaddeForm
              form={form} f={f} kalemler={kalemler} inputStil={inputStil}
              kaydet={kaydet} duzMod={duzMod}
              renk="var(--mavi)"
              aciklamaPlaceholder="Firmadan teslim alındı..."
              gosterFiyat={false}
            />
          )}

          {/* Şahsi Hammadde (kendi cebinden, fiyatlı) */}
          {tip === 'hammadde_sahsi' && (
            <HammaddeForm
              form={form} f={f} kalemler={kalemler} inputStil={inputStil}
              kaydet={kaydet} duzMod={duzMod}
              renk="var(--mor)"
              aciklamaPlaceholder="Kendi cebimden aldım..."
              gosterFiyat={true}
            />
          )}

          {/* Tedarikçiden Hammadde (fiyatlı + tedarikçi seçimi) */}
          {tip === 'hammadde_tedarikci' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tedarikçi</label>
                <select value={form.tedarikci_id} onChange={e => f('tedarikci_id', e.target.value)} style={inputStil}>
                  <option value="">Seç...</option>
                  {tedarikciler.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}
                </select>
                {tedarikciler.length === 0 && (
                  <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4 }}>
                    Tedarikçi eklemek için Kişiler → Tedarikçi
                  </div>
                )}
              </div>
              <HammaddeForm
                form={form} f={f} kalemler={kalemler} inputStil={inputStil}
                kaydet={kaydet} duzMod={duzMod}
                renk="var(--amber)"
                aciklamaPlaceholder="Tedarikçiden alındı..."
                gosterFiyat={true}
                gizleKaydet={false}
              />
            </div>
          )}

          {/* Harcama Formu */}
          {tip === 'harcama' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Ne aldın?</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {kalemler.map(k => (
                    <button key={k.id} onClick={() => f('kalem', k.ad)} style={{
                      padding: '8px 12px', borderRadius: 8, border: '1.5px solid',
                      cursor: 'pointer', fontSize: 13, fontWeight: form.kalem === k.ad ? 700 : 400,
                      background: form.kalem === k.ad ? k.renk : '#fff',
                      borderColor: form.kalem === k.ad ? k.renk : 'var(--kenar)',
                      color: form.kalem === k.ad ? '#fff' : 'var(--yazi)',
                    }}>
                      {k.ikon} {k.ad}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Miktar</label>
                  <input type="number" inputMode="numeric" value={form.miktar}
                    onChange={e => f('miktar', e.target.value)} placeholder="0" style={inputStil} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Birim</label>
                  <select value={form.birim} onChange={e => f('birim', e.target.value)} style={inputStil}>
                    <option value="kg">kg</option>
                    <option value="lt">lt</option>
                    <option value="adet">adet</option>
                    <option value="çuval">çuval</option>
                    <option value="ton">ton</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Birim Fiyat (TL)</label>
                <input type="number" inputMode="decimal" value={form.birim_fiyat}
                  onChange={e => f('birim_fiyat', e.target.value)} placeholder="0" style={inputStil} />
              </div>

              {form.tutar ? (
                <div style={{
                  background: 'var(--amber-acik)', border: '1.5px solid var(--amber)',
                  borderRadius: 10, padding: '10px 14px',
                  fontWeight: 700, color: 'var(--amber)', fontSize: 15,
                }}>
                  Toplam: {paraBiçim(parseFloat(form.tutar))}
                </div>
              ) : null}

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Kim ödüyor?</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => f('kaynak', 'avans')} style={btnStil(form.kaynak === 'avans')}>
                    🏢 Firma Avansından
                  </button>
                  <button onClick={() => f('kaynak', 'cep')} style={{
                    ...btnStil(form.kaynak === 'cep'),
                    background: form.kaynak === 'cep' ? 'var(--mor)' : '#fff',
                    borderColor: form.kaynak === 'cep' ? 'var(--mor)' : 'var(--kenar)',
                    color: form.kaynak === 'cep' ? '#fff' : 'var(--yazi)',
                  }}>
                    💰 Kendi Cebimden
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Hangi Tarla?</label>
                <select value={form.tarla_id} onChange={e => f('tarla_id', e.target.value)} style={inputStil}>
                  <option value="">Seç (opsiyonel)</option>
                  {tarlalar.filter(t => t.firma_id === firma.id || t.modul === 'sahsi').map(t => (
                    <option key={t.id} value={t.id}>{t.ad} ({t.dekar} dk)</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tarih</label>
                <input type="date" value={form.tarih} onChange={e => f('tarih', e.target.value)} style={inputStil} />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Açıklama (opsiyonel)</label>
                <input type="text" value={form.aciklama} onChange={e => f('aciklama', e.target.value)}
                  placeholder="Buğday taban gübresi..." style={inputStil} />
              </div>

              <button onClick={kaydet} style={{
                background: 'var(--kirmizi)', color: '#fff', border: 'none',
                borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              }}>
                ✓ {duzMod ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ─── Hareket Listesi ─────────────────────────────────────────
function HareketListesi({ hareketler, tarlalar, onSil, onDuzenle }) {
  const [silOnay, setSilOnay] = useState(null)

  if (hareketler.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--yazi-hafif)', padding: '24px 0', fontSize: 14 }}>
        Henüz kayıt yok
      </div>
    )
  }

  return (
    <>
      {silOnay && (
        <Onayla
          mesaj="Bu kayıt silinsin mi?"
          onEvet={() => { onSil(silOnay); setSilOnay(null) }}
          onHayir={() => setSilOnay(null)}
        />
      )}
      {hareketler.map(h => {
        const tarla = tarlalar.find(t => t.id === h.tarla_id)
        return (
          <div key={h.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            paddingBlock: 12, borderBottom: '1px solid var(--kenar)',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                {h.kalem}
                {h.kaynak === 'avans' && <Etiket bg="var(--yesil-acik)" renk="var(--yesil)">avans</Etiket>}
                {h.kaynak === 'cep' && <Etiket bg="var(--mor-acik)" renk="var(--mor)">şahsi</Etiket>}
                {h.kaynak === 'tedarikci' && <Etiket bg="var(--amber-acik)" renk="var(--amber)">tedarikçi</Etiket>}
                {h.kaynak === 'firma' && h.tur === 'hammadde' && <Etiket bg="var(--mavi-acik)" renk="var(--mavi)">firma</Etiket>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', marginTop: 2 }}>
                {h.miktar ? `${h.miktar} ${h.birim} · ` : ''}
                {tarla ? `${tarla.ad} · ` : ''}
                {tarihBiçim(h.tarih)}
              </div>
              {h.aciklama && (
                <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', marginTop: 1 }}>{h.aciklama}</div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                fontSize: 15, fontWeight: 700,
                color: h.yon === 'gelir' ? 'var(--yesil)' : 'var(--kirmizi)',
              }}>
                {h.yon === 'gelir' ? '+' : '-'}{h.tutar ? paraBiçim(h.tutar) : `${h.miktar} ${h.birim}`}
              </div>
              <button
                onClick={() => onDuzenle(h)}
                title="Düzenle"
                style={{
                  background: 'none', border: 'none', color: 'var(--yazi-hafif)',
                  cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: '4px',
                }}
              >✏️</button>
              <button
                onClick={() => setSilOnay(h.id)}
                title="Sil"
                style={{
                  background: 'none', border: 'none', color: 'var(--yazi-hafif)',
                  cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '4px',
                }}
              >×</button>
            </div>
          </div>
        )
      })}
    </>
  )
}

// ─── Firma Menü Butonu ───────────────────────────────────────
function FirmaMenuBtn({ onDuzenle, onSil }) {
  const [acik, setAcik] = useState(false)

  return (
    <>
      <button
        onClick={e => { e.stopPropagation(); setAcik(v => !v) }}
        style={{
          background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 6,
          color: '#fff', cursor: 'pointer', padding: '4px 10px', fontSize: 18, lineHeight: 1,
          fontWeight: 700,
        }}
      >⋯</button>

      {acik && (
        <>
          {/* Karartma overlay */}
          <div
            onClick={() => setAcik(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 400,
              background: 'rgba(0,0,0,0.45)',
            }}
          />
          {/* Orta ekran menü */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff', borderRadius: 14,
              boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
              padding: 8, minWidth: 220, zIndex: 401,
            }}
          >
            <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--yazi-hafif)', fontWeight: 600 }}>
              Firma İşlemleri
            </div>
            <button onClick={() => { setAcik(false); onDuzenle() }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
              fontWeight: 600, color: 'var(--yazi)', borderRadius: 8,
            }}>✏️ Firma Düzenle</button>
            <button onClick={() => { setAcik(false); onSil() }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
              fontWeight: 600, color: 'var(--kirmizi)', borderRadius: 8,
            }}>🗑️ Firmayı Sil</button>
          </div>
        </>
      )}
    </>
  )
}

// ─── Ana Sayfa ───────────────────────────────────────────────
export default function SozlesmeliSayfasi({ sezon }) {
  const [firmalar, setFirmalar] = useState(firmalariOku)
  const [seciliFirma, setSeciliFirma] = useState(null)
  const [formAcik, setFormAcik] = useState(false)
  const [duzenlenenHareket, setDuzenlenenHareket] = useState(null)
  const [yeniFirmaAcik, setYeniFirmaAcik] = useState(false)
  const [duzenleneFirma, setDuzenleneFirma] = useState(null)
  const [silOnayFirma, setSilOnayFirma] = useState(null)
  const [yeniFirmaAd, setYeniFirmaAd] = useState('')
  const [yeniFirmaUrun, setYeniFirmaUrun] = useState('')
  const [tick, setTick] = useState(0)
  const tarlalar = tarlalariOku()
  const kalemler = kalemleriOku()

  function yenile() {
    setFirmalar(firmalariOku())
    setTick(t => t + 1)
  }

  function firmaKaydet() {
    if (!yeniFirmaAd.trim()) return
    if (duzenleneFirma) {
      firmaDuzenle(duzenleneFirma.id, { ad: yeniFirmaAd.trim(), urun: yeniFirmaUrun.trim() })
      if (seciliFirma?.id === duzenleneFirma.id) {
        setSeciliFirma({ ...seciliFirma, ad: yeniFirmaAd.trim(), urun: yeniFirmaUrun.trim() })
      }
    } else {
      firmaEkle({ ad: yeniFirmaAd.trim(), urun: yeniFirmaUrun.trim() })
    }
    setYeniFirmaAd('')
    setYeniFirmaUrun('')
    setYeniFirmaAcik(false)
    setDuzenleneFirma(null)
    yenile()
  }

  function firmaDuzenleAc(f) {
    setDuzenleneFirma(f)
    setYeniFirmaAd(f.ad)
    setYeniFirmaUrun(f.urun || '')
    setYeniFirmaAcik(true)
  }

  function firmaSilOnayla() {
    if (!silOnayFirma) return
    firmaSil(silOnayFirma.id)
    if (seciliFirma?.id === silOnayFirma.id) setSeciliFirma(null)
    setSilOnayFirma(null)
    yenile()
  }

  function hareketDuzenleAc(h) {
    setDuzenlenenHareket(h)
    setFormAcik(true)
  }

  function formKapat() {
    setFormAcik(false)
    setDuzenlenenHareket(null)
  }

  const hareketler = seciliFirma
    ? hareketleriOku(sezon?.id).filter(h => h.firma_id === seciliFirma.id)
    : []

  return (
    <div className="sayfa">
      {/* Firma sekmeleri */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, alignItems: 'center' }}>
        {firmalar.map(f => {
          const aktif = seciliFirma?.id === f.id
          return (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 6px 6px 14px', borderRadius: 99, border: '1.5px solid',
              background: aktif ? 'var(--yesil)' : '#fff',
              borderColor: aktif ? 'var(--yesil)' : 'var(--kenar)',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              <button
                onClick={() => setSeciliFirma(f)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  color: aktif ? '#fff' : 'var(--yazi)', padding: 0,
                }}
              >
                🏢 {f.ad}
              </button>
              {aktif && (
                <FirmaMenuBtn
                  firma={f}
                  onDuzenle={() => firmaDuzenleAc(f)}
                  onSil={() => setSilOnayFirma(f)}
                />
              )}
            </div>
          )
        })}
        <button onClick={() => { setDuzenleneFirma(null); setYeniFirmaAd(''); setYeniFirmaUrun(''); setYeniFirmaAcik(true) }} style={{
          padding: '8px 16px', borderRadius: 99, border: '1.5px dashed var(--kenar)',
          cursor: 'pointer', fontSize: 13, color: 'var(--yazi-hafif)', whiteSpace: 'nowrap',
          background: 'none', flexShrink: 0,
        }}>
          + Firma Ekle
        </button>
      </div>

      {/* Firma Seçilmemiş */}
      {!seciliFirma && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--yazi-hafif)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
          <div style={{ fontSize: 15, marginBottom: 16 }}>Bir firma seç veya yeni firma ekle</div>
        </div>
      )}

      {/* Firma Seçildi */}
      {seciliFirma && (
        <>
          <BakiyeKarti firma={seciliFirma} sezon={sezon} />
          <div style={{
            background: '#fff', borderRadius: 12, padding: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 8,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Hareketler</div>
              <button onClick={() => { setDuzenlenenHareket(null); setFormAcik(true) }} style={{
                background: 'var(--yesil)', color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>+ Ekle</button>
            </div>
            <HareketListesi
              hareketler={hareketler}
              tarlalar={tarlalar}
              onSil={(id) => { hareketSil(id); yenile() }}
              onDuzenle={hareketDuzenleAc}
            />
          </div>
        </>
      )}

      {/* Firma Sil Onay */}
      {silOnayFirma && (
        <Onayla
          mesaj={`"${silOnayFirma.ad}" silinsin mi? Bu firmaya ait tüm kayıtlar da silinecek.`}
          onEvet={firmaSilOnayla}
          onHayir={() => setSilOnayFirma(null)}
        />
      )}

      {/* Yeni Firma Modal */}
      {yeniFirmaAcik && (
        <Modal onKapat={() => setYeniFirmaAcik(false)} genislik={400}>
          <div style={{ padding: '20px 20px 24px' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
              {duzenleneFirma ? '✏️ Firma Düzenle' : 'Yeni Firma Ekle'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                autoFocus value={yeniFirmaAd} onChange={e => setYeniFirmaAd(e.target.value)}
                placeholder="Firma adı (örn: İnter Tarım)"
                style={{ padding: '12px 14px', border: '1.5px solid var(--kenar)', borderRadius: 10, fontSize: 15, width: '100%' }}
              />
              <input
                value={yeniFirmaUrun} onChange={e => setYeniFirmaUrun(e.target.value)}
                placeholder="Ürün (örn: Patates)"
                style={{ padding: '12px 14px', border: '1.5px solid var(--kenar)', borderRadius: 10, fontSize: 15, width: '100%' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setYeniFirmaAcik(false)} style={{
                  flex: 1, padding: '12px', background: '#f5f5f5', border: 'none',
                  borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600,
                }}>İptal</button>
                <button onClick={firmaKaydet} style={{
                  flex: 2, padding: '12px', background: 'var(--yesil)', color: '#fff',
                  border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700,
                }}>Kaydet</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Hareket Form Modal (Yeni + Düzenle) */}
      {formAcik && seciliFirma && (
        <HareketForm
          firma={seciliFirma}
          sezon={sezon}
          tarlalar={tarlalar}
          kalemler={kalemler}
          onKapat={formKapat}
          onKaydet={() => { formKapat(); yenile() }}
          duzenlenen={duzenlenenHareket}
        />
      )}
    </div>
  )
}
