import { useState, useEffect } from 'react'
import { dbInit, dbSyncFromCloud, sezonlariOku, ayarlariOku } from './store/db'
import { supabase } from './store/supabase'
import Layout from './components/Layout/Layout'
import OzetSayfasi from './components/Ozet/OzetSayfasi'
import SozlesmeliSayfasi from './components/Sozlesmeli/SozlesmeliSayfasi'
import SahsiSayfasi from './components/Sahsi/SahsiSayfasi'
import TarlarSayfasi from './components/Tarlalar/TarlarSayfasi'
import HasatSayfasi from './components/Hasat/HasatSayfasi'
import RaporlarSayfasi from './components/Raporlar/RaporlarSayfasi'
import KisilerSayfasi from './components/Kisiler/KisilerSayfasi'

dbInit()

export default function App() {
  const [sayfa, setSayfa] = useState('ozet')
  const [sezonId, setSezonId] = useState(() => ayarlariOku().aktifSezon)
  const [hazir, setHazir] = useState(false)
  const [yenile, setYenile] = useState(0)
  const [syncHata, setSyncHata] = useState(null)

  useEffect(() => {
    // Bağlantıyı test et, sonra senkronize et
    supabase.from('store').select('key').limit(1)
      .then(({ error }) => {
        if (error) {
          console.error('Supabase bağlantı hatası:', error)
          setSyncHata(error.message)
        } else {
          setSyncHata(null)
        }
      })

    dbSyncFromCloud()
      .then(() => {
        const aktifSezon = ayarlariOku().aktifSezon
        setSezonId(aktifSezon)
        setYenile(n => n + 1)
      })
      .finally(() => {
        setHazir(true)
      })
  }, [])

  const sezonlar = sezonlariOku()
  const sezon = sezonlar.find(s => s.id === sezonId) || sezonlar[0]

  if (!hazir) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F0F7F4' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: '4px solid #0F6E56',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
          }} />
          <p style={{ color: '#0F6E56', fontWeight: 600 }}>Veriler yükleniyor…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {syncHata && (
        <div style={{
          background: '#FEF2F2', borderBottom: '1px solid #FECACA',
          padding: '8px 16px', fontSize: 12, color: '#DC2626', textAlign: 'center',
        }}>
          ⚠️ Bulut bağlantısı kurulamadı — veriler yalnızca bu cihazda saklanıyor. ({syncHata})
        </div>
      )}
      <Layout sayfa={sayfa} setSayfa={setSayfa} sezon={sezon} onSezonDegis={setSezonId}>
        {sayfa === 'ozet' && <OzetSayfasi key={yenile} sezon={sezon} setSayfa={setSayfa} />}
        {sayfa === 'sozlesmeli' && <SozlesmeliSayfasi key={yenile} sezon={sezon} />}
        {sayfa === 'sahsi' && <SahsiSayfasi key={yenile} sezon={sezon} />}
        {sayfa === 'tarlalar' && <TarlarSayfasi key={yenile} sezon={sezon} />}
        {sayfa === 'hasat' && <HasatSayfasi key={yenile} sezon={sezon} />}
        {sayfa === 'kisiler' && <KisilerSayfasi key={yenile} sezon={sezon} />}
        {sayfa === 'raporlar' && <RaporlarSayfasi key={yenile} sezon={sezon} />}
      </Layout>
    </>
  )
}
