# Panduan Pembuatan Tema / Desain Baru

Dokumentasi ini ditujukan bagi *Frontend Developer* atau Desainer yang ingin membuat tampilan (tema) undangan baru tanpa merusak integrasi dengan Dashboard Admin dan Database (Supabase) yang sudah berjalan.

Sistem undangan yang kita buat memisahkan antara **Data (Logika)** pada `script.js` dan **Tampilan (Desain)** yang ada pada `index.html` dan `style.css`. Ini artinya Anda bisa membuat template HTML/CSS apapun secara bebas.

## Prinsip Dasar
1. **Area Backend Aman:** Anda tidak perlu dan **jangan mengubah** file `admin.html`, `admin.css`, maupun `admin.js`. Sistem admin bersifat universal dan mengendalikan semua template klien manapun via integrasi Supabase.
2. **Desain Bebas:** Kreasikan layout Anda sesuka hati di dalam `index.html` dan `style.css` yang baru. 
3. **Sistem *Hooking*:** Agar data seperti "Nama Mempelai" atau "Ucapan Tamu" bisa muncul di desain baru Anda, Anda hanya perlu menambahkan atribut **ID** atau **Class** HTML yang sama pada elemen penampungnya. `script.js` lalu akan secara otomatis mendeteksi tanda tangan ini dan "menyuntikkan" data yang relevan dari *database*.

---

## Langkah-langkah Integrasi Tema Baru

### 1. Daftarkan Script Engine
Di file `index.html` tema baru Anda, pastikan Anda menempatkan tag pemanggil skrip berikut tepat di atas tag penutup `</body>`:

```html
<!-- SDK Supabase (Wajib agar bisa memuat data dari Cloud) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<!-- Logika Front-End Undangan (Sistem Inject Layout) -->
<script src="script.js"></script>
```

### 2. Kamus "Hooks" (Daftar Class & ID)
Gunakan tabel di bawah ini sebagai pedoman ("kamus"). Apabila Anda ingin elemen desain Anda otomatis berubah menyesuaikan data milik klien, pakaikan *Class* atau *ID* ini ke elemen terkait.

*(Penting: Apabila ada fitur - misalnya Love Story - yang tidak ada di tema desain Anda, abaikan saja. Jangan buat pembungkus/div-nya. Sistem tidak akan error dan akan melanjutkan instruksi lain.)*

#### A. Label Teks & Nama Mempelai
| Target Data | Selector (Class/ID) | Tag yang Disarankan | Keterangan / Contoh |
|-------------|--------------------|-------------------------|------------|
| Panggilan Tamu Undangan | `id="guestName"` | `<span>` atau `<p>` | Menyapa secara otomatis (Dari parameter URL `?to=...`) |
| Nama Panggilan Mempelai | `.hero-full-names` | `<h1>`, `<div>` | Akan di-inject sbb: `Arya <br>&amp;<br> Kiara` |
| Judul Pendek Acara/Cover | `.cover-names`, `.footer-names`| `<h1>`, `<p>` | Teks inisial atau "Arya & Kiara" di sampul |
| Kutipan (Quotes) Romantis | `.luxury-quote` | `<p>`, `<blockquote>` | Teks kutipan/ayat |
| Sumber Ayat/Kutipan | `.luxury-cite` | `<span>`, `<cite>` | Sumber kalimat tersebut |
| Hashtag Acara | `.footer-hashtag` | `<span>` | Menampilkan `#AryaKiara2026` |

#### B. Profil Mempelai (Cards)
Elemen *Couple/Profile* sangat bergantung pada letak (urutan) di HTML. Kartu HTML yang berada di atas akan dianggap Mempelai Pria, kartu HTML di urutan kedua adalah Wanita.

* **Urutan 1 (Mempelai Pria)**
  * Selimuti atau gunakan class `.couple-card h3` untuk Nama Panjang Pria.
  * Gunakan class `.couple-desc` untuk teks Info Orang tua.
  * Pasang elemen `<img>` di dalam div/container berkelas `.couple-photo-frame`. Atribut foto (*src*) akan berubah otomatis.
  * Pasang class `.couple-ig` untuk mencetak *username* Instagram Pria.
* **Urutan 2 (Mempelai Wanita)**
  * Ikuti persis logika di atas, namun diterapkan pada kontainer profil mempelai wanita (urutan kedua di kodingan HTML).

#### C. Detail Acara (Event Boxes)
Ketentuannya hampir sama dengan bagian Profil. Box acara yang pertama di HTML adalah **Akad**, yang kedua adalah **Resepsi**. Keduanya harus mempunyai kelas `.event-box`.

Di dalam *masing-masing* pembungkus acara/`.event-box` tersebut:
| Target Data | Selector (Class/ID) | Tag yang Terikat |
|-------------|---------------------|------------------|
| Jam Rangkaian | `.event-time` | `<p>` |
| Info & Lokasi Tempat | `.event-location` | `<p>` Menginjeksi html utuh + alamat |
| Tautan Rute Map | `.btn-luxury-outline` | `<a>` Mengganti `href="URL"` |

*Catatan: Jika ada baris tanggal general di cover, cukup pakaikan kelas `.hero-date` atau `.event-day`.*

#### D. Penghitung Mundur (Countdown Timer)
Buat teks statis (teks dummy di HTML Anda), lalu bubuhkan **ID** berikut persis pada elemen penampung angkanya:
* Sisa Hari $\rightarrow$ `id="cd-days"`
* Sisa Jam $\rightarrow$ `id="cd-hours"`
* Sisa Menit $\rightarrow$ `id="cd-minutes"`
* Sisa Detik $\rightarrow$ `id="cd-seconds"`

#### E. Formulir RSVP & Kotak Pesan
| Target Data | Selector (Class/ID) | Tipe Tag HTML |
|-------------|--------------------|----------|
| Formulir Kirim | `id="rsvpForm"` | `<form>` |
| Field Input Nama Tamu | `id="rsvpName"` | `<input>` |
| Field Opsi Kehadiran | `id="rsvpAttendance"`| `<select>` (Value wajib: `hadir` / `tidak`) |
| Field Pesan/Doa | `id="rsvpMessage"` | `<textarea>` |
| Kolom Daftar Komentar | `id="wishesWall"` | `<div>` (Kosongkan saja wadah ini, isi *chat* akan otomatis terjejer ke dalam Div ini sesaat sesudah halaman di-load.) |

#### F. Galeri Cerdas & Love Story
* **Galeri Foto:** Berikan atribut id pada wadahnya $\rightarrow$ `<div id="galleryGrid"></div>` <br>*(Gambar akan dijejerkan dan di-inject elemen HTML-nya secara otomatis)*.
* **Linimasa Kisah:** Cukup buat *wrapper/pembungkus* utama dengan class `.timeline`. 

#### G. Amplop Digital (Gifts / Transfer)
Mekanismenya serupa dengan Profil Event, berdasarkan indeks kontainer di kodingan:
* Kontainer Rekening/Bank 1: Gunakan class `.gift-box` (posisi atas)
* Kontainer Rekening/Bank 2: Gunakan class `.gift-box` (posisi bawah)
Di masing-masing box tersebut, tambahkan:
* Class `.gift-bank` (Nama Bank/Dompet Digital)
* Class `.gift-number` (Nomor Rekening/Telepon)
* Class `.gift-name` (Nama Pemilik Akun) 
* Class `.copy-btn` (Tombol Pemicu Salin) - *Elemen ini juga harus mempunyai atribut kosong `data-copy=""` yang kelak akan disuntik script*.

#### H. Sistem Pendukung Ekstra (Audio & Footer)
* **Background Audio:** Beri `<audio id="bgMusic">` pada tag lagu. 
* **Tombol Kontrol Pemutar:** Berikan tag `id="musicToggle"` agar event Play/Pause bisa dibaca oleh sistem.
* **Animasi Taburan Mewah (Opsional):** Jika Anda memakai class `.luxury-footer` di bagian paling bawah web Anda, otomatis Javascript akan menyemprotkan partikel animasi *Royal Gold Sparkles* khusus di area tersebut.

---

### Tips Penanganan Kesalahan (Troubleshooting)
Seringkali yang membuat desain gagal tampil adalah masalah *typo* huruf kapital. Sistem bersifat *Case-Sensitive*. Contoh: Penggunaan `id="gallerygrid"` akan gagal. Harus terikat secara akurat ke bentuk yang diatur logika yakni `id="galleryGrid"`.
