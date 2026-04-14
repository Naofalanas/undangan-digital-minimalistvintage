# Panduan Standar: Meta Tags Dinamis (Vercel Serverless)

Panduan ini berisi instruksi teknis untuk menerapkan fitur **Dynamic WhatsApp Preview (Open Graph Meta Tags) Terintegrasi Supabase** pada desain/template undangan digital Anda yang lainnya.

Fitur ini mutlak dibutuhkan agar ketika *link* undangan dibagikan ke WhatsApp, nama pengantin pada tautan (`?id=nama-klien`) dapat terbaca dengan tepat sesuai database klien, bukan membaca judul bawaan HTML.

---

## 🏗 Langkah-Langkah Penerapan

### 1. Salin File Konfigurasi Vercel
Setiap project template/tema baru yang Anda buat harus memiliki file bernama `vercel.json` di *root directory* (paling luar, sejajar dengan `index.html`).

Buat atau salin file `vercel.json` dengan isi pasti seperti ini:
```json
{
  "rewrites": [
    {
      "source": "/",
      "destination": "/api/invite"
    },
    {
      "source": "/index.html",
      "destination": "/api/invite"
    }
  ]
}
```
*Tujuan: Membelokkan trafik kunjungan bawaan agar mampir ke mesin pembuat Meta Tag buatan kita sebelum muncul.*

### 2. Pasang Mesin Pembuat Meta (Serverless API)
Di dalam folder project yang sama, buat folder baru bernama `api`. Di dalamnya, salin file bernama `invite.js` yang ada di template ini. Jika ingin dibuat manual, isinya kurang lebih seperti ini:

```javascript
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { id } = req.query;
    
    // Fallback: Teks yang muncul jika nama klien tidak ketemu
    let title = "Undangan Pernikahan";
    let desc = "Anda diundang! Silakan klik tautan ini untuk melihat detail informasi.";
    
    if (id) {
        // --- 🔴 BACA PENTING 🔴 ---
        // Jika Tema/Desain lain ini menggunakan DATABASE SUPABASE yang BERBEDA,
        // PASTIKAN ANDA MERUBAH URL DAN API KEY DI BAWAH INI!
        // --------------------------
        const SUPABASE_URL = 'https://eaklrdnwodbyzagfitqb.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUz... [GANTI_DENGAN_ANON_KEY_ANDA]';
        
        try {
            // Ambil nama dari cloud Supabase (tanpa Javascript SDK)
            const response = await fetch(`${SUPABASE_URL}/rest/v1/wedding_invitations?client_id=eq.${id}&select=settings`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0 && data[0].settings) {
                    const s = data[0].settings;
                    const groom = s.groomName ? s.groomName.split(' ')[0] : "Pria";
                    const bride = s.brideName ? s.brideName.split(' ')[0] : "Wanita";
                    
                    title = `Undangan Pernikahan — ${groom} & ${bride}`;
                    
                    if (s.akadDate) {
                        desc = `Undangan Pernikahan ${groom} & ${bride} — ${s.akadDate}. Kami mengundang Anda untuk merayakan hari bahagia kami.`;
                    }
                }
            }
        } catch (e) {
            console.error('Fetch gagal:', e);
        }
    }
    
    try {
        const filePath = path.join(process.cwd(), 'index.html');
        let html = fs.readFileSync(filePath, 'utf8');
        
        // --- PROSES SUNTIK NAMA ---
        // Mencari script asli <title> dan menggantinya
        // Pastikan index.html asli Anda memiliki teks <title>Undangan Pernikahan</title> yang seragam.
        html = html.replace('<title>Undangan Pernikahan</title>', `<title>${title}</title>`);
        
        const ogTags = `
    <!-- Dynamic Open Graph Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
`;
        // Menyuntikkan meta tags raksasa sebelum menutup <head>
        html = html.replace('</head>', `${ogTags}</head>`);
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=86400');
        res.status(200).send(html);
        
    } catch (e) {
        res.status(500).send('<h1>Internal Server Error</h1>');
    }
}
```

### 3. Bersihkan Title di `index.html` Original
Pastikan *source code* murni `index.html` pada desain baru tersebut memiliki judul `<title>` yang generik (umum). **JANGAN** pernah melakukan hardcode terhadap pengantin a.n. (Si A & Si B). Vercel Serverless Function akan bergantung pada string ini untuk diganti "*replace()*" saat link dikunjungi. 

Contoh Tag yang bersih di *Root HTML:*
```html
<head>
    <title>Undangan Pernikahan</title>
</head>
```

---

## 🛠 Aturan Tambahan

1. Karena arsitektur ini bergantung pada **NodeJS Edge Functions**, Anda *tidak akan merasakan hasil perubahannya saat menge-run Live Server ekstensi VS Code biasa*. 
2. Fitur `api/invite.js` baru akan dieksekusi murni di mesin hosting sesaat setelah Anda **Push project tersebut dan di-*deploy* via Vercel**.
3. Saat melakukan uji coba *Share* link di WhatsApp untuk *client* baru, ubah isi tautan dengan parameter palsu (`?id=klien_a&cache=reset`) jika Preview Nama tidak terganti, hal ini wajar karena Sistem internal aplikasi WhatsApp memiliki sistem cache yang lambat kadaluwarsa (sekitar 3-7 hari). 
