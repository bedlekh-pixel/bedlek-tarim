export function paraBiçim(tutar, gosterSifir = true) {
  if (!tutar && !gosterSifir) return ''
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(tutar || 0)
}

export function sayiBiçim(sayi) {
  return new Intl.NumberFormat('tr-TR').format(sayi || 0)
}

export function tarihBiçim(tarih) {
  if (!tarih) return ''
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(tarih))
}

export function kisaTarih(tarih) {
  if (!tarih) return ''
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(tarih))
}

export function bugun() {
  return new Date().toISOString().split('T')[0]
}

export function whatsappMesaj(metin) {
  const url = `https://wa.me/?text=${encodeURIComponent(metin)}`
  window.open(url, '_blank')
}
