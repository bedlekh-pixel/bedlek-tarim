import { useState } from 'react'
import { tarlalariOku, tarlaEkle, tarlaSil, tarlaDuzenle, firmalariOku, tarlaOzeti, hareketleriOku } from '../../store/db'
import { paraBiçim, tarihBiçim } from '../../utils/format'
import Modal from '../../utils/Modal'
import Onayla from '../../utils/Onayla'

function TarlaForm({ onKapat, onKaydet, duzenlenen }) {
  const firmalar = firmalariOku()
  const [form, setForm] = useState(duzenlenen || {
    ad: '', sahip: '', dekar: '', urun: '',
    modul: 'sozlesmeli', firma_id: '', sezon: '',
  })

  function f(alan, deger) { setForm(prev => ({ ...prev, [alan]: deger })) }

  function kaydet() {
    if (!form.ad.trim()) return
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
              <input type="number" inputMode="decimal" value={form.dekar}
                onChange={e => f('dekar', e.target.value)} placeholder="0" style={inputStil} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ekilen Ürün</label>
              <input value={form.urun} onChange={e => f('urun', e.target.value)}
                placeholder="Patates" style={inputStil} />
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
                {firmalar.map(f => <option key={f.id} value={f.id}>{f.ad}</option>)}
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

  const kalemGruplari = {}
  hareketler.forEach(h => {
    if (!kalemGruplari[h.kalem]) kalemGruplari[h.kalem] = 0
    kalemGruplari[h.kalem] += h.tutar || 0
  })

  const dekarMaliyet = tarla.dekar > 0 ? oz.toplamGider / tarla.dekar : 0

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--zemin)',
      zIndex: 300, overflowY: 'auto',
    }}>
      <div style={{
        background: 'var(--yesil)', padding: '16px',
        paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onKapat} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
          borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 18,
        }}>←</button>
        <div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{tarla.ad}</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
            {tarla.urun} · {tarla.dekar} dekar · {tarla.sahip}
          </div>
        </div>
      </div>

      <div className="sayfa">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 11, color: 'var(--kirmizi)', fontWeight: 600 }}>Toplam Gider</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--kirmizi)' }}>{paraBiçim(oz.toplamGider)}</div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600 }}>Dekar Başı</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--amber)' }}>{paraBiçim(dekarMaliyet)}</div>
          </div>
        </div>

        {Object.keys(kalemGruplari).length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Kalem Bazlı Giderler</div>
            {Object.entries(kalemGruplari).sort((a, b) => b[1] - a[1]).map(([kalem, tutar]) => (
              <div key={kalem} style={{
                display: 'flex', justifyContent: 'space-between',
                paddingBlock: 8, borderBottom: '1px solid var(--kenar)',
                fontSize: 14,
              }}>
                <span>{kalem}</span>
                <span style={{ fontWeight: 700 }}>{paraBiçim(tutar)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Tüm Hareketler</div>
          {hareketler.length === 0 ? (
            <div style={{ color: 'var(--yazi-hafif)', textAlign: 'center', padding: '20px 0' }}>Hareket yok</div>
          ) : (
            [...hareketler].sort((a, b) => new Date(b.tarih) - new Date(a.tarih)).map(h => (
              <div key={h.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                paddingBlock: 10, borderBottom: '1px solid var(--kenar)',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{h.kalem}</div>
                  <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 1 }}>
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

export default function TarlarSayfasi({ sezon }) {
  const [tarlalar, setTarlalar] = useState(tarlalariOku)
  const [formAcik, setFormAcik] = useState(false)
  const [duzenlenen, setDuzenlenen] = useState(null)
  const [detayTarla, setDetayTarla] = useState(null)
  const [silinecek, setSilinecek] = useState(null)

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

  return (
    <div className="sayfa">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{tarlalar.length} Tarla</div>
        <button onClick={() => { setDuzenlenen(null); setFormAcik(true) }} style={{
          background: 'var(--yesil)', color: '#fff', border: 'none',
          borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>
          + Tarla Ekle
        </button>
      </div>

      {tarlalar.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--yazi-hafif)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌾</div>
          Henüz tarla eklenmemiş
        </div>
      ) : (
        <div className="grid-3">
        {tarlalar.map(tarla => {
          const oz = tarlaOzeti(tarla.id, sezon?.id)
          return (
            <div
              key={tarla.id}
              onClick={() => setDetayTarla(tarla)}
              style={{
                background: '#fff', borderRadius: 12, padding: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{tarla.ad}</div>
                  <div style={{ fontSize: 12, color: 'var(--yazi-hafif)', marginTop: 3 }}>
                    {tarla.urun} · {tarla.dekar} dk · {tarla.sahip}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: tarla.modul === 'sozlesmeli' ? 'var(--yesil-acik)' : 'var(--mor-acik)',
                    color: tarla.modul === 'sozlesmeli' ? 'var(--yesil)' : 'var(--mor)',
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  }}>
                    {tarla.modul === 'sozlesmeli' ? 'Sözleşmeli' : 'Şahsi'}
                  </span>
                </div>
              </div>
              {oz.toplamGider > 0 && (
                <div style={{
                  marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--kenar)',
                  display: 'flex', gap: 16,
                }}>
                  <span style={{ fontSize: 12, color: 'var(--kirmizi)', fontWeight: 600 }}>
                    Gider: {paraBiçim(oz.toplamGider)}
                  </span>
                  {tarla.dekar > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>
                      dk başı: {paraBiçim(oz.toplamGider / tarla.dekar)}
                    </span>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button
                  onClick={e => duzenleAc(e, tarla)}
                  title="Düzenle"
                  style={{
                    background: 'none', border: '1px solid var(--kenar)',
                    color: 'var(--yazi-hafif)', cursor: 'pointer',
                    fontSize: 12, padding: '3px 8px', borderRadius: 6,
                  }}
                >✏️ Düzenle</button>
                <button
                  onClick={e => { e.stopPropagation(); setSilinecek(tarla) }}
                  title="Sil"
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--yazi-hafif)', cursor: 'pointer', fontSize: 12, padding: '3px 4px',
                  }}
                >Sil</button>
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
