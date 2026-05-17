import { useState } from 'react'
import { kisileriOku, kisiEkle, kisiSil, kisiDuzenle, hareketleriOku, hareketEkle, hareketDuzenle, hareketSil } from '../../store/db'
import { paraBiçim, tarihBiçim, bugun } from '../../utils/format'
import Modal from '../../utils/Modal'
import Onayla from '../../utils/Onayla'

const KISI_TURLERI = [
  { id: 'aile', label: 'Aile', renk: '#0F6E56' },
  { id: 'tedarikci', label: 'Tedarikçi', renk: '#185FA5' },
  { id: 'hizmet', label: 'Hizmet', renk: '#854F0B' },
  { id: 'alici', label: 'Alıcı', renk: '#534AB7' },
]

function KisiForm({ onKapat, onKaydet, duzenlenen }) {
  const [form, setForm] = useState(duzenlenen || { ad: '', tur: 'aile', telefon: '', not: '' })
  function f(alan, v) { setForm(p => ({ ...p, [alan]: v })) }
  function kaydet() {
    if (!form.ad.trim()) return
    if (duzenlenen) kisiDuzenle(duzenlenen.id, form)
    else kisiEkle(form)
    onKaydet()
  }
  const inp = { width: '100%', padding: '12px 14px', border: '1.5px solid var(--kenar)', borderRadius: 10, fontSize: 15, background: '#fff' }
  return (
    <Modal onKapat={onKapat} genislik={420}>
      <div style={{ padding: '20px 20px 24px' }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{duzenlenen ? 'Kişi Düzenle' : '👤 Yeni Kişi'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input autoFocus value={form.ad} onChange={e => f('ad', e.target.value)} placeholder="Ad Soyad" style={inp} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {KISI_TURLERI.map(t => (
              <button key={t.id} onClick={() => f('tur', t.id)} style={{
                padding: '8px 14px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: form.tur === t.id ? t.renk : '#fff',
                borderColor: form.tur === t.id ? t.renk : 'var(--kenar)',
                color: form.tur === t.id ? '#fff' : 'var(--yazi)',
              }}>{t.label}</button>
            ))}
          </div>
          <input type="tel" value={form.telefon} onChange={e => f('telefon', e.target.value)} placeholder="Telefon (opsiyonel)" style={inp} />
          <textarea value={form.not} onChange={e => f('not', e.target.value)} placeholder="Notlar..." rows={3}
            style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onKapat} style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>İptal</button>
            <button onClick={kaydet} style={{ flex: 2, padding: '12px', background: 'var(--yesil)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>Kaydet</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function BorcAlacakForm({ kisi, sezon, onKapat, onKaydet }) {
  const [form, setForm] = useState({ yon: 'gider', tutar: '', aciklama: '', tarih: bugun() })
  function f(alan, v) { setForm(p => ({ ...p, [alan]: v })) }
  function kaydet() {
    if (!form.tutar) return
    hareketEkle({
      tarih: form.tarih, sezon: sezon?.id, modul: 'kisiler',
      tur: form.yon === 'gider' ? 'borc' : 'alacak', yon: form.yon,
      kalem: form.yon === 'gider' ? 'Borç (Verilen)' : 'Alacak (Alınan)',
      tutar: parseFloat(form.tutar), aciklama: form.aciklama, kisi_id: kisi.id,
    })
    onKaydet()
  }
  const inp = { width: '100%', padding: '11px 13px', border: '1.5px solid var(--kenar)', borderRadius: 10, fontSize: 15, background: '#fff' }
  return (
    <Modal onKapat={onKapat} genislik={400}>
      <div style={{ padding: '20px 20px 24px' }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Borç / Alacak Ekle</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => f('yon', 'gider')} style={{
              flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid', cursor: 'pointer', fontWeight: 700,
              background: form.yon === 'gider' ? 'var(--kirmizi)' : '#fff',
              borderColor: form.yon === 'gider' ? 'var(--kirmizi)' : 'var(--kenar)',
              color: form.yon === 'gider' ? '#fff' : 'var(--yazi)',
            }}>Verdim (Borç)</button>
            <button onClick={() => f('yon', 'gelir')} style={{
              flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid', cursor: 'pointer', fontWeight: 700,
              background: form.yon === 'gelir' ? 'var(--yesil)' : '#fff',
              borderColor: form.yon === 'gelir' ? 'var(--yesil)' : 'var(--kenar)',
              color: form.yon === 'gelir' ? '#fff' : 'var(--yazi)',
            }}>Aldım (Alacak)</button>
          </div>
          <input type="number" inputMode="numeric" value={form.tutar} onChange={e => f('tutar', e.target.value)} placeholder="Tutar (TL)" style={inp} />
          <input value={form.aciklama} onChange={e => f('aciklama', e.target.value)} placeholder="Açıklama" style={inp} />
          <input type="date" value={form.tarih} onChange={e => f('tarih', e.target.value)} style={inp} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onKapat} style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>İptal</button>
            <button onClick={kaydet} style={{ flex: 2, padding: '12px', background: 'var(--yesil)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>Kaydet</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function HareketDuzenleForm({ hareket, onKapat, onKaydet }) {
  const [form, setForm] = useState({
    yon: hareket.yon,
    tutar: hareket.tutar || '',
    aciklama: hareket.aciklama || '',
    tarih: hareket.tarih || bugun(),
  })
  function f(alan, v) { setForm(p => ({ ...p, [alan]: v })) }
  function kaydet() {
    if (!form.tutar) return
    hareketDuzenle(hareket.id, {
      yon: form.yon,
      tutar: parseFloat(form.tutar),
      aciklama: form.aciklama,
      tarih: form.tarih,
      kalem: form.yon === 'gider' ? 'Borç (Verilen)' : 'Alacak (Alınan)',
    })
    onKaydet()
  }
  const inp = { width: '100%', padding: '11px 13px', border: '1.5px solid var(--kenar)', borderRadius: 10, fontSize: 15, background: '#fff', boxSizing: 'border-box' }
  return (
    <Modal onKapat={onKapat} genislik={400}>
      <div style={{ padding: '20px 20px 24px' }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>✏️ Hareketi Düzenle</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => f('yon', 'gider')} style={{
              flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid', cursor: 'pointer', fontWeight: 700,
              background: form.yon === 'gider' ? 'var(--kirmizi)' : '#fff',
              borderColor: form.yon === 'gider' ? 'var(--kirmizi)' : 'var(--kenar)',
              color: form.yon === 'gider' ? '#fff' : 'var(--yazi)',
            }}>Verdim (Borç)</button>
            <button onClick={() => f('yon', 'gelir')} style={{
              flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid', cursor: 'pointer', fontWeight: 700,
              background: form.yon === 'gelir' ? 'var(--yesil)' : '#fff',
              borderColor: form.yon === 'gelir' ? 'var(--yesil)' : 'var(--kenar)',
              color: form.yon === 'gelir' ? '#fff' : 'var(--yazi)',
            }}>Aldım (Alacak)</button>
          </div>
          <input type="number" inputMode="numeric" value={form.tutar} onChange={e => f('tutar', e.target.value)} placeholder="Tutar (TL)" style={inp} />
          <input value={form.aciklama} onChange={e => f('aciklama', e.target.value)} placeholder="Açıklama" style={inp} />
          <input type="date" value={form.tarih} onChange={e => f('tarih', e.target.value)} style={inp} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onKapat} style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>İptal</button>
            <button onClick={kaydet} style={{ flex: 2, padding: '12px', background: 'var(--yesil)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>Kaydet</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function KisiDetay({ kisi: ilkKisi, sezon, onKapat, onSilindi }) {
  const [kisi, setKisi] = useState(ilkKisi)
  const [duzenleAcik, setDuzenleAcik] = useState(false)
  const [borcFormAcik, setBorcFormAcik] = useState(false)
  const [silOnay, setSilOnay] = useState(false)
  const [duzenleHareket, setDuzenleHareket] = useState(null)
  const [silHareket, setSilHareket] = useState(null)
  const [, setYenileSayac] = useState(0)

  const hareketler = hareketleriOku(sezon?.id).filter(h => h.kisi_id === kisi.id)
  const tur = KISI_TURLERI.find(t => t.id === kisi.tur)
  const toplamGelir = hareketler.filter(h => h.yon === 'gelir').reduce((t, h) => t + (h.tutar || 0), 0)
  const toplamGider = hareketler.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0)
  const net = toplamGelir - toplamGider

  function yenile() {
    const guncel = kisileriOku().find(k => k.id === kisi.id)
    if (guncel) setKisi(guncel)
    setYenileSayac(n => n + 1)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--zemin)', zIndex: 300, overflowY: 'auto' }}>
      <div style={{
        background: tur?.renk || 'var(--yesil)', padding: '16px 20px',
        paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onKapat} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 18 }}>←</button>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{kisi.ad}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{tur?.label}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDuzenleAcik(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Düzenle</button>
          <button onClick={() => setSilOnay(true)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 18 }}>🗑️</button>
        </div>
      </div>

      <div className="sayfa">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, background: 'var(--kirmizi-acik)', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--kirmizi)', fontWeight: 700 }}>Verdim</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--kirmizi)' }}>{paraBiçim(toplamGider)}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--yesil-acik)', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--yesil)', fontWeight: 700 }}>Aldım</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--yesil)' }}>{paraBiçim(toplamGelir)}</div>
          </div>
          <div style={{ flex: 1, background: net >= 0 ? 'var(--yesil)' : 'var(--kirmizi)', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>Net</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{net >= 0 ? '+' : ''}{paraBiçim(net)}</div>
          </div>
        </div>

        {(kisi.telefon || kisi.not) && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {kisi.telefon && <a href={`tel:${kisi.telefon}`} style={{ display: 'block', fontWeight: 600, fontSize: 14, color: 'var(--yazi)', textDecoration: 'none', marginBottom: kisi.not ? 8 : 0 }}>📞 {kisi.telefon}</a>}
            {kisi.not && <div style={{ fontSize: 13, color: 'var(--yazi-hafif)', lineHeight: 1.6, borderTop: kisi.telefon ? '1px solid var(--kenar)' : 'none', paddingTop: kisi.telefon ? 8 : 0 }}>📝 {kisi.not}</div>}
          </div>
        )}

        <button onClick={() => setBorcFormAcik(true)} style={{
          width: '100%', padding: '13px', marginBottom: 16,
          background: '#fff', border: '1.5px dashed var(--kenar)', borderRadius: 12,
          cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'var(--yazi)',
        }}>+ Borç / Alacak Ekle</button>

        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Tüm Hareketler</div>
          {hareketler.length === 0 ? (
            <div style={{ color: 'var(--yazi-hafif)', textAlign: 'center', padding: '20px 0' }}>Henüz kayıt yok</div>
          ) : (
            [...hareketler].sort((a, b) => new Date(b.tarih) - new Date(a.tarih)).map(h => (
              <div key={h.id} style={{ paddingBlock: 10, borderBottom: '1px solid var(--kenar)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{h.kalem || h.tur}</div>
                    {h.aciklama && <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 2 }}>{h.aciklama}</div>}
                    <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 1 }}>{tarihBiçim(h.tarih)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: h.yon === 'gelir' ? 'var(--yesil)' : 'var(--kirmizi)' }}>
                      {h.yon === 'gelir' ? '+' : '-'}{paraBiçim(h.tutar)}
                    </div>
                    <button onClick={() => setDuzenleHareket(h)} style={{ background: '#F0F7F4', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }}>✏️</button>
                    <button onClick={() => setSilHareket(h)} style={{ background: '#FEF2F2', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {duzenleAcik && <KisiForm duzenlenen={kisi} onKapat={() => setDuzenleAcik(false)} onKaydet={() => { setDuzenleAcik(false); yenile() }} />}
      {borcFormAcik && <BorcAlacakForm kisi={kisi} sezon={sezon} onKapat={() => setBorcFormAcik(false)} onKaydet={() => setBorcFormAcik(false)} />}
      {silOnay && <Onayla mesaj={`"${kisi.ad}" silinsin mi?`} onEvet={() => { kisiSil(kisi.id); onSilindi() }} onHayir={() => setSilOnay(false)} />}
      {duzenleHareket && (
        <HareketDuzenleForm
          hareket={duzenleHareket}
          onKapat={() => setDuzenleHareket(null)}
          onKaydet={() => { setDuzenleHareket(null); yenile() }}
        />
      )}
      {silHareket && (
        <Onayla
          mesaj={`Bu hareket silinsin mi? (${paraBiçim(silHareket.tutar)})`}
          onEvet={() => { hareketSil(silHareket.id); setSilHareket(null); yenile() }}
          onHayir={() => setSilHareket(null)}
        />
      )}
    </div>
  )
}

export default function KisilerSayfasi({ sezon }) {
  const [kisiler, setKisiler] = useState(kisileriOku)
  const [formAcik, setFormAcik] = useState(false)
  const [detayKisi, setDetayKisi] = useState(null)
  const [aktifTur, setAktifTur] = useState('tumu')

  function yenile() { setKisiler(kisileriOku()) }

  const filtreliKisiler = aktifTur === 'tumu' ? kisiler : kisiler.filter(k => k.tur === aktifTur)

  return (
    <div className="sayfa">
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {[{ id: 'tumu', label: 'Tümü', renk: 'var(--yesil)' }, ...KISI_TURLERI].map(t => (
          <button key={t.id} onClick={() => setAktifTur(t.id)} style={{
            padding: '7px 14px', borderRadius: 99, border: '1.5px solid', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
            background: aktifTur === t.id ? (t.renk || 'var(--yesil)') : '#fff',
            borderColor: aktifTur === t.id ? (t.renk || 'var(--yesil)') : 'var(--kenar)',
            color: aktifTur === t.id ? '#fff' : 'var(--yazi)',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={() => setFormAcik(true)} style={{
          background: 'var(--yesil)', color: '#fff', border: 'none',
          borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>+ Kişi Ekle</button>
      </div>

      {filtreliKisiler.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--yazi-hafif)' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>Henüz kişi eklenmemiş
        </div>
      ) : (
        <div className="grid-2">
          {filtreliKisiler.map(k => {
            const tur = KISI_TURLERI.find(t => t.id === k.tur)
            const hareketler = hareketleriOku(sezon?.id).filter(h => h.kisi_id === k.id)
            const net = hareketler.reduce((t, h) => t + (h.yon === 'gelir' ? (h.tutar || 0) : -(h.tutar || 0)), 0)
            return (
              <div key={k.id} onClick={() => setDetayKisi(k)} style={{
                background: '#fff', borderRadius: 12, padding: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{k.ad}</div>
                  <span style={{
                    background: (tur?.renk || '#0F6E56') + '22',
                    color: tur?.renk || '#0F6E56',
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                  }}>{tur?.label}</span>
                </div>
                {k.telefon && <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', marginBottom: 4 }}>📞 {k.telefon}</div>}
                {k.not && <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', marginBottom: 4 }}>{k.not.slice(0, 60)}{k.not.length > 60 ? '…' : ''}</div>}
                {hareketler.length > 0 && (
                  <div style={{ paddingTop: 8, borderTop: '1px solid var(--kenar)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--yazi-hafif)' }}>{hareketler.length} kayıt</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: net >= 0 ? 'var(--yesil)' : 'var(--kirmizi)' }}>
                      {net >= 0 ? '+' : ''}{paraBiçim(net)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {formAcik && <KisiForm onKapat={() => setFormAcik(false)} onKaydet={() => { setFormAcik(false); yenile() }} />}
      {detayKisi && <KisiDetay kisi={detayKisi} sezon={sezon} onKapat={() => { setDetayKisi(null); yenile() }} onSilindi={() => { setDetayKisi(null); yenile() }} />}
    </div>
  )
}
