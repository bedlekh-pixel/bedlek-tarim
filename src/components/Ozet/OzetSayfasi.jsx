import { sezonOzeti, hareketleriOku, firmalariOku, tarlalariOku } from '../../store/db'
import { paraBiçim, kisaTarih } from '../../utils/format'

function StatKart({ label, tutar, renk, bg, ikon }) {
  return (
    <div style={{ background: bg, borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ fontSize: 12, color: renk, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{ikon}</span>{label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: renk, letterSpacing: -0.5 }}>
        {paraBiçim(tutar)}
      </div>
    </div>
  )
}

function KalemBar({ kalem, tutar, toplamGider }) {
  const yuzde = toplamGider > 0 ? (tutar / toplamGider) * 100 : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13 }}>{kalem}</span>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{paraBiçim(tutar)}</span>
          <span style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginLeft: 6 }}>%{yuzde.toFixed(0)}</span>
        </div>
      </div>
      <div style={{ background: '#F0EDE8', borderRadius: 99, height: 7 }}>
        <div style={{
          background: 'var(--kirmizi)', height: 7, borderRadius: 99,
          width: `${yuzde}%`, transition: 'width 0.4s',
        }} />
      </div>
    </div>
  )
}

export default function OzetSayfasi({ sezon, setSayfa }) {
  const ozet = sezonOzeti(sezon?.id)
  const hareketler = hareketleriOku(sezon?.id)
  const firmalar = firmalariOku()
  const tarlalar = tarlalariOku()

  const kalemGiderleri = {}
  hareketler.filter(h => h.yon === 'gider' && h.kalem).forEach(h => {
    kalemGiderleri[h.kalem] = (kalemGiderleri[h.kalem] || 0) + (h.tutar || 0)
  })
  const kalemSirali = Object.entries(kalemGiderleri).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const sonHareketler = [...hareketler]
    .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
    .slice(0, 8)

  return (
    <div className="sayfa">
      {/* Stat kartları — her zaman 3 kolon */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <StatKart label="Toplam Gelir" tutar={ozet.toplamGelir} renk="var(--yesil)" bg="var(--yesil-acik)" ikon="💚" />
        <StatKart label="Toplam Gider" tutar={ozet.toplamGider} renk="var(--kirmizi)" bg="var(--kirmizi-acik)" ikon="🔴" />
        <div style={{
          background: ozet.net >= 0 ? 'var(--yesil)' : 'var(--kirmizi)',
          borderRadius: 14, padding: '18px 20px',
        }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 6 }}>
            📊 Net Kar / Zarar
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>
            {ozet.net >= 0 ? '+' : ''}{paraBiçim(ozet.net)}
          </div>
        </div>
      </div>

      {/* Alt kısım — desktop'ta yan yana */}
      <div className="desktop-ozet-layout">
        {/* Sol: Son hareketler */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🕐 Son Hareketler</div>

          {sonHareketler.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--yazi-hafif)', padding: '28px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
              Henüz kayıt yok.
              <br />
              <button onClick={() => setSayfa('sozlesmeli')} style={{
                marginTop: 10, background: 'var(--yesil)', color: '#fff',
                border: 'none', borderRadius: 8, padding: '8px 16px',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>
                İlk kaydı ekle →
              </button>
            </div>
          ) : (
            sonHareketler.map(h => {
              const tarla = tarlalar.find(t => t.id === h.tarla_id)
              const firma = firmalar.find(f => f.id === h.firma_id)
              return (
                <div key={h.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  paddingBlock: 10, borderBottom: '1px solid var(--kenar)',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {h.kalem || h.tur}
                      {h.kaynak === 'avans' && (
                        <span style={{ background: 'var(--yesil-acik)', color: 'var(--yesil)', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>avans</span>
                      )}
                      {h.kaynak === 'cep' && (
                        <span style={{ background: 'var(--mor-acik)', color: 'var(--mor)', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>cep</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--yazi-hafif)', marginTop: 2 }}>
                      {tarla?.ad || firma?.ad || h.aciklama} · {kisaTarih(h.tarih)}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: h.yon === 'gelir' ? 'var(--yesil)' : 'var(--kirmizi)' }}>
                    {h.yon === 'gelir' ? '+' : '-'}{paraBiçim(h.tutar)}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Sağ: Gider dağılımı */}
        {kalemSirali.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📊 Gider Dağılımı</div>
            {kalemSirali.map(([kalem, tutar]) => (
              <KalemBar key={kalem} kalem={kalem} tutar={tutar} toplamGider={ozet.toplamGider} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
