// Veri katmanı — tüm veriler localStorage'da saklanır

const KEYS = {
  firmalar: 'bt_firmalar',
  tarlalar: 'bt_tarlalar',
  hareketler: 'bt_hareketler',
  kisiler: 'bt_kisiler',
  sezonlar: 'bt_sezonlar',
  kalemler: 'bt_kalemler',
  ayarlar: 'bt_ayarlar',
  isci_gruplari: 'bt_isci_gruplari',
  iscilik_kayitlari: 'bt_iscilik_kayitlari',
}

function oku(key) {
  try {
    const veri = localStorage.getItem(key)
    return veri ? JSON.parse(veri) : null
  } catch {
    return null
  }
}

function yaz(key, veri) {
  localStorage.setItem(key, JSON.stringify(veri))
}

// ─── Başlangıç verileri ──────────────────────────────────────

const VARSAYILAN_KALEMLER = [
  { id: 'tohum', ad: 'Tohum', ikon: '🌱', sabit: true, renk: '#0F6E56' },
  { id: 'gubre', ad: 'Gübre', ikon: '🪣', sabit: true, renk: '#854F0B' },
  { id: 'ilac', ad: 'İlaç', ikon: '💧', sabit: true, renk: '#185FA5' },
  { id: 'mazot', ad: 'Mazot', ikon: '⛽', sabit: true, renk: '#374151' },
  { id: 'elektrik', ad: 'Elektrik', ikon: '⚡', sabit: true, renk: '#D97706' },
  { id: 'iscilik', ad: 'İşçilik', ikon: '👷', sabit: true, renk: '#7C3AED' },
  { id: 'nakliye', ad: 'Nakliye', ikon: '🚛', sabit: false, renk: '#6B7280' },
  { id: 'dron', ad: 'Dron İlaçlama', ikon: '🚁', sabit: false, renk: '#185FA5' },
  { id: 'kepce', ad: 'Kepçe/İş Makinası', ikon: '🏗️', sabit: false, renk: '#92400E' },
  { id: 'traktör', ad: 'Traktör', ikon: '🚜', sabit: false, renk: '#374151' },
]

const VARSAYILAN_SEZON = {
  id: new Date().getFullYear().toString(),
  ad: `${new Date().getFullYear()} Sezonu`,
  baslangic: `${new Date().getFullYear()}-01-01`,
  bitis: `${new Date().getFullYear()}-12-31`,
  aktif: true,
}

// ─── Init ────────────────────────────────────────────────────

export function dbInit() {
  if (!oku(KEYS.kalemler)) yaz(KEYS.kalemler, VARSAYILAN_KALEMLER)
  if (!oku(KEYS.firmalar)) yaz(KEYS.firmalar, [])
  if (!oku(KEYS.tarlalar)) yaz(KEYS.tarlalar, [])
  if (!oku(KEYS.hareketler)) yaz(KEYS.hareketler, [])
  if (!oku(KEYS.kisiler)) yaz(KEYS.kisiler, [])
  if (!oku(KEYS.sezonlar)) yaz(KEYS.sezonlar, [VARSAYILAN_SEZON])
  if (!oku(KEYS.ayarlar)) yaz(KEYS.ayarlar, { aktifSezon: VARSAYILAN_SEZON.id })
  if (!oku(KEYS.isci_gruplari)) yaz(KEYS.isci_gruplari, [])
  if (!oku(KEYS.iscilik_kayitlari)) yaz(KEYS.iscilik_kayitlari, [])
}

// ─── İşçi Grupları ───────────────────────────────────────────

export function isciGruplariniOku() {
  return oku(KEYS.isci_gruplari) || []
}

export function isciGrubuEkle(grup) {
  const liste = isciGruplariniOku()
  const yeni = { ...grup, id: grup.id || `grup_${Date.now()}`, aktif: true }
  yaz(KEYS.isci_gruplari, [...liste, yeni])
  return yeni
}

export function isciGrubuDuzenle(id, degisiklikler) {
  const liste = isciGruplariniOku().map(g => g.id === id ? { ...g, ...degisiklikler } : g)
  yaz(KEYS.isci_gruplari, liste)
}

export function isciGrubuSil(id) {
  yaz(KEYS.isci_gruplari, isciGruplariniOku().filter(g => g.id !== id))
}

// ─── İşçilik Kayıtları ───────────────────────────────────────

export function iscilikKayitlariniOku(sezonId) {
  const tumKayitlar = oku(KEYS.iscilik_kayitlari) || []
  if (!sezonId) return tumKayitlar
  return tumKayitlar.filter(k => k.sezon === sezonId)
}

export function iscilikKaydiEkle(kayit) {
  const liste = oku(KEYS.iscilik_kayitlari) || []
  const yeni = { ...kayit, id: kayit.id || `isk_${Date.now()}`, olusturma: new Date().toISOString() }
  yaz(KEYS.iscilik_kayitlari, [...liste, yeni])
  return yeni
}

export function iscilikKaydiDuzenle(id, degisiklikler) {
  const liste = (oku(KEYS.iscilik_kayitlari) || []).map(k =>
    k.id === id ? { ...k, ...degisiklikler } : k
  )
  yaz(KEYS.iscilik_kayitlari, liste)
}

export function iscilikKaydiSil(id) {
  yaz(KEYS.iscilik_kayitlari, (oku(KEYS.iscilik_kayitlari) || []).filter(k => k.id !== id))
}

// ─── Ayarlar ─────────────────────────────────────────────────

export function ayarlariOku() {
  return oku(KEYS.ayarlar) || { aktifSezon: new Date().getFullYear().toString() }
}

export function aktifSezonu(sezonId) {
  const ayarlar = ayarlariOku()
  yaz(KEYS.ayarlar, { ...ayarlar, aktifSezon: sezonId })
}

// ─── Sezonlar ────────────────────────────────────────────────

export function sezonlariOku() {
  return oku(KEYS.sezonlar) || []
}

export function sezonEkle(sezon) {
  const liste = sezonlariOku()
  const yeni = { ...sezon, id: sezon.id || Date.now().toString() }
  yaz(KEYS.sezonlar, [...liste, yeni])
  return yeni
}

export function sezonSil(id) {
  yaz(KEYS.sezonlar, sezonlariOku().filter(s => s.id !== id))
}

// ─── Firmalar ────────────────────────────────────────────────

export function firmalariOku() {
  return oku(KEYS.firmalar) || []
}

export function firmaEkle(firma) {
  const liste = firmalariOku()
  const yeni = { ...firma, id: firma.id || `firma_${Date.now()}`, aktif: true }
  yaz(KEYS.firmalar, [...liste, yeni])
  return yeni
}

export function firmaDuzenle(id, degisiklikler) {
  const liste = firmalariOku().map(f => f.id === id ? { ...f, ...degisiklikler } : f)
  yaz(KEYS.firmalar, liste)
}

export function firmaSil(id) {
  yaz(KEYS.firmalar, firmalariOku().filter(f => f.id !== id))
}

// ─── Tarlalar ────────────────────────────────────────────────

export function tarlalariOku() {
  return oku(KEYS.tarlalar) || []
}

export function tarlaEkle(tarla) {
  const liste = tarlalariOku()
  const yeni = { ...tarla, id: tarla.id || `tarla_${Date.now()}` }
  yaz(KEYS.tarlalar, [...liste, yeni])
  return yeni
}

export function tarlaDuzenle(id, degisiklikler) {
  const liste = tarlalariOku().map(t => t.id === id ? { ...t, ...degisiklikler } : t)
  yaz(KEYS.tarlalar, liste)
}

export function tarlaSil(id) {
  yaz(KEYS.tarlalar, tarlalariOku().filter(t => t.id !== id))
}

// ─── Hareketler ──────────────────────────────────────────────

export function hareketleriOku(sezonId) {
  const tumHareketler = oku(KEYS.hareketler) || []
  if (!sezonId) return tumHareketler
  return tumHareketler.filter(h => h.sezon === sezonId)
}

export function hareketEkle(hareket) {
  const liste = oku(KEYS.hareketler) || []
  const yeni = {
    ...hareket,
    id: hareket.id || Date.now(),
    olusturma: new Date().toISOString(),
  }
  yaz(KEYS.hareketler, [...liste, yeni])
  return yeni
}

export function hareketDuzenle(id, degisiklikler) {
  const liste = (oku(KEYS.hareketler) || []).map(h =>
    h.id === id ? { ...h, ...degisiklikler } : h
  )
  yaz(KEYS.hareketler, liste)
}

export function hareketSil(id) {
  yaz(KEYS.hareketler, (oku(KEYS.hareketler) || []).filter(h => h.id !== id))
}

// ─── Kişiler ────────────────────────────────────────────────

export function kisileriOku() {
  return oku(KEYS.kisiler) || []
}

export function kisiEkle(kisi) {
  const liste = kisileriOku()
  const yeni = { ...kisi, id: kisi.id || `kisi_${Date.now()}`, aktif: true }
  yaz(KEYS.kisiler, [...liste, yeni])
  return yeni
}

export function kisiDuzenle(id, degisiklikler) {
  const liste = kisileriOku().map(k => k.id === id ? { ...k, ...degisiklikler } : k)
  yaz(KEYS.kisiler, liste)
}

export function kisiSil(id) {
  yaz(KEYS.kisiler, kisileriOku().filter(k => k.id !== id))
}

// ─── Kalemler ────────────────────────────────────────────────

export function kalemleriOku() {
  return oku(KEYS.kalemler) || VARSAYILAN_KALEMLER
}

export function kalemEkle(kalem) {
  const liste = kalemleriOku()
  const yeni = { ...kalem, id: kalem.id || `kalem_${Date.now()}`, sabit: false }
  yaz(KEYS.kalemler, [...liste, yeni])
  return yeni
}

export function kalemSil(id) {
  const liste = kalemleriOku().filter(k => k.sabit || k.id !== id)
  yaz(KEYS.kalemler, liste)
}

// ─── Hesaplamalar ────────────────────────────────────────────

export function firmaOzeti(firmaId, sezonId) {
  const hareketler = hareketleriOku(sezonId).filter(h => h.firma_id === firmaId)

  const gelenNakit = hareketler
    .filter(h => h.tur === 'nakit_avans')
    .reduce((t, h) => t + (h.tutar || 0), 0)

  const harcanan = hareketler
    .filter(h => h.tur === 'harcama' && h.kaynak === 'avans')
    .reduce((t, h) => t + (h.tutar || 0), 0)

  return {
    gelenNakit,
    harcanan,
    kalan: gelenNakit - harcanan,
  }
}

export function tarlaOzeti(tarlaId, sezonId) {
  const hareketler = hareketleriOku(sezonId).filter(h => h.tarla_id === tarlaId)

  const toplamGider = hareketler
    .filter(h => h.yon === 'gider')
    .reduce((t, h) => t + (h.tutar || 0), 0)

  const toplamGelir = hareketler
    .filter(h => h.yon === 'gelir')
    .reduce((t, h) => t + (h.tutar || 0), 0)

  return { toplamGider, toplamGelir, net: toplamGelir - toplamGider }
}

export function sezonOzeti(sezonId) {
  const hareketler = hareketleriOku(sezonId)

  const toplamGelir = hareketler
    .filter(h => h.yon === 'gelir')
    .reduce((t, h) => t + (h.tutar || 0), 0)

  const toplamGider = hareketler
    .filter(h => h.yon === 'gider')
    .reduce((t, h) => t + (h.tutar || 0), 0)

  return { toplamGelir, toplamGider, net: toplamGelir - toplamGider }
}
