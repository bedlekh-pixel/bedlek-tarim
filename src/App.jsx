import { useState } from 'react'
import { dbInit, sezonlariOku, ayarlariOku } from './store/db'
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

  const sezonlar = sezonlariOku()
  const sezon = sezonlar.find(s => s.id === sezonId) || sezonlar[0]

  return (
    <Layout sayfa={sayfa} setSayfa={setSayfa} sezon={sezon} onSezonDegis={setSezonId}>
      {sayfa === 'ozet' && <OzetSayfasi sezon={sezon} setSayfa={setSayfa} />}
      {sayfa === 'sozlesmeli' && <SozlesmeliSayfasi sezon={sezon} />}
      {sayfa === 'sahsi' && <SahsiSayfasi sezon={sezon} />}
      {sayfa === 'tarlalar' && <TarlarSayfasi sezon={sezon} />}
      {sayfa === 'hasat' && <HasatSayfasi sezon={sezon} />}
      {sayfa === 'kisiler' && <KisilerSayfasi sezon={sezon} />}
      {sayfa === 'raporlar' && <RaporlarSayfasi sezon={sezon} />}
    </Layout>
  )
}
