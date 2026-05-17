import { useState, useEffect } from 'react'
import { dbInit, dbSyncFromCloud, sezonlariOku, ayarlariOku } from './store/db'
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

  useEffect(() => {
    dbSyncFromCloud().then(() => {
      // Buluttan gelen veriyle sezon ID'yi güncelle
      const aktifSezon = ayarlariOku().aktifSezon
      setSezonId(aktifSezon)
      setHazir(true)
      setYenile(n => n + 1)
    })
  }, [])

  const sezonlar = sezonlariOku()
  const sezon = sezonlar.find(s => s.id === sezonId) || sezonlar[0]

  if (!hazir) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F7F4]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#0F6E56] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#0F6E56] font-semibold">Veriler yükleniyor…</p>
        </div>
      </div>
    )
  }

  return (
    <Layout sayfa={sayfa} setSayfa={setSayfa} sezon={sezon} onSezonDegis={setSezonId}>
      {sayfa === 'ozet' && <OzetSayfasi key={yenile} sezon={sezon} setSayfa={setSayfa} />}
      {sayfa === 'sozlesmeli' && <SozlesmeliSayfasi key={yenile} sezon={sezon} />}
      {sayfa === 'sahsi' && <SahsiSayfasi key={yenile} sezon={sezon} />}
      {sayfa === 'tarlalar' && <TarlarSayfasi key={yenile} sezon={sezon} />}
      {sayfa === 'hasat' && <HasatSayfasi key={yenile} sezon={sezon} />}
      {sayfa === 'kisiler' && <KisilerSayfasi key={yenile} sezon={sezon} />}
      {sayfa === 'raporlar' && <RaporlarSayfasi key={yenile} sezon={sezon} />}
    </Layout>
  )
}
