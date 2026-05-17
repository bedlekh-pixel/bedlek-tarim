import * as XLSX from 'xlsx'
import { paraBiçim, tarihBiçim } from './format'

function kitapOlustur(sayfalar) {
  const wb = XLSX.utils.book_new()
  Object.entries(sayfalar).forEach(([ad, satirlar]) => {
    const ws = XLSX.utils.json_to_sheet(satirlar)
    // Sütun genişlikleri
    const maxGenislik = Object.keys(satirlar[0] || {}).map(k => ({ wch: Math.max(k.length, 16) }))
    ws['!cols'] = maxGenislik
    XLSX.utils.book_append_sheet(wb, ws, ad)
  })
  return wb
}

function indir(wb, dosyaAdi) {
  XLSX.writeFile(wb, `${dosyaAdi}.xlsx`)
}

// ─── Modül exportları ─────────────────────────────────────────

export function hareketleriExcelExport(hareketler, tarlalar, firmalar, sezonAd) {
  const satirlar = hareketler.map(h => ({
    'Tarih': tarihBiçim(h.tarih),
    'Tür': h.tur,
    'Yön': h.yon === 'gelir' ? 'Gelir' : 'Gider',
    'Kalem': h.kalem || '',
    'Açıklama': h.aciklama || '',
    'Miktar': h.miktar || '',
    'Birim': h.birim || '',
    'Birim Fiyat (TL)': h.birim_fiyat || '',
    'Tutar (TL)': h.tutar || 0,
    'Kaynak': h.kaynak === 'avans' ? 'Firma Avansı' : 'Kendi Cebi',
    'Tarla': tarlalar.find(t => t.id === h.tarla_id)?.ad || '',
    'Firma': firmalar.find(f => f.id === h.firma_id)?.ad || '',
  }))
  indir(kitapOlustur({ [sezonAd]: satirlar }), `bedlek-hareketler-${sezonAd}`)
}

export function firmalarExcelExport(firmalar, hareketler, sezonAd) {
  const satirlar = firmalar.map(firma => {
    const fH = hareketler.filter(h => h.firma_id === firma.id)
    const gelenNakit = fH.filter(h => h.tur === 'nakit_avans').reduce((t, h) => t + (h.tutar || 0), 0)
    const harcanan = fH.filter(h => h.tur === 'harcama' && h.kaynak === 'avans').reduce((t, h) => t + (h.tutar || 0), 0)
    return {
      'Firma Adı': firma.ad || '',
      'Telefon': firma.telefon || '',
      'Gelen Nakit (TL)': gelenNakit,
      'Harcanan (TL)': harcanan,
      'Kalan Bakiye (TL)': gelenNakit - harcanan,
    }
  })
  indir(kitapOlustur({ 'Firmalar': satirlar }), `bedlek-firmalar-${sezonAd}`)
}

export function tarlalarExcelExport(tarlalar, hareketler, sezonAd) {
  const satirlar = tarlalar.map(tarla => {
    const tH = hareketler.filter(h => h.tarla_id === tarla.id)
    const gider = tH.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0)
    const gelir = tH.filter(h => h.yon === 'gelir').reduce((t, h) => t + (h.tutar || 0), 0)
    return {
      'Tarla Adı': tarla.ad || '',
      'Ürün': tarla.urun || '',
      'Dekar': tarla.dekar || 0,
      'Sahip': tarla.sahip || '',
      'Toplam Gider (TL)': gider,
      'Toplam Gelir (TL)': gelir,
      'Net (TL)': gelir - gider,
      'Dekar Başı Maliyet (TL)': tarla.dekar > 0 ? Math.round(gider / tarla.dekar) : 0,
    }
  })
  indir(kitapOlustur({ 'Tarlalar': satirlar }), `bedlek-tarlalar-${sezonAd}`)
}

export function kisilerExcelExport(kisiler, sezonAd) {
  const satirlar = kisiler.map(k => ({
    'Ad Soyad': k.ad || '',
    'Telefon': k.telefon || '',
    'Rol': k.rol || '',
    'Not': k.not || '',
  }))
  indir(kitapOlustur({ 'Kişiler': satirlar }), `bedlek-kisiler-${sezonAd}`)
}

export function kalemlerExcelExport(hareketler, sezonAd) {
  const kalemToplam = {}
  hareketler.filter(h => h.yon === 'gider').forEach(h => {
    const k = h.kalem || 'Diğer'
    kalemToplam[k] = (kalemToplam[k] || 0) + (h.tutar || 0)
  })
  const toplamGider = Object.values(kalemToplam).reduce((t, v) => t + v, 0)
  const satirlar = Object.entries(kalemToplam)
    .sort((a, b) => b[1] - a[1])
    .map(([kalem, tutar]) => ({
      'Kalem': kalem,
      'Toplam Gider (TL)': tutar,
      'Oran (%)': toplamGider > 0 ? +(tutar / toplamGider * 100).toFixed(1) : 0,
    }))
  indir(kitapOlustur({ 'Kalem Analizi': satirlar }), `bedlek-kalemler-${sezonAd}`)
}

// ─── Tam rapor (tüm modüller tek dosyada) ────────────────────

export function tamRaporExport(sezon, hareketler, firmalar, tarlalar, kisiler) {
  const ad = sezon?.ad || 'Sezon'

  const ozet = [{
    'Sezon': ad,
    'Toplam Gelir (TL)': hareketler.filter(h => h.yon === 'gelir').reduce((t, h) => t + (h.tutar || 0), 0),
    'Toplam Gider (TL)': hareketler.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0),
    'Net Kar/Zarar (TL)': hareketler.reduce((t, h) => t + (h.yon === 'gelir' ? 1 : -1) * (h.tutar || 0), 0),
    'Tarla Sayısı': tarlalar.length,
    'Firma Sayısı': firmalar.length,
    'Hareket Sayısı': hareketler.length,
  }]

  const hareketSatirlari = hareketler.map(h => ({
    'Tarih': tarihBiçim(h.tarih),
    'Tür': h.tur,
    'Yön': h.yon === 'gelir' ? 'Gelir' : 'Gider',
    'Kalem': h.kalem || '',
    'Açıklama': h.aciklama || '',
    'Tutar (TL)': h.tutar || 0,
    'Kaynak': h.kaynak === 'avans' ? 'Firma Avansı' : 'Kendi Cebi',
    'Tarla': tarlalar.find(t => t.id === h.tarla_id)?.ad || '',
    'Firma': firmalar.find(f => f.id === h.firma_id)?.ad || '',
  }))

  const firmaSatirlari = firmalar.map(firma => {
    const fH = hareketler.filter(h => h.firma_id === firma.id)
    const gelenNakit = fH.filter(h => h.tur === 'nakit_avans').reduce((t, h) => t + (h.tutar || 0), 0)
    const harcanan = fH.filter(h => h.tur === 'harcama' && h.kaynak === 'avans').reduce((t, h) => t + (h.tutar || 0), 0)
    return {
      'Firma Adı': firma.ad || '',
      'Telefon': firma.telefon || '',
      'Gelen Nakit (TL)': gelenNakit,
      'Harcanan (TL)': harcanan,
      'Kalan Bakiye (TL)': gelenNakit - harcanan,
    }
  })

  const tarlaSatirlari = tarlalar.map(tarla => {
    const tH = hareketler.filter(h => h.tarla_id === tarla.id)
    const gider = tH.filter(h => h.yon === 'gider').reduce((t, h) => t + (h.tutar || 0), 0)
    const gelir = tH.filter(h => h.yon === 'gelir').reduce((t, h) => t + (h.tutar || 0), 0)
    return {
      'Tarla Adı': tarla.ad || '',
      'Ürün': tarla.urun || '',
      'Dekar': tarla.dekar || 0,
      'Sahip': tarla.sahip || '',
      'Toplam Gider (TL)': gider,
      'Toplam Gelir (TL)': gelir,
      'Net (TL)': gelir - gider,
      'Dekar Başı Maliyet (TL)': tarla.dekar > 0 ? Math.round(gider / tarla.dekar) : 0,
    }
  })

  const kalemToplam = {}
  hareketler.filter(h => h.yon === 'gider').forEach(h => {
    const k = h.kalem || 'Diğer'
    kalemToplam[k] = (kalemToplam[k] || 0) + (h.tutar || 0)
  })
  const toplamGider = Object.values(kalemToplam).reduce((t, v) => t + v, 0)
  const kalemSatirlari = Object.entries(kalemToplam)
    .sort((a, b) => b[1] - a[1])
    .map(([kalem, tutar]) => ({
      'Kalem': kalem,
      'Toplam Gider (TL)': tutar,
      'Oran (%)': toplamGider > 0 ? +(tutar / toplamGider * 100).toFixed(1) : 0,
    }))

  const kisiSatirlari = kisiler.map(k => ({
    'Ad Soyad': k.ad || '',
    'Telefon': k.telefon || '',
    'Rol': k.rol || '',
    'Not': k.not || '',
  }))

  const sayfalar = {
    'Genel Özet': ozet,
    ...(hareketSatirlari.length > 0 && { 'Hareketler': hareketSatirlari }),
    ...(firmaSatirlari.length > 0 && { 'Firmalar': firmaSatirlari }),
    ...(tarlaSatirlari.length > 0 && { 'Tarlalar': tarlaSatirlari }),
    ...(kalemSatirlari.length > 0 && { 'Kalem Analizi': kalemSatirlari }),
    ...(kisiSatirlari.length > 0 && { 'Kişiler': kisiSatirlari }),
  }

  indir(kitapOlustur(sayfalar), `bedlek-tam-rapor-${ad}`)
}

export function whatsappOzet(ozet, sezonAd) {
  const metin = `🌾 *BEDEL TARIM — ${sezonAd}*\n\n` +
    `💚 Toplam Gelir: ${paraBiçim(ozet.toplamGelir)}\n` +
    `🔴 Toplam Gider: ${paraBiçim(ozet.toplamGider)}\n` +
    `📊 Net: ${paraBiçim(ozet.net)}\n\n` +
    `_Bedlek Tarım Uygulaması_`

  window.open(`https://wa.me/?text=${encodeURIComponent(metin)}`, '_blank')
}
