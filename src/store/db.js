// Veri katmanı — okuma localStorage'dan (anlık), yazma localStorage + Supabase'e (kalıcı)

import { supabase } from './supabase'

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

// ─── localStorage ────────────────────────────────────────────

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

// ─── Supabase sync ───────────────────────────────────────────

async function bulutaYaz(key, veri) {
  try {
    await supabase
      .from('store')
      .upsert({ key, value: veri, guncelleme: new Date().toISOString() })
  } catch {
    // Supabase yazma başarısız — localStorage'daki veri korunur
  }
}

async function buluttanOku(key) {
  try {
    const { data } = await supabase
      .from('store')
      .select('value')
      .eq('key', key)
      .single()
    return data?.value ?? null
  } catch {
    return null
  }
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

// Buluttan çek, localStorage'ı güncelle
export async function dbSyncFromCloud() {
  const tumKeyler = Object.values(KEYS)
  const sonuclar = await Promise.all(tumKeyler.map(key => buluttanOku(key)))

  tumKeyler.forEach((key, i) => {
    const cloudVeri = sonuclar[i]
    if (cloudVeri !== null) {
      yaz(key, cloudVeri)
    }
  })
}

// ─── İşçi Grupları ───────────────────────────────────────────

export function isciGruplariniOku() {
  return oku(KEYS.isci_gruplari) || []
}

export function isciGrubuEkle(grup) {
  const liste = isciGruplariniOku()
  const yeni = { ...grup, id: grup.id || `grup_${Date.now()}`, aktif: true }
  const guncelliste = [...liste, yeni]
  yaz(KEYS.isci_gruplari, guncelliste)
  bulutaYaz(KEYS.isci_gruplari, guncelliste)
  return yeni
}

export function isciGrubuDuzenle(id, degisiklikler) {
  const liste = isciGruplariniOku().map(g => g.id === id ? { ...g, ...degisiklikler } : g)
  yaz(KEYS.isci_gruplari, liste)
  bulutaYaz(KEYS.isci_gruplari, liste)
}

export function isciGrubuSil(id) {
  const liste = isciGruplariniOku().filter(g => g.id !== id)
  yaz(KEYS.isci_gruplari, liste)
  bulutaYaz(KEYS.isci_gruplari, liste)
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
  const guncelliste = [...liste, yeni]
  yaz(KEYS.iscilik_kayitlari, guncelliste)
  bulutaYaz(KEYS.iscilik_kayitlari, guncelliste)
  return yeni
}

export function iscilikKaydiDuzenle(id, degisiklikler) {
  const liste = (oku(KEYS.iscilik_kayitlari) || []).map(k =>
    k.id === id ? { ...k, ...degisiklikler } : k
  )
  yaz(KEYS.iscilik_kayitlari, liste)
  bulutaYaz(KEYS.iscilik_kayitlari, liste)
}

export function iscilikKaydiSil(id) {
  const liste = (oku(KEYS.iscilik_kayitlari) || []).filter(k => k.id !== id)
  yaz(KEYS.iscilik_kayitlari, liste)
  bulutaYaz(KEYS.iscilik_kayitlari, liste)
}

// ─── Ayarlar ─────────────────────────────────────────────────

export function ayarlariOku() {
  return oku(KEYS.ayarlar) || { aktifSezon: new Date().getFullYear().toString() }
}

export function aktifSezonu(sezonId) {
  const ayarlar = { ...ayarlariOku(), aktifSezon: sezonId }
  yaz(KEYS.ayarlar, ayarlar)
  bulutaYaz(KEYS.ayarlar, ayarlar)
}

// ─── Sezonlar ────────────────────────────────────────────────

export function sezonlariOku() {
  return oku(KEYS.sezonlar) || []
}

export function sezonEkle(sezon) {
  const liste = sezonlariOku()
  const yeni = { ...sezon, id: sezon.id || Date.now().toString() }
  const guncelliste = [...liste, yeni]
  yaz(KEYS.sezonlar, guncelliste)
  bulutaYaz(KEYS.sezonlar, guncelliste)
  return yeni
}

export function sezonSil(id) {
  const liste = sezonlariOku().filter(s => s.id !== id)
  yaz(KEYS.sezonlar, liste)
  bulutaYaz(KEYS.sezonlar, liste)
}

// ─── Firmalar ────────────────────────────────────────────────

export function firmalariOku() {
  return oku(KEYS.firmalar) || []
}

export function firmaEkle(firma) {
  const liste = firmalariOku()
  const yeni = { ...firma, id: firma.id || `firma_${Date.now()}`, aktif: true }
  const guncelliste = [...liste, yeni]
  yaz(KEYS.firmalar, guncelliste)
  bulutaYaz(KEYS.firmalar, guncelliste)
  return yeni
}

export function firmaDuzenle(id, degisiklikler) {
  const liste = firmalariOku().map(f => f.id === id ? { ...f, ...degisiklikler } : f)
  yaz(KEYS.firmalar, liste)
  bulutaYaz(KEYS.firmalar, liste)
}

export function firmaSil(id) {
  const liste = firmalariOku().filter(f => f.id !== id)
  yaz(KEYS.firmalar, liste)
  bulutaYaz(KEYS.firmalar, liste)
}

// ─── Tarlalar ────────────────────────────────────────────────

export function tarlalariOku() {
  return oku(KEYS.tarlalar) || []
}

export function tarlaEkle(tarla) {
  const liste = tarlalariOku()
  const yeni = { ...tarla, id: tarla.id || `tarla_${Date.now()}` }
  const guncelliste = [...liste, yeni]
  yaz(KEYS.tarlalar, guncelliste)
  bulutaYaz(KEYS.tarlalar, guncelliste)
  return yeni
}

export function tarlaDuzenle(id, degisiklikler) {
  const liste = tarlalariOku().map(t => t.id === id ? { ...t, ...degisiklikler } : t)
  yaz(KEYS.tarlalar, liste)
  bulutaYaz(KEYS.tarlalar, liste)
}

export function tarlaSil(id) {
  const liste = tarlalariOku().filter(t => t.id !== id)
  yaz(KEYS.tarlalar, liste)
  bulutaYaz(KEYS.tarlalar, liste)
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
  const guncelliste = [...liste, yeni]
  yaz(KEYS.hareketler, guncelliste)
  bulutaYaz(KEYS.hareketler, guncelliste)
  return yeni
}

export function hareketDuzenle(id, degisiklikler) {
  const liste = (oku(KEYS.hareketler) || []).map(h =>
    h.id === id ? { ...h, ...degisiklikler } : h
  )
  yaz(KEYS.hareketler, liste)
  bulutaYaz(KEYS.hareketler, liste)
}

export function hareketSil(id) {
  const liste = (oku(KEYS.hareketler) || []).filter(h => h.id !== id)
  yaz(KEYS.hareketler, liste)
  bulutaYaz(KEYS.hareketler, liste)
}

// ─── Kişiler ─────────────────────────────────────────────────

export function kisileriOku() {
  return oku(KEYS.kisiler) || []
}

export function kisiEkle(kisi) {
  const liste = kisileriOku()
  const yeni = { ...kisi, id: kisi.id || `kisi_${Date.now()}`, aktif: true }
  const guncelliste = [...liste, yeni]
  yaz(KEYS.kisiler, guncelliste)
  bulutaYaz(KEYS.kisiler, guncelliste)
  return yeni
}

export function kisiDuzenle(id, degisiklikler) {
  const liste = kisileriOku().map(k => k.id === id ? { ...k, ...degisiklikler } : k)
  yaz(KEYS.kisiler, liste)
  bulutaYaz(KEYS.kisiler, liste)
}

export function kisiSil(id) {
  const liste = kisileriOku().filter(k => k.id !== id)
  yaz(KEYS.kisiler, liste)
  bulutaYaz(KEYS.kisiler, liste)
}

// ─── Kalemler ────────────────────────────────────────────────

export function kalemleriOku() {
  return oku(KEYS.kalemler) || VARSAYILAN_KALEMLER
}

export function kalemEkle(kalem) {
  const liste = kalemleriOku()
  const yeni = { ...kalem, id: kalem.id || `kalem_${Date.now()}`, sabit: false }
  const guncelliste = [...liste, yeni]
  yaz(KEYS.kalemler, guncelliste)
  bulutaYaz(KEYS.kalemler, guncelliste)
  return yeni
}

export function kalemSil(id) {
  const liste = kalemleriOku().filter(k => k.sabit || k.id !== id)
  yaz(KEYS.kalemler, liste)
  bulutaYaz(KEYS.kalemler, liste)
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

  return { gelenNakit, harcanan, kalan: gelenNakit - harcanan }
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
