import * as XLSX from 'xlsx'
import { paraBiçim, tarihBiçim } from './format'

export function excelExport(veri, dosyaAdi = 'bedlek-tarim') {
  const wb = XLSX.utils.book_new()

  Object.entries(veri).forEach(([sayfa, satirlar]) => {
    const ws = XLSX.utils.json_to_sheet(satirlar)
    XLSX.utils.book_append_sheet(wb, ws, sayfa)
  })

  XLSX.writeFile(wb, `${dosyaAdi}.xlsx`)
}

export function hareketleriExcelExport(hareketler, tarlalar, firmalar, sezonAd) {
  const satirlar = hareketler.map(h => {
    const tarla = tarlalar.find(t => t.id === h.tarla_id)
    const firma = firmalar.find(f => f.id === h.firma_id)
    return {
      'Tarih': tarihBiçim(h.tarih),
      'Tür': h.tur,
      'Yön': h.yon === 'gelir' ? 'Gelir' : 'Gider',
      'Kalem': h.kalem,
      'Açıklama': h.aciklama,
      'Miktar': h.miktar,
      'Birim': h.birim,
      'Birim Fiyat': h.birim_fiyat,
      'Tutar (TL)': h.tutar,
      'Kaynak': h.kaynak === 'avans' ? 'Firma Avansı' : 'Kendi Cebi',
      'Tarla': tarla?.ad || '',
      'Firma': firma?.ad || '',
    }
  })

  excelExport({ [sezonAd]: satirlar }, `bedlek-tarim-${sezonAd}`)
}

export function whatsappOzet(ozet, sezonAd) {
  const metin = `🌾 *BEDEL TARIM — ${sezonAd}*\n\n` +
    `💚 Toplam Gelir: ${paraBiçim(ozet.toplamGelir)}\n` +
    `🔴 Toplam Gider: ${paraBiçim(ozet.toplamGider)}\n` +
    `📊 Net: ${paraBiçim(ozet.net)}\n\n` +
    `_Bedlek Tarım Uygulaması_`

  const url = `https://wa.me/?text=${encodeURIComponent(metin)}`
  window.open(url, '_blank')
}
