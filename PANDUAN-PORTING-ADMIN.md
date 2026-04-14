# Panduan Porting `admin.js` ke Desain Baru

Dokumen ini menjelaskan cara menyalin `admin.js` ke proyek undangan lain dengan desain berbeda, beserta bagian mana yang aman dicopy langsung dan mana yang perlu disesuaikan.

---

## ✅ Bagian yang AMAN di-copy langsung

Bagian-bagian berikut bersifat **universal** — tidak terikat ke desain maupun tampilan tertentu:

| Fungsi / Bagian | Keterangan |
|---|---|
| Supabase connection (`SUPABASE_URL`, `SUPABASE_KEY`) | Koneksi ke database yang sama |
| `fetchCloudData()` | Mengambil semua data klien dari Supabase |
| `setData()` / `getData()` | Jembatan baca/tulis data universal |
| `domain_origin` tracking | Otomatis catat domain website admin dibuka |
| Manajemen tamu (Guest Management) | Logic tambah, hapus, generate link tamu |
| Manajemen ucapan/RSVP | Logic moderasi, filter, hapus ucapan |
| Manajemen galeri | Logic tambah/hapus foto via URL |
| Manajemen cerita cinta (Story) | Logic CRUD timeline |
| Generate link `wa.me/...` | Format pesan WhatsApp ke tamu |
| Export CSV | Download data tamu & RSVP |
| `showToast()` | Notifikasi popup |

---

## ⚠️ Bagian yang PERLU disesuaikan

### 1. `getDefaultSettings()` — Data placeholder default

Letak: sekitar baris `292`

Ubah sesuai tema baru:
- Nama pasangan placeholder (groom, bride)
- Nama venue akad & resepsi default
- Nama bank & nomor rekening placeholder
- Quote dan hashtag default
- URL foto placeholder

```js
// Contoh yang perlu diubah:
groomName: 'Arya Pratama, S.T.',   // ← sesuaikan
akadVenue: 'Masjid Istiqlal',      // ← sesuaikan
bank1Name: 'Bank BCA',             // ← sesuaikan
```

---

### 2. `getDefaultGallery()` — Foto galeri placeholder

Letak: sekitar baris `787`

Pastikan path foto default ada di folder desain baru:
```js
{ id: 1, url: 'assets/img/gallery-1.png', ... }
// ↑ Pastikan file ini ada di folder desain baru
```

Kalau tidak ada, ganti dengan URL foto online, atau kosongkan arraynya:
```js
function getDefaultGallery() {
    return []; // Kosong, admin isi sendiri nanti
}
```

---

### 3. `getDefaultStory()` — Cerita cinta placeholder

Letak: sekitar baris `639`

Bisa dikosongkan atau diubah judulnya:
```js
function getDefaultStory() {
    return []; // Kosong, admin isi sendiri nanti
}
```

---

### 4. `getBaseUrl()` — Path ke `index.html`

Letak: sekitar baris `172`

```js
function getBaseUrl() {
    const loc = window.location;
    const path = loc.pathname.replace(/admin\.html.*$/, 'index.html');
    return `${loc.origin}${path}`;
}
```

> **Perlu diubah hanya jika** nama file admin atau undangan bukan `admin.html` / `index.html`. Kalau nama filenya sama, biarkan saja.

---

## 🔴 Syarat Wajib: ID HTML harus cocok

`admin.js` bekerja dengan cara mencari elemen HTML berdasarkan **`id`**. Jika `admin.html` desain baru menggunakan ID yang berbeda, JavaScript akan error.

Berikut daftar ID kritis yang **harus ada** di `admin.html` desain baru:

### Form Info Pernikahan
```
wiGroomName, wiGroomOrder, wiGroomFather, wiGroomMother
wiGroomIg, wiGroomPhoto, wiBrideName, wiBrideOrder
wiBrideFather, wiBrideMother, wiBrideIg, wiBridePhoto
wiAkadDate, wiAkadTime, wiAkadVenue, wiAkadAddress, wiAkadMap
wiResepsiDate, wiResepsiTime, wiResepsiVenue, wiResepsiAddress, wiResepsiMap
wiBank1Name, wiBank1Number, wiBank1Holder
wiBank2Name, wiBank2Number, wiBank2Holder
wiQuoteText, wiQuoteSource, wiHashtag, wiMusicUrl
btnSaveWedding
```

### Tamu
```
addGuestName, addGuestPhone, btnAddGuest, btnExportGuests
guestTableBody, guestCount
```

### RSVP & Ucapan
```
rsvpTableBody, btnExportRsvp
wishesAdminList, wishCount, btnClearAllWishes
```

### Galeri
```
galleryAdminGrid, btnAddPhoto
photoModal, modalPhotoUrl, modalPhotoAlt
btnCancelPhoto, btnConfirmPhoto
```

### Story / Cerita Cinta
```
storyAdminList, btnAddStory
storyModal, modalStoryYear, modalStoryTitle, modalStoryDesc
btnCancelStory, btnConfirmStory
```

### Dashboard & Navigasi
```
statTotalGuests, statConfirmed, statDeclined, statWishes
recentWishesBody, pageTitle, pageSubtitle
sidebarToggle, sidebarOverlay, sidebar
sidebarPreviewLink, headerPreviewLink
adminToast
```

---

## 📋 Checklist Porting

Sebelum deploy desain baru, pastikan semua ini sudah dicek:

- [ ] Semua ID HTML di atas ada di `admin.html` desain baru
- [ ] `getDefaultSettings()` sudah diubah sesuai tema baru
- [ ] `getDefaultGallery()` sudah dicek (path foto ada atau dikosongkan)
- [ ] `SUPABASE_URL` dan `SUPABASE_KEY` sudah diisi (bisa pakai yang sama)
- [ ] Kolom `domain_origin` sudah ada di tabel Supabase (jalankan SQL di bawah)

### SQL untuk tambah kolom `domain_origin` (jika belum ada):
```sql
ALTER TABLE wedding_invitations
ADD COLUMN IF NOT EXISTS domain_origin TEXT;
```

---

## 💡 Tips

- Satu tabel Supabase bisa dipakai oleh **banyak domain berbeda** sekaligus. Sistem akan otomatis membedakannya via `client_id` dan `domain_origin`.
- Kalau desain baru punya fitur tambahan (misal: countdown berbeda, section baru), tambahkan field baru di `getDefaultSettings()` dan handle di `admin.js` terpisah — jangan hapus field yang sudah ada agar data klien lama tidak rusak.
