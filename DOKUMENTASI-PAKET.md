# 📋 Dokumentasi Paket — Undangan Digital

> **Versi:** 1.0  
> **Terakhir diperbarui:** 12 April 2026  
> **Author:** Avengers Team

---

## 📌 Ringkasan Paket

| | 🥉 Basic | 🥈 Premium | 🥇 Luxury |
|---|:---:|:---:|:---:|
| **Target Market** | Budget-friendly | Pasangan modern | Exclusive / VIP |
| **Harga (IDR)** | 50rb — 100rb | 150rb — 300rb | 350rb — 750rb |
| **Masa Aktif** | 3 Bulan | 6 Bulan | Selamanya |
| **Revisi** | 1x | 3x | Unlimited |
| **Tema Warna** | 1 (default) | 3-5 pilihan | Full custom |
| **Custom Domain** | ❌ | ❌ | ✅ (`.com` / `.id`) |

---

## 🥉 Paket BASIC

### Deskripsi
Paket hemat untuk pasangan yang butuh undangan digital **simpel, bersih, dan fungsional**. Cocok untuk acara kecil atau intimate wedding.

### Fitur yang Didapat

#### ✅ Halaman Undangan
| Fitur | Detail |
|---|---|
| Cover / Amplop | Tampilan cover dengan nama tamu dari URL (`?to=Nama`) |
| Info Mempelai | Nama & foto mempelai pria dan wanita |
| Waktu & Tempat | 1 card acara (Akad / Resepsi) + link Google Maps |
| Countdown Timer | Hitung mundur ke hari H |
| Ayat / Kutipan | 1 kutipan (Al-Quran / romantis) |
| Footer | Pesan penutup + nama mempelai |

#### ❌ Tidak Termasuk
- Background music
- Galeri foto (hanya foto profil mempelai)
- RSVP & Ucapan
- Amplop Digital
- Scroll animations (minimal)
- Admin Dashboard
- Guest link generator
- WhatsApp integration

### Struktur File
```
basic/
├── index.html          ← Halaman undangan
├── style.css           ← Styling (simplified)
├── script.js           ← Cover + Countdown + URL param only
└── assets/
    └── img/
        ├── groom.png
        └── bride.png
```

### Sections di `index.html`
```
1. [COVER]      → Nama tamu + Buka Undangan
2. [HERO]       → Nama mempelai + tanggal
3. [QUOTE]      → Ayat / kutipan
4. [COUNTDOWN]  → Hitung mundur
5. [COUPLE]     → Profil mempelai (foto + nama + orang tua)
6. [EVENT]      → 1x card waktu & tempat
7. [FOOTER]     → Pesan penutup
```

### JavaScript Modules (script.js)
```
- initGuestName()      → Baca URL param ?to=
- initCoverButton()    → Animasi buka amplop
- initCountdown()      → Timer ke hari H
- createPetals()       → Floating petals (simplified, 10 buah)
```

---

## 🥈 Paket PREMIUM

### Deskripsi
Paket **paling populer** dengan fitur lengkap: musik, galeri foto, RSVP + ucapan, dan amplop digital. Cocok untuk pasangan yang ingin kesan **modern dan interaktif**.

### Fitur yang Didapat

#### ✅ Semua fitur Basic, PLUS:
| Fitur | Detail |
|---|---|
| Background Music | Auto-play saat buka undangan + toggle button |
| Galeri Foto | Grid 5-10 foto prewedding / wedding |
| RSVP Form | Konfirmasi kehadiran (Hadir / Tidak Hadir) + jumlah tamu |
| Ucapan & Doa Wall | Tampilan ucapan dari tamu (localStorage) |
| Amplop Digital | 2 rekening bank + tombol copy |
| Scroll Animations | Reveal animation per section (Intersection Observer) |
| Event Cards | 2 card terpisah (Akad Nikah + Resepsi) |
| Floating Petals | Animasi kelopak bunga di cover (20 buah) |

#### ❌ Tidak Termasuk
- Admin Dashboard
- Guest management & link generator
- WhatsApp broadcast
- Export CSV
- Love Story Timeline
- QR Code
- Save to Calendar
- Lightbox Gallery
- Custom domain

### Struktur File
```
premium/
├── index.html          ← Halaman undangan (full sections)
├── style.css           ← Full styling + animations
├── script.js           ← All interactive features
└── assets/
    └── img/
        ├── groom.png
        ├── bride.png
        ├── gallery-1.png
        ├── gallery-2.png
        ├── gallery-3.png
        ├── gallery-4.png
        └── gallery-5.png
```

### Sections di `index.html`
```
1.  [COVER]      → Nama tamu + Buka Undangan + Petals
2.  [HERO]       → Nama mempelai + tanggal
3.  [QUOTE]      → Ayat / kutipan
4.  [COUNTDOWN]  → Hitung mundur
5.  [COUPLE]     → Profil mempelai (foto + nama + orang tua + IG)
6.  [EVENT]      → 2x card (Akad + Resepsi) + Google Maps
7.  [GALLERY]    → Grid foto (5-10 foto)
8.  [RSVP]       → Form konfirmasi kehadiran
9.  [WISHES]     → Wall ucapan & doa
10. [GIFT]       → Amplop digital (2 rekening)
11. [FOOTER]     → Pesan penutup + hashtag
```

### JavaScript Modules (script.js)
```
- initGuestName()       → Baca URL param ?to=
- initCoverButton()     → Animasi buka amplop + play music
- playMusic()           → Auto-play background music
- initMusicToggle()     → Toggle play/pause
- initCountdown()       → Timer ke hari H
- initScrollReveal()    → Intersection Observer animations
- initRSVPForm()        → Submit RSVP → localStorage
- loadWishes()          → Render ucapan dari localStorage
- initCopyButtons()     → Copy nomor rekening
- showToast()           → Notifikasi popup
- createPetals()        → Floating petals animation
```

---

## 🥇 Paket LUXURY

### Deskripsi
Paket **all-in-one premium** dengan Admin Dashboard lengkap, guest management, WhatsApp integration, dan fitur eksklusif lainnya. Cocok untuk pasangan yang ingin pengalaman **VIP & profesional**.

### Fitur yang Didapat

#### ✅ Semua fitur Premium, PLUS:
| Fitur | Detail |
|---|---|
| 🖥️ Admin Dashboard | Panel admin untuk kelola semua aspek undangan |
| ✏️ Edit Info Pernikahan | Ubah nama, tanggal, lokasi, bank, dll dari dashboard |
| 👥 Guest Management | Tambah/hapus tamu + auto-generate link per tamu |
| 🔗 Link Generator | Otomatis buat link `?to=Nama+Tamu` per orang |
| 💬 WhatsApp Share | Tombol kirim undangan via WA per tamu (deep link) |
| 📥 Export CSV | Download daftar tamu & data RSVP sebagai CSV |
| 📊 Dashboard Stats | Statistik: total tamu, hadir, tidak hadir, ucapan masuk |
| 🗑️ Moderasi Ucapan | Hapus ucapan spam / tidak pantas dari dashboard |
| 🖼️ Gallery Management | Tambah / hapus foto galeri dari dashboard |
| 💕 Love Story Timeline | Section cerita perjalanan cinta (milestone) |
| 📱 QR Code Generator | QR Code per tamu (untuk undangan fisik) |
| 📅 Save to Calendar | Tombol "Add to Google Calendar" |
| 🔍 Lightbox Gallery | Klik foto → zoom fullscreen + navigasi |
| 🎥 Video / Live Stream | Embed YouTube / Zoom link untuk tamu online |
| 🎨 Custom Theme | Warna & font bisa di-custom dari admin |
| 🌐 Custom Domain | Deploy ke domain pilihan (e.g. `arya-kiara.com`) |
| ♾️ Masa Aktif | Selamanya (tidak expired) |

### Struktur File
```
luxury/
├── index.html          ← Halaman undangan (full sections + luxury features)
├── style.css           ← Full styling + advanced animations
├── script.js           ← All features + dynamic settings dari admin
├── admin.html          ← Admin Dashboard
├── admin.css           ← Styling admin panel
├── admin.js            ← Logic admin (CRUD, export, dll)
└── assets/
    └── img/
        ├── groom.png
        ├── bride.png
        ├── gallery-1.png
        ├── gallery-2.png
        ├── gallery-3.png
        ├── gallery-4.png
        └── gallery-5.png
```

### Sections di `index.html`
```
1.  [COVER]          → Nama tamu + Buka Undangan + Petals (advanced)
2.  [HERO]           → Nama mempelai + tanggal (parallax effect)
3.  [QUOTE]          → Ayat / kutipan (dynamic dari admin)
4.  [COUNTDOWN]      → Hitung mundur (dynamic dari admin)
5.  [COUPLE]         → Profil mempelai (dynamic dari admin)
6.  [LOVE STORY]     → Timeline perjalanan cinta ★ LUXURY ONLY
7.  [EVENT]          → 2x card (Akad + Resepsi) + Maps (dynamic)
8.  [GALLERY]        → Grid foto + Lightbox zoom ★ LUXURY ONLY
9.  [VIDEO]          → Embed video / live stream ★ LUXURY ONLY
10. [RSVP]           → Form konfirmasi kehadiran
11. [WISHES]         → Wall ucapan & doa
12. [GIFT]           → Amplop digital (dynamic dari admin)
13. [CALENDAR]       → Save the Date button ★ LUXURY ONLY
14. [FOOTER]         → Pesan penutup + hashtag (dynamic)
```

### Admin Dashboard Panels (admin.html)
```
1. [DASHBOARD]       → Stats overview + ucapan terbaru
2. [INFO PERNIKAHAN] → Edit semua detail (mempelai, acara, bank, quote, hashtag)
3. [DAFTAR TAMU]     → CRUD tamu + link generator + WA share + export CSV
4. [RSVP]            → Tabel data RSVP + export CSV
5. [UCAPAN]          → Moderasi ucapan (hapus individual / semua)
6. [GALERI]          → Tambah/hapus foto via URL + reorder
7. [LOVE STORY]      → Kelola milestone cerita cinta ★ LUXURY ONLY
8. [PENGATURAN]      → Tema warna, font, custom domain ★ LUXURY ONLY
```

### JavaScript Modules — Undangan (script.js)
```
Semua module dari Premium, PLUS:
- applyDynamicSettings()  → Baca wedding_settings dari localStorage (dari admin)
- loadDynamicGallery()    → Render galeri dari admin data
- initLightbox()          → Lightbox zoom untuk galeri ★ LUXURY
- initLoveStory()         → Render timeline love story ★ LUXURY
- initCalendar()          → Generate Google Calendar link ★ LUXURY
- initCountdown()         → Dynamic date dari admin settings
```

### JavaScript Modules — Admin (admin.js)
```
- initNavigation()        → Sidebar tab switching
- initSidebar()           → Mobile responsive sidebar
- loadDashboard()         → Stats + recent wishes
- initWeddingInfoForm()   → Load/save wedding settings ke localStorage
- initGuestManagement()   → CRUD tamu, generate links, WA deep links
- loadRSVPTable()         → Render RSVP data table
- initWishesManagement()  → Moderasi ucapan (delete individual/all)
- initGalleryManagement() → CRUD foto galeri via modal
- exportGuestsCSV()       → Download daftar tamu sebagai CSV
- downloadCSV()           → Helper CSV download
- copyLink()              → Copy link undangan ke clipboard
```

---

## 🔄 Data Flow (localStorage)

### Keys yang Digunakan
| Key | Deskripsi | Dipakai di Paket |
|---|---|---|
| `wedding_settings` | Semua info pernikahan (nama, tanggal, lokasi, bank, dll) | Luxury |
| `wedding_guests` | Daftar tamu undangan | Luxury |
| `wedding_wishes` | Data RSVP + ucapan dari tamu | Premium, Luxury |
| `wedding_gallery` | Data foto galeri | Luxury |

### Alur Data
```
┌─────────────────────┐     localStorage      ┌─────────────────────┐
│                     │ ◄──────────────────── │                     │
│   index.html        │    wedding_settings    │   admin.html        │
│   (Halaman Tamu)    │    wedding_gallery     │   (Admin Panel)     │
│                     │ ────────────────────► │                     │
│                     │    wedding_wishes      │                     │
└─────────────────────┘                        └─────────────────────┘

Tamu input RSVP ──► wedding_wishes ──► Admin bisa lihat di Dashboard
Admin edit info  ──► wedding_settings ──► Undangan otomatis update
Admin edit galeri──► wedding_gallery  ──► Galeri undangan update
```

---

## 🎨 Design System

### Color Palette (Default — Sage Green & Gold)
```css
--bg-primary:      #FDF8F0   /* Warm Cream */
--bg-secondary:    #F5EDE1   /* Light Beige */
--bg-dark:         #3D3229   /* Dark Brown */
--color-primary:   #7B8E6D   /* Sage Green */
--color-accent:    #C4A55A   /* Muted Gold */
--color-text:      #3D3229   /* Dark Brown */
--color-text-light:#8B7D6B   /* Medium Brown */
```

### Typography
```
- Script/Cursive : Great Vibes (nama mempelai)
- Serif/Heading  : Cormorant Garamond (judul section)
- Sans/Body      : Montserrat (body text, form, button)
```

### Tema Warna Alternatif (Premium & Luxury)
| Tema | Primary | Accent | Background |
|---|---|---|---|
| 🌿 Sage Green (Default) | `#7B8E6D` | `#C4A55A` | `#FDF8F0` |
| 🌸 Rose Pink | `#C4727F` | `#D4A574` | `#FFF5F5` |
| 🌊 Dusty Blue | `#6B8EA6` | `#C4A55A` | `#F5F8FC` |
| 🌑 Dark Elegant | `#8B7D6B` | `#C4A55A` | `#1A1614` |
| 💜 Lavender | `#8B7BAE` | `#C9A96E` | `#F8F5FC` |

---

## 🚀 Status Pengembangan

### ✅ Sudah Selesai (Current Build)
- [x] Cover + nama tamu dari URL parameter
- [x] Hero section + countdown timer
- [x] Ayat / Quote section
- [x] Profil mempelai + foto AI-generated
- [x] Event cards (Akad + Resepsi) + Google Maps
- [x] Galeri foto (5 foto)
- [x] Background music + toggle
- [x] RSVP form + localStorage
- [x] Ucapan & Doa wall
- [x] Amplop Digital + copy rekening
- [x] Scroll reveal animations
- [x] Floating petals animation
- [x] Admin Dashboard (full panel)
- [x] Guest management + link generator
- [x] WhatsApp share per tamu
- [x] Export CSV (tamu + RSVP)
- [x] Moderasi ucapan
- [x] Gallery management
- [x] Dynamic settings (admin ↔ undangan)

### 🔲 Belum Dikerjakan (Luxury Extras)
- [ ] Love Story Timeline
- [ ] QR Code Generator
- [ ] Save to Google Calendar
- [ ] Lightbox Gallery (klik zoom)
- [ ] Video / Live Stream embed
- [ ] Custom theme color dari admin
- [ ] Custom domain setup guide
- [ ] Multi-bahasa (ID / EN)

---

## 📝 Catatan Teknis

### Deployment
- **Development:** Gunakan local server (`npx http-server ./ -p 8090`)
- **Production:** Deploy ke Netlify / Vercel / GitHub Pages
- **Penting:** Admin dan undangan HARUS di-serve dari **domain/origin yang sama** agar localStorage bisa sinkron.

### Browser Support
- Chrome 80+
- Firefox 78+
- Safari 14+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Android)

### Performance
- Mobile-first responsive design
- Lazy loading images (`loading="lazy"`)
- CSS-only animations (no heavy JS libraries)
- Single page = fast load time
- No external dependencies (kecuali Google Fonts)

---

> 📄 *Dokumen ini adalah panduan internal untuk pengembangan produk Undangan Digital.*  
> *Untuk pertanyaan, hubungi tim development.*
