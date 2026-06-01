import { dbSyncFromCloud } from './db'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/drive.file'
const FOLDER_NAME = 'Bedlek Tarım Yedekler'
const KEYS = [
  'bt_firmalar', 'bt_tarlalar', 'bt_hareketler', 'bt_kisiler',
  'bt_sezonlar', 'bt_kalemler', 'bt_ayarlar',
  'bt_isci_gruplari', 'bt_iscilik_kayitlari', 'bt_urunler',
]

let tokenClient = null
let accessToken = null

export function gdriveKurulu() {
  return !!CLIENT_ID
}

export function gdriveBaslat() {
  if (!CLIENT_ID || !window.google) return
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: () => {},
  })
}

export function sonYedekZamani() {
  return localStorage.getItem('bt_son_yedek')
}

export async function gdriveYedekle() {
  if (!CLIENT_ID) throw new Error('Google Client ID tanımlı değil')
  if (!window.google) throw new Error('Google API yüklenemedi')
  if (!tokenClient) gdriveBaslat()

  await new Promise((resolve, reject) => {
    tokenClient.callback = (res) => {
      if (res.error) { reject(new Error(res.error)); return }
      accessToken = res.access_token
      resolve()
    }
    tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' })
  })

  await dbSyncFromCloud()
  const folderId = await klasorBulVeyaOlustur()
  await yukleme(folderId)
  localStorage.setItem('bt_son_yedek', new Date().toISOString())
}

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${accessToken}`, ...opts.headers },
  })
  return res.json()
}

async function klasorBulVeyaOlustur() {
  const q = encodeURIComponent(
    `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  )
  const data = await apiFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`)
  if (data.files?.length > 0) return data.files[0].id

  const yeni = await apiFetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  })
  return yeni.id
}

async function yukleme(folderId) {
  const veri = {}
  KEYS.forEach(key => {
    const val = localStorage.getItem(key)
    if (val) veri[key] = JSON.parse(val)
  })

  const tarih = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')
  const dosyaAdi = `bedlek-tarim-yedek-${tarih}.json`
  const icerik = JSON.stringify(veri, null, 2)

  const metadata = JSON.stringify({ name: dosyaAdi, parents: [folderId] })
  const form = new FormData()
  form.append('metadata', new Blob([metadata], { type: 'application/json' }))
  form.append('file', new Blob([icerik], { type: 'application/json' }))

  await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  })
}
