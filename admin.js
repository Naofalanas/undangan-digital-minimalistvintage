/* =========================================
   ADMIN DASHBOARD - UNDANGAN DIGITAL
   JavaScript Logic
   ========================================= */

/* =========================================
   SUPABASE INTEGRATION (CLOUD MULTI-TENANCY)
   ========================================= */
const SUPABASE_URL = 'https://eaklrdnwodbyzagfitqb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVha2xyZG53b2RieXphZ2ZpdHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTc3NDUsImV4cCI6MjA5MTUzMzc0NX0.Utl5GGT4A9DdTc30WzaJZnrggBCuHTthmCdeXpOcD6Q';

let _supaAdmin = null;
let CLIENT_ID = 'demo-client';

// Local Memory State
let localStore = {
    settings: null,
    guests: null,
    wishes: null,
    gallery: null,
    story: null
};

document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initSidebar();

    // --- Fix #1: Ambil CLIENT_ID dari URL SEBELUM try-catch ---
    const urlParams = new URLSearchParams(window.location.search);
    CLIENT_ID = urlParams.get('id') || 'demo-client';

    // Update ID di footer login
    const idDisplay = document.getElementById('loginClientIdDisplay');
    if (idDisplay) idDisplay.textContent = CLIENT_ID;

    // --- Inisialisasi Supabase ---
    try {
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            _supaAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

            // Jalankan sistem Autentikasi dulu sebelum load data
            await initAuthSystem();
        } else {
            console.warn('[ADMIN] Supabase SDK tidak tersedia. Mode offline.');
            showToast('⚠️ Mode Offline (Supabase tidak tersedia)');
            hideLoginOverlay(); // Bypass if offline for dev
        }
    } catch (e) {
        console.error('[ADMIN] Gagal inisialisasi Supabase:', e.message);
        showToast('⚠️ Gagal koneksi ke Cloud.');
    }
});

// Fungsi pembantu untuk inisialisasi dashboard setelah login
async function startDashboard() {
    // Tampilkan ID klien aktif di header dashboard
    const headerTitle = document.querySelector('.admin-header h1');
    if (headerTitle) headerTitle.textContent = `Dashboard Admin — ${CLIENT_ID}`;

    // Update link Preview agar membawa ?id= yang benar
    const previewUrl = `index.html?id=${CLIENT_ID}`;
    const sidebarLink = document.getElementById('sidebarPreviewLink');
    const headerLink = document.getElementById('headerPreviewLink');
    if (sidebarLink) sidebarLink.href = previewUrl;
    if (headerLink) headerLink.href = previewUrl;

    loadDashboard();
    initWeddingInfoForm();
    initGuestManagement();
    initWishesManagement();
    initGalleryManagement();
    initStoryManagement();
}

async function fetchCloudData() {
    if (!_supaAdmin) return null;
    try {
        const { data, error } = await _supaAdmin
            .from('wedding_invitations')
            .select('*')
            .eq('client_id', CLIENT_ID)
            .maybeSingle();

        if (!data) {
            // Klien baru! Buat baris kosong di database
            console.warn(`[ADMIN] Klien "${CLIENT_ID}" belum ada. Membuat baris baru...`);
            const { error: insertErr } = await _supaAdmin.from('wedding_invitations').insert({
                client_id: CLIENT_ID,
                domain_origin: window.location.origin
            });
            if (insertErr) console.error('[ADMIN] Gagal insert baris baru:', insertErr);
            else showToast(`✅ Klien "${CLIENT_ID}" berhasil didaftarkan!`);
            return null;
        }

        if (!error && data) {
            localStore.settings = data.settings;
            localStore.guests = data.guests;
            localStore.wishes = data.wishes;
            localStore.gallery = data.gallery;
            localStore.story = data.story;
            
            // Selalu update domain_origin setiap admin dibuka
            _supaAdmin.from('wedding_invitations')
                .update({ domain_origin: window.location.origin })
                .eq('client_id', CLIENT_ID)
                .then(({ error: domErr }) => {
                    if (domErr) console.warn('[ADMIN] Gagal update domain_origin:', domErr.message);
                });

            return data;
        }
    } catch (err) {
        console.error('[ADMIN] Gagal fetch data:', err);
    }
    return null;
}

/* =========================================
   SECURITY & AUTH SYSTEM
   ========================================= */
let cloudDataCache = null;

async function initAuthSystem() {
    const btnLogin = document.getElementById('btnLoginAdmin');
    const inputPass = document.getElementById('adminPasswordInput');

    // Cek session cache
    const sessionKey = `admin_auth_${CLIENT_ID}`;
    const savedPass = sessionStorage.getItem(sessionKey);

    // Ambil data dari cloud untuk ngecek password
    showToast('Memuat sistem keamanan...');
    cloudDataCache = await fetchCloudData();

    if (!cloudDataCache) {
        // Client baru sekali, suruh bikin password
        document.getElementById('loginTitle').textContent = 'Setup Dashboard';
        document.getElementById('loginSubtitle').textContent = 'Klien baru terdeteksi. Silakan tentukan password admin Anda:';
        document.getElementById('btnLoginAdmin').textContent = 'Simpan & Buka';
    } else if (cloudDataCache.admin_password && savedPass === cloudDataCache.admin_password) {
        // Session masih aktif
        hideLoginOverlay();
        startDashboard();
        return;
    } else if (!cloudDataCache.admin_password) {
        // Data ada tapi belum punya password
        document.getElementById('loginTitle').textContent = 'Set Password';
        document.getElementById('loginSubtitle').textContent = 'Dashboard ini belum memiliki password. Silakan tentukan sekarang:';
        document.getElementById('btnLoginAdmin').textContent = 'Simpan & Buka';
    }

    btnLogin.addEventListener('click', handleLogin);
    inputPass.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}

async function handleLogin() {
    const inputPass = document.getElementById('adminPasswordInput');
    const password = inputPass.value.trim();
    const sessionKey = `admin_auth_${CLIENT_ID}`;

    if (!password) {
        showToast('⚠️ Password tidak boleh kosong');
        return;
    }

    if (!cloudDataCache || !cloudDataCache.admin_password) {
        // SETUP BARU
        showToast('Menyimpan password baru...');
        const { error } = await _supaAdmin
            .from('wedding_invitations')
            .update({ admin_password: password })
            .eq('client_id', CLIENT_ID);

        if (!error) {
            sessionStorage.setItem(sessionKey, password);
            showToast('✅ Password berhasil diset!');
            hideLoginOverlay();
            startDashboard();
        } else {
            showToast('❌ Gagal menyimpan password');
        }
    } else {
        // LOGIN BIASA
        if (password === cloudDataCache.admin_password) {
            sessionStorage.setItem(sessionKey, password);
            showToast('✅ Login Berhasil!');
            hideLoginOverlay();
            startDashboard();
        } else {
            showToast('❌ Password Salah!');
            inputPass.value = '';
            inputPass.focus();
        }
    }
}

function hideLoginOverlay() {
    const overlay = document.getElementById('loginOverlay');
    overlay.classList.add('hidden');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 600);
}

/* =========================================
   STORAGE KEYS & WRAPPERS
   ========================================= */
const KEYS = {
    SETTINGS: 'wedding_settings',
    GUESTS: 'wedding_guests',
    WISHES: 'wedding_wishes',
    GALLERY: 'wedding_gallery',
    STORY: 'wedding_story',
};

const DB_MAP = {
    'wedding_settings': 'settings',
    'wedding_guests': 'guests',
    'wedding_wishes': 'wishes',
    'wedding_gallery': 'gallery',
    'wedding_story': 'story'
};

function getData(key) {
    const colName = DB_MAP[key];
    return localStore[colName] || null;
}

function setData(key, data) {
    const colName = DB_MAP[key];
    localStore[colName] = data; // Update UI langsung (Optimistic UI)

    // Push ke Supabase di belakang layar
    if (_supaAdmin) {
        _supaAdmin.from('wedding_invitations')
            .update({ [colName]: data })
            .eq('client_id', CLIENT_ID)
            .then(({ error }) => {
                if (error) {
                    console.error(`Gagal menyimpan ${colName} ke Cloud:`, error);
                    showToast('⚠️ Gagal menyimpan ke Cloud');
                }
            });
    }
}

/* =========================================
   HELPER: Toast
   ========================================= */
function showToast(msg) {
    const toast = document.getElementById('adminToast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

/* =========================================
   HELPER: Escape HTML
   ========================================= */
function esc(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

/* =========================================
   HELPER: Format Date
   ========================================= */
function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

/* =========================================
   HELPER: Base URL for invitation links
   ========================================= */
function getBaseUrl() {
    const loc = window.location;
    const path = loc.pathname.replace(/admin\.html.*$/, 'index.html');
    return `${loc.origin}${path}`;
}

/* =========================================
   1. SIDEBAR NAVIGATION
   ========================================= */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const panels = document.querySelectorAll('.panel');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');

    const titles = {
        'dashboard': { title: 'Dashboard', sub: 'Ringkasan data undangan Anda' },
        'wedding-info': { title: 'Info Pernikahan', sub: 'Edit detail informasi pernikahan' },
        'guests': { title: 'Daftar Tamu', sub: 'Kelola tamu undangan & generate link' },
        'rsvp': { title: 'RSVP', sub: 'Data konfirmasi kehadiran tamu' },
        'wishes': { title: 'Ucapan & Doa', sub: 'Moderasi ucapan dari tamu' },
        'gallery': { title: 'Galeri', sub: 'Kelola foto galeri undangan' },
        'story': { title: 'Cerita Cinta', sub: 'Kelola momen perjalanan cinta Anda' },
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;

            // Update nav active state
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Show target panel
            panels.forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${section}`).classList.add('active');

            // Update header
            const t = titles[section];
            if (t) {
                pageTitle.textContent = t.title;
                pageSubtitle.textContent = t.sub;
            }

            // Refresh data for the panel
            if (section === 'dashboard') loadDashboard();
            if (section === 'rsvp') loadRSVPTable();
            if (section === 'wishes') loadWishesAdmin();
            if (section === 'guests') loadGuestTable();
            if (section === 'gallery') loadGalleryAdmin();
            if (section === 'story') loadStoryAdmin();

            // Close mobile sidebar
            closeSidebar();
        });
    });
}

/* =========================================
   2. MOBILE SIDEBAR TOGGLE
   ========================================= */
function initSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    });

    overlay.addEventListener('click', closeSidebar);
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
}

/* =========================================
   3. DASHBOARD (Stats + Recent)
   ========================================= */
function loadDashboard() {
    const wishes = getData(KEYS.WISHES) || [];
    const guests = getData(KEYS.GUESTS) || [];

    const hadir = wishes.filter(w => w.attendance === 'hadir');
    const tidakHadir = wishes.filter(w => w.attendance === 'tidak');
    const totalOrang = hadir.reduce((sum, w) => sum + (w.guests || 1), 0);

    document.getElementById('statTotalGuests').textContent = guests.length;
    document.getElementById('statConfirmed').textContent = `${hadir.length} (${totalOrang} org)`;
    document.getElementById('statDeclined').textContent = tidakHadir.length;
    document.getElementById('statWishes').textContent = wishes.length;

    // Recent Wishes Table
    const tbody = document.getElementById('recentWishesBody');
    if (wishes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:32px;">Belum ada ucapan masuk</td></tr>`;
        return;
    }

    tbody.innerHTML = wishes.slice(0, 10).map(w => `
        <tr>
            <td><strong>${esc(w.name)}</strong></td>
            <td>
                <span class="badge ${w.attendance === 'hadir' ? 'badge-success' : 'badge-danger'}">
                    ${w.attendance === 'hadir' ? '✓ Hadir' : '✗ Tidak'}
                </span>
            </td>
            <td style="max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(w.message)}</td>
            <td style="white-space:nowrap;color:var(--text-muted);font-size:0.78rem;">${formatDate(w.timestamp)}</td>
        </tr>
    `).join('');
}

/* =========================================
   4. WEDDING INFO FORM
   ========================================= */
function getDefaultSettings() {
    return {
        groomName: 'Arya Pratama, S.T.',
        groomOrder: 'Putra pertama dari',
        groomFather: 'Bapak Surya Pratama',
        groomMother: 'Ibu Ratna Dewi',
        groomIg: '@aryapratama',
        groomPhoto: 'assets/img/groom.png',
        brideName: 'Kiara Azzahra, S.Pd.',
        brideOrder: 'Putri kedua dari',
        brideFather: 'Bapak Fajar Hidayat',
        brideMother: 'Ibu Sari Wulandari',
        brideIg: '@kiaraazzahra',
        bridePhoto: 'assets/img/bride.png',
        akadDate: '2026-06-20T08:00',
        akadTime: '08:00 — 10:00 WIB',
        akadVenue: 'Masjid Istiqlal',
        akadAddress: 'Jl. Taman Wijaya Kusuma, Jakarta Pusat',
        akadMap: 'https://maps.google.com',
        resepsiDate: '2026-06-20T11:00',
        resepsiTime: '11:00 — 14:00 WIB',
        resepsiVenue: 'Hotel Grand Ballroom',
        resepsiAddress: 'Jl. Sudirman No. 88, Jakarta Selatan',
        resepsiMap: 'https://maps.google.com',
        bank1Name: 'Bank BCA',
        bank1Number: '1234567890',
        bank1Holder: 'Arya Pratama',
        bank2Name: 'Bank BNI',
        bank2Number: '0987654321',
        bank2Holder: 'Kiara Azzahra',
        quoteText: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.',
        quoteSource: '— QS. Ar-Rum: 21',
        hashtag: '#AryaKiara2026',
        musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
    };
}

function initWeddingInfoForm() {
    const settings = getData(KEYS.SETTINGS) || getDefaultSettings();
    populateWeddingForm(settings);

    document.getElementById('btnSaveWedding').addEventListener('click', saveWeddingInfo);
}

function populateWeddingForm(s) {
    const map = {
        wiGroomName: s.groomName, wiGroomOrder: s.groomOrder,
        wiGroomFather: s.groomFather, wiGroomMother: s.groomMother,
        wiGroomIg: s.groomIg, wiGroomPhoto: s.groomPhoto,
        wiBrideName: s.brideName, wiBrideOrder: s.brideOrder,
        wiBrideFather: s.brideFather, wiBrideMother: s.brideMother,
        wiBrideIg: s.brideIg, wiBridePhoto: s.bridePhoto,
        wiAkadDate: s.akadDate, wiAkadTime: s.akadTime,
        wiAkadVenue: s.akadVenue, wiAkadAddress: s.akadAddress,
        wiAkadMap: s.akadMap,
        wiResepsiDate: s.resepsiDate, wiResepsiTime: s.resepsiTime,
        wiResepsiVenue: s.resepsiVenue, wiResepsiAddress: s.resepsiAddress,
        wiResepsiMap: s.resepsiMap,
        wiBank1Name: s.bank1Name, wiBank1Number: s.bank1Number,
        wiBank1Holder: s.bank1Holder,
        wiBank2Name: s.bank2Name, wiBank2Number: s.bank2Number,
        wiBank2Holder: s.bank2Holder,
        wiQuoteText: s.quoteText, wiQuoteSource: s.quoteSource,
        wiHashtag: s.hashtag, wiMusicUrl: s.musicUrl,
    };

    for (const [id, val] of Object.entries(map)) {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.value = val;
    }
}


// Fungsi untuk auto-fix link audio dari berbagai platform
function normalizeAudioUrl(url) {
    if (!url || !url.trim()) return url;
    let u = url.trim();

    // Dropbox: ganti dl=0 jadi dl=1 agar bisa distream langsung
    if (u.includes('dropbox.com')) {
        u = u.replace(/[?&]dl=0/, (match) => match.replace('dl=0', 'dl=1'));
        // Kalau belum ada dl= sama sekali, tambahkan
        if (!u.includes('dl=')) {
            u += (u.includes('?') ? '&' : '?') + 'dl=1';
        }
    }

    // Google Drive: ubah link share jadi link direct stream
    // Format: https://drive.google.com/file/d/FILE_ID/view
    const driveMatch = u.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
        u = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
    }

    return u;
}

function saveWeddingInfo() {
    const rawMusicUrl = document.getElementById('wiMusicUrl').value;
    const settings = {
        groomName: document.getElementById('wiGroomName').value,
        groomOrder: document.getElementById('wiGroomOrder').value,
        groomFather: document.getElementById('wiGroomFather').value,
        groomMother: document.getElementById('wiGroomMother').value,
        groomIg: document.getElementById('wiGroomIg').value,
        groomPhoto: document.getElementById('wiGroomPhoto').value,
        brideName: document.getElementById('wiBrideName').value,
        brideOrder: document.getElementById('wiBrideOrder').value,
        brideFather: document.getElementById('wiBrideFather').value,
        brideMother: document.getElementById('wiBrideMother').value,
        brideIg: document.getElementById('wiBrideIg').value,
        bridePhoto: document.getElementById('wiBridePhoto').value,
        akadDate: document.getElementById('wiAkadDate').value,
        akadTime: document.getElementById('wiAkadTime').value,
        akadVenue: document.getElementById('wiAkadVenue').value,
        akadAddress: document.getElementById('wiAkadAddress').value,
        akadMap: document.getElementById('wiAkadMap').value,
        resepsiDate: document.getElementById('wiResepsiDate').value,
        resepsiTime: document.getElementById('wiResepsiTime').value,
        resepsiVenue: document.getElementById('wiResepsiVenue').value,
        resepsiAddress: document.getElementById('wiResepsiAddress').value,
        resepsiMap: document.getElementById('wiResepsiMap').value,
        bank1Name: document.getElementById('wiBank1Name').value,
        bank1Number: document.getElementById('wiBank1Number').value,
        bank1Holder: document.getElementById('wiBank1Holder').value,
        bank2Name: document.getElementById('wiBank2Name').value,
        bank2Number: document.getElementById('wiBank2Number').value,
        bank2Holder: document.getElementById('wiBank2Holder').value,
        quoteText: document.getElementById('wiQuoteText').value,
        quoteSource: document.getElementById('wiQuoteSource').value,
        hashtag: document.getElementById('wiHashtag').value,
        musicUrl: normalizeAudioUrl(rawMusicUrl), // Auto-fix link sebelum disimpan
    };

    setData(KEYS.SETTINGS, settings);

    // Update field di form dengan URL yang sudah di-fix agar client tau
    document.getElementById('wiMusicUrl').value = settings.musicUrl;

    showToast('✅ Info pernikahan berhasil disimpan!');
}

/* =========================================
   5. GUEST MANAGEMENT
   ========================================= */
function initGuestManagement() {
    document.getElementById('btnAddGuest').addEventListener('click', addGuest);
    document.getElementById('btnExportGuests').addEventListener('click', exportGuestsCSV);

    // Allow Enter key in name field
    document.getElementById('addGuestName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addGuest();
    });

    loadGuestTable();
}

function addGuest() {
    const nameInput = document.getElementById('addGuestName');
    const phoneInput = document.getElementById('addGuestPhone');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name) {
        showToast('⚠️ Nama tamu tidak boleh kosong');
        nameInput.focus();
        return;
    }

    const guests = getData(KEYS.GUESTS) || [];
    guests.push({
        id: Date.now(),
        name,
        phone,
        createdAt: new Date().toISOString(),
    });

    setData(KEYS.GUESTS, guests);
    nameInput.value = '';
    phoneInput.value = '';
    nameInput.focus();
    loadGuestTable();
    showToast(`✅ Tamu "${name}" berhasil ditambahkan!`);
}

function deleteGuest(id) {
    if (!confirm('Yakin ingin menghapus tamu ini?')) return;
    let guests = getData(KEYS.GUESTS) || [];
    guests = guests.filter(g => g.id !== id);
    setData(KEYS.GUESTS, guests);
    loadGuestTable();
    showToast('🗑️ Tamu berhasil dihapus');
}

function loadGuestTable() {
    const guests = getData(KEYS.GUESTS) || [];
    const settings = getData(KEYS.SETTINGS) || getDefaultSettings();
    const groomName = (settings.groomName || 'Mempelai Pria').split(/[,\s]/)[0];
    const brideName = (settings.brideName || 'Mempelai Wanita').split(/[,\s]/)[0];
    const coupleName = `${groomName} & ${brideName}`;

    const tbody = document.getElementById('guestTableBody');
    const count = document.getElementById('guestCount');
    count.textContent = guests.length;

    if (guests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px;">Belum ada tamu. Tambahkan tamu di atas.</td></tr>`;
        return;
    }

    const baseUrl = getBaseUrl();

    tbody.innerHTML = guests.map((g, i) => {
        const link = `${baseUrl}?id=${CLIENT_ID}&to=${encodeURIComponent(g.name)}`;
        const message = `Bismillahirrahmanirrahim. 
Assalamu'alaikum Warahmatullahi Wabarakatuh,

Kepada Yth. Bapak/Ibu/Saudara/i,
*${g.name}*

Tanpa mengurangi rasa hormat, melalui pesan ini kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk turut hadir dan memberikan doa restu pada acara perayaan pernikahan kami:

*${coupleName}*

Untuk detail mengenai waktu, tempat pelaksanaan, serta informasi lainnya terkait acara kami, Bapak/Ibu/Saudara/i dapat mengakses tautan undangan digital kami di bawah ini:

${link}

Menjadi suatu kehormatan dan kebahagiaan yang sangat mendalam bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir di hari bahagia tersebut.

Atas kehadiran dan doa restunya, terima kasih yang sebesar-besarnya kami haturkan. 
Wassalamu'alaikum Warahmatullahi Wabarakatuh.

Hormat kami,
${coupleName}`;

        const waLink = g.phone
            ? `https://wa.me/${g.phone.replace(/^0/, '62')}?text=${encodeURIComponent(message)}`
            : '#';

        return `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${esc(g.name)}</strong></td>
                <td>${g.phone ? esc(g.phone) : '<span style="color:var(--text-muted)">-</span>'}</td>
                <td>
                    <div class="guest-link-input">
                        <input type="text" value="${esc(link)}" readonly onclick="this.select()">
                        <button class="btn btn-outline btn-sm" onclick="copyLink('${esc(link)}')" title="Copy Link">📋</button>
                        ${g.phone ? `<a href="${waLink}" target="_blank" class="btn btn-success btn-sm" title="Kirim via WhatsApp">💬 WA</a>` : ''}
                    </div>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteGuest(${g.id})" title="Hapus">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Copy link helper (global)
window.copyLink = function (link) {
    navigator.clipboard.writeText(link).then(() => {
        showToast('📋 Link berhasil disalin!');
    }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = link;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('📋 Link berhasil disalin!');
    });
};

// Make deleteGuest global
window.deleteGuest = deleteGuest;

function exportGuestsCSV() {
    const guests = getData(KEYS.GUESTS) || [];
    if (guests.length === 0) { showToast('⚠️ Tidak ada data untuk diekspor'); return; }

    const baseUrl = getBaseUrl();
    let csv = 'No,Nama,WhatsApp,Link Undangan\n';
    guests.forEach((g, i) => {
        const link = `${baseUrl}?id=${CLIENT_ID}&to=${encodeURIComponent(g.name)}`;
        csv += `${i + 1},"${g.name}","${g.phone || ''}","${link}"\n`;
    });

    downloadCSV(csv, 'daftar-tamu.csv');
    showToast('📥 CSV berhasil di-download!');
}

/* =========================================
   6. RSVP TABLE
   ========================================= */
function loadRSVPTable() {
    const wishes = getData(KEYS.WISHES) || [];
    const tbody = document.getElementById('rsvpTableBody');

    if (wishes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px;">Belum ada data RSVP</td></tr>`;
        return;
    }

    tbody.innerHTML = wishes.map((w, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><strong>${esc(w.name)}</strong></td>
            <td>
                <span class="badge ${w.attendance === 'hadir' ? 'badge-success' : 'badge-danger'}">
                    ${w.attendance === 'hadir' ? '✓ Hadir' : '✗ Tidak Hadir'}
                </span>
            </td>
            <td>${w.guests || 1} orang</td>
            <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(w.message)}</td>
            <td style="white-space:nowrap;color:var(--text-muted);font-size:0.78rem;">${formatDate(w.timestamp)}</td>
        </tr>
    `).join('');
}

document.getElementById('btnExportRsvp')?.addEventListener('click', () => {
    const wishes = getData(KEYS.WISHES) || [];
    if (wishes.length === 0) { showToast('⚠️ Tidak ada data RSVP'); return; }

    let csv = 'No,Nama,Kehadiran,Jumlah Tamu,Ucapan,Waktu\n';
    wishes.forEach((w, i) => {
        csv += `${i + 1},"${w.name}","${w.attendance === 'hadir' ? 'Hadir' : 'Tidak Hadir'}",${w.guests || 1},"${(w.message || '').replace(/"/g, '""')}","${w.timestamp}"\n`;
    });

    downloadCSV(csv, 'data-rsvp.csv');
    showToast('📥 CSV berhasil di-download!');
});

/* =========================================
   10. LOVE STORY MANAGEMENT
   ========================================= */
function initStoryManagement() {
    const modal = document.getElementById('storyModal');
    const addBtn = document.getElementById('btnAddStory');
    const cancelBtn = document.getElementById('btnCancelStory');
    const confirmBtn = document.getElementById('btnConfirmStory');

    if (!modal || !addBtn) return;

    addBtn.addEventListener('click', () => {
        document.getElementById('modalStoryYear').value = '';
        document.getElementById('modalStoryTitle').value = '';
        document.getElementById('modalStoryDesc').value = '';
        modal.classList.add('show');
    });

    cancelBtn.addEventListener('click', () => modal.classList.remove('show'));

    confirmBtn.addEventListener('click', () => {
        const year = document.getElementById('modalStoryYear').value.trim();
        const title = document.getElementById('modalStoryTitle').value.trim();
        const desc = document.getElementById('modalStoryDesc').value.trim();

        if (!year || !title || !desc) {
            showToast('⚠️ Mohon isi semua bidang cerita');
            return;
        }

        const story = getData(KEYS.STORY) || getDefaultStory();
        story.push({ id: Date.now(), year, title, description: desc });
        setData(KEYS.STORY, story);

        modal.classList.remove('show');
        loadStoryAdmin();
        showToast('✅ Momen cerita berhasil ditambahkan!');
    });

    loadStoryAdmin();
}

function getDefaultStory() {
    return [
        { id: 1, year: '2020', title: 'Pertama Bertemu', description: 'Takdir mempertemukan kami di sebuah perpustakaan kota.' },
        { id: 2, year: '2022', title: 'Menjalin Kasih', description: 'Kami memutuskan untuk melangkah lebih jauh sebagai pasangan.' },
        { id: 3, year: '2025', title: 'Lamaran', description: 'Kami mengikat janji suci di hadapan keluarga.' },
    ];
}

function loadStoryAdmin() {
    const story = getData(KEYS.STORY) || getDefaultStory();
    const container = document.getElementById('storyAdminList');
    if (!container) return;

    if (story.length === 0) {
        container.innerHTML = `<div class="empty-state"><p class="empty-state-text">Belum ada cerita cinta. Tambahkan momen pertama Anda!</p></div>`;
        return;
    }

    container.innerHTML = story.map(item => `
        <div class="wish-admin-card">
            <div class="wish-admin-avatar">${item.year}</div>
            <div class="wish-admin-content">
                <div class="wish-admin-name">${esc(item.title)}</div>
                <div class="wish-admin-message">${esc(item.description)}</div>
            </div>
            <div class="wish-admin-actions">
                <button class="btn btn-danger btn-sm btn-icon" onclick="deleteStory(${item.id})" title="Hapus">🗑️</button>
            </div>
        </div>
    `).join('');
}

window.deleteStory = function (id) {
    if (!confirm('Hapus momen ini?')) return;
    let story = getData(KEYS.STORY) || getDefaultStory();
    story = story.filter(s => s.id !== id);
    setData(KEYS.STORY, story);
    loadStoryAdmin();
    showToast('🗑️ Momen cerita berhasil dihapus');
};

/* =========================================
   7. WISHES MANAGEMENT (Moderation)
   ========================================= */
function initWishesManagement() {
    document.getElementById('btnClearAllWishes').addEventListener('click', () => {
        if (!confirm('Yakin ingin menghapus SEMUA ucapan? Tindakan ini tidak bisa dibatalkan.')) return;
        setData(KEYS.WISHES, []);
        loadWishesAdmin();
        showToast('🗑️ Semua ucapan berhasil dihapus');
    });

    loadWishesAdmin();
}

function loadWishesAdmin() {
    const wishes = getData(KEYS.WISHES) || [];
    const container = document.getElementById('wishesAdminList');
    const count = document.getElementById('wishCount');
    count.textContent = wishes.length;

    if (wishes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <p class="empty-state-text">Belum ada ucapan masuk</p>
                <p class="empty-state-hint">Ucapan akan muncul setelah tamu mengirimkan doa lewat undangan.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = wishes.map(w => {
        const initials = w.name.split(' ').map(x => x.charAt(0).toUpperCase()).slice(0, 2).join('');
        return `
            <div class="wish-admin-card" data-id="${w.id}">
                <div class="wish-admin-avatar">${initials}</div>
                <div class="wish-admin-content">
                    <div class="wish-admin-name">${esc(w.name)}</div>
                    <div class="wish-admin-message">${esc(w.message)}</div>
                    <div class="wish-admin-meta">
                        <span class="badge ${w.attendance === 'hadir' ? 'badge-success' : 'badge-danger'}">
                            ${w.attendance === 'hadir' ? '✓ Hadir' : '✗ Tidak'}
                        </span>
                        <span>${w.guests || 1} orang</span>
                        <span>${formatDate(w.timestamp)}</span>
                    </div>
                </div>
                <div class="wish-admin-actions">
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteWish(${w.id})" title="Hapus">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

window.deleteWish = function (id) {
    if (!confirm('Hapus ucapan ini?')) return;
    let wishes = getData(KEYS.WISHES) || [];
    wishes = wishes.filter(w => w.id !== id);
    setData(KEYS.WISHES, wishes);
    loadWishesAdmin();
    showToast('🗑️ Ucapan berhasil dihapus');
};

/* =========================================
   8. GALLERY MANAGEMENT
   ========================================= */
function initGalleryManagement() {
    const addBtn = document.getElementById('btnAddPhoto');
    const modal = document.getElementById('photoModal');
    const cancelBtn = document.getElementById('btnCancelPhoto');
    const confirmBtn = document.getElementById('btnConfirmPhoto');

    addBtn.addEventListener('click', () => {
        document.getElementById('modalPhotoUrl').value = '';
        document.getElementById('modalPhotoAlt').value = '';
        modal.classList.add('show');
        setTimeout(() => document.getElementById('modalPhotoUrl').focus(), 100);
    });

    cancelBtn.addEventListener('click', () => modal.classList.remove('show'));

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });

    confirmBtn.addEventListener('click', () => {
        const url = document.getElementById('modalPhotoUrl').value.trim();
        const alt = document.getElementById('modalPhotoAlt').value.trim() || 'Gallery Photo';

        if (!url) {
            showToast('⚠️ URL foto tidak boleh kosong');
            return;
        }

        const gallery = getData(KEYS.GALLERY) || getDefaultGallery();
        gallery.push({ id: Date.now(), url, alt });
        setData(KEYS.GALLERY, gallery);

        modal.classList.remove('show');
        loadGalleryAdmin();
        showToast('✅ Foto berhasil ditambahkan!');
    });

    loadGalleryAdmin();
}

function getDefaultGallery() {
    return [
        { id: 1, url: 'assets/img/gallery-1.png', alt: 'Wedding Details' },
        { id: 2, url: 'assets/img/gallery-2.png', alt: 'Wedding Venue' },
        { id: 3, url: 'assets/img/gallery-3.png', alt: 'Wedding Couple' },
        { id: 4, url: 'assets/img/gallery-4.png', alt: 'Wedding Bouquet' },
        { id: 5, url: 'assets/img/groom.png', alt: 'The Groom' },
    ];
}

function loadGalleryAdmin() {
    const gallery = getData(KEYS.GALLERY) || getDefaultGallery();
    const grid = document.getElementById('galleryAdminGrid');

    // Fix #2: Bersihkan grid sepenuhnya
    grid.innerHTML = '';

    gallery.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'gallery-admin-item';
        item.innerHTML = `
            <img src="${esc(photo.url)}" alt="${esc(photo.alt)}" onerror="this.style.display='none'">
            <div class="gallery-actions">
                <button class="btn btn-danger btn-sm btn-icon" onclick="deletePhoto(${photo.id})" title="Hapus">🗑️</button>
            </div>
        `;
        grid.appendChild(item);
    });

    // Fix #2 & #3: Selalu buat tombol Add baru (hindari dangling reference & ID duplikat)
    grid.appendChild(createAddButton());
}

function createAddButton() {
    const div = document.createElement('div');
    div.className = 'gallery-admin-add';
    // Fix #3: Hapus id="btnAddPhoto" dari sini agar tidak duplikat dengan
    // tombol asli yang di-bind di initGalleryManagement()
    div.innerHTML = '<span class="add-icon">➕</span><span>Tambah Foto</span>';
    div.addEventListener('click', () => {
        document.getElementById('modalPhotoUrl').value = '';
        document.getElementById('modalPhotoAlt').value = '';
        document.getElementById('photoModal').classList.add('show');
    });
    return div;
}

window.deletePhoto = function (id) {
    if (!confirm('Hapus foto ini dari galeri?')) return;
    let gallery = getData(KEYS.GALLERY) || getDefaultGallery();
    gallery = gallery.filter(p => p.id !== id);
    setData(KEYS.GALLERY, gallery);
    loadGalleryAdmin();
    showToast('🗑️ Foto berhasil dihapus dari galeri');
};

/* =========================================
   9. CSV DOWNLOAD HELPER
   ========================================= */
function downloadCSV(csv, filename) {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
