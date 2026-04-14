/* =========================================
   UNDANGAN DIGITAL - SCRIPT
   ========================================= */

const SUPABASE_URL = 'https://eaklrdnwodbyzagfitqb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVha2xyZG53b2RieXphZ2ZpdHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTc3NDUsImV4cCI6MjA5MTUzMzc0NX0.Utl5GGT4A9DdTc30WzaJZnrggBCuHTthmCdeXpOcD6Q';
let _supa = null;
let CLIENT_ID = 'demo-client';

document.addEventListener('DOMContentLoaded', async () => {
    initSupabase();
    await fetchCloudData();

    applyDynamicSettings();
    initGuestName();
    initCoverButton();
    initMusicToggle();
    initCountdown();
    initScrollReveal();
    initRSVPForm();
    initCopyButtons();
    loadWishes();
    loadDynamicGallery();
    initLightbox();
    initLoveStory();
    createPetals();
    initHorizontalScroll();
});

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        _supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('id')) CLIENT_ID = params.get('id');
}

async function fetchCloudData() {
    if (!_supa) return;
    try {
        const { data, error } = await _supa
            .from('wedding_invitations')
            .select('*')
            .eq('client_id', CLIENT_ID)
            .maybeSingle();

        if (!error && data) {
            if (data.settings) localStorage.setItem('wedding_settings', JSON.stringify(data.settings));
            if (data.gallery) localStorage.setItem('wedding_gallery', JSON.stringify(data.gallery));
            if (data.story) localStorage.setItem('wedding_story', JSON.stringify(data.story));
            if (data.wishes) localStorage.setItem('wedding_wishes', JSON.stringify(data.wishes));

            // Rekam domain asal undangan saat tamu membuka halaman ini
            // Ini fallback jika admin belum pernah login untuk klien ini
            if (!data.domain_origin) {
                _supa.from('wedding_invitations')
                    .update({ domain_origin: window.location.origin })
                    .eq('client_id', CLIENT_ID)
                    .then(({ error: domErr }) => {
                        if (domErr) console.warn('[SCRIPT] Gagal update domain_origin:', domErr.message);
                    });
            }
        }
    } catch (err) {
        console.error('Error fetching cloud data:', err);
    }
}


/* -----------------------------------------
   0. APPLY DYNAMIC SETTINGS FROM ADMIN
   ----------------------------------------- */
function applyDynamicSettings() {
    let settings;
    try { settings = JSON.parse(localStorage.getItem('wedding_settings')); }
    catch { settings = null; }
    if (!settings) return; // Use hardcoded defaults if no admin settings

    // Helper to safely set text content
    const setText = (sel, text) => {
        document.querySelectorAll(sel).forEach(el => { if (text) el.textContent = text; });
    };

    // --- Couple Names (Cover + Hero + Footer) ---
    const groomFirst = (settings.groomName || '').split(/[,\s]/)[0] || 'Arya';
    const brideFirst = (settings.brideName || '').split(/[,\s]/)[0] || 'Kiara';
    const coupleShort = `${groomFirst} & ${brideFirst}`;

    document.querySelectorAll('.cover-names, .footer-names').forEach(el => el.textContent = coupleShort);

    // Hero names
    const heroNames = document.querySelectorAll('.hero-name');
    if (heroNames[0]) heroNames[0].textContent = groomFirst;
    if (heroNames[1]) heroNames[1].textContent = brideFirst;

    // --- Couple Cards ---
    const coupleCards = document.querySelectorAll('.couple-card');
    if (coupleCards[0] && settings.groomName) {
        coupleCards[0].querySelector('h4').textContent = settings.groomName;
        coupleCards[0].querySelector('p').innerHTML =
            `${settings.groomOrder || 'Putra dari'}<br>${settings.groomFather || ''}<br>& ${settings.groomMother || ''}`;
        const igLink = coupleCards[0].querySelector('.couple-social a');
        if (igLink && settings.groomIg) igLink.textContent = settings.groomIg;
        const photo = coupleCards[0].querySelector('.couple-photo img');
        if (photo && settings.groomPhoto) photo.src = settings.groomPhoto;
    }
    if (coupleCards[1] && settings.brideName) {
        coupleCards[1].querySelector('h4').textContent = settings.brideName;
        coupleCards[1].querySelector('p').innerHTML =
            `${settings.brideOrder || 'Putri dari'}<br>${settings.brideFather || ''}<br>& ${settings.brideMother || ''}`;
        const igLink = coupleCards[1].querySelector('.couple-social a');
        if (igLink && settings.brideIg) igLink.textContent = settings.brideIg;
        const photo = coupleCards[1].querySelector('.couple-photo img');
        if (photo && settings.bridePhoto) photo.src = settings.bridePhoto;
    }

    // --- Event Cards ---
    const eventCards = document.querySelectorAll('.event-card');
    if (eventCards[0]) {
        if (settings.akadTime) eventCards[0].querySelector('.event-time').textContent = settings.akadTime;
        if (settings.akadVenue) eventCards[0].querySelector('.event-venue').textContent = settings.akadVenue;
        if (settings.akadAddress) eventCards[0].querySelector('.event-address').innerHTML = settings.akadAddress.replace(/, /g, ',<br>');
        if (settings.akadMap) eventCards[0].querySelector('.btn-map').href = settings.akadMap;
        if (settings.akadDate) {
            const d = new Date(settings.akadDate);
            const dateStr = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            eventCards[0].querySelector('.event-date').textContent = dateStr;
        }
    }
    if (eventCards[1]) {
        if (settings.resepsiTime) eventCards[1].querySelector('.event-time').textContent = settings.resepsiTime;
        if (settings.resepsiVenue) eventCards[1].querySelector('.event-venue').textContent = settings.resepsiVenue;
        if (settings.resepsiAddress) eventCards[1].querySelector('.event-address').innerHTML = settings.resepsiAddress.replace(/, /g, ',<br>');
        if (settings.resepsiMap) eventCards[1].querySelector('.btn-map').href = settings.resepsiMap;
        if (settings.resepsiDate) {
            const d = new Date(settings.resepsiDate);
            const dateStr = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            eventCards[1].querySelector('.event-date').textContent = dateStr;
        }
    }

    // --- Hero Date ---
    if (settings.akadDate) {
        const d = new Date(settings.akadDate);
        const heroDate = document.querySelector('.hero-date');
        if (heroDate) heroDate.textContent = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    // --- Quote ---
    const blockquote = document.querySelector('.quote-section blockquote');
    if (blockquote && settings.quoteText) blockquote.textContent = `"${settings.quoteText}"`;
    const cite = document.querySelector('.quote-section cite');
    if (cite && settings.quoteSource) cite.textContent = settings.quoteSource;

    // --- Bank / Gift ---
    const giftCards = document.querySelectorAll('.gift-card');
    if (giftCards[0]) {
        if (settings.bank1Name) giftCards[0].querySelector('.gift-bank').textContent = settings.bank1Name;
        if (settings.bank1Number) {
            giftCards[0].querySelector('.gift-number').textContent = settings.bank1Number;
            giftCards[0].querySelector('.btn-copy').setAttribute('data-copy', settings.bank1Number);
        }
        if (settings.bank1Holder) giftCards[0].querySelector('.gift-name').textContent = `a.n. ${settings.bank1Holder}`;
    }
    if (giftCards[1]) {
        if (settings.bank2Name) giftCards[1].querySelector('.gift-bank').textContent = settings.bank2Name;
        if (settings.bank2Number) {
            giftCards[1].querySelector('.gift-number').textContent = settings.bank2Number;
            giftCards[1].querySelector('.btn-copy').setAttribute('data-copy', settings.bank2Number);
        }
        if (settings.bank2Holder) giftCards[1].querySelector('.gift-name').textContent = `a.n. ${settings.bank2Holder}`;
    }

    // --- Hashtag ---
    const hashtag = document.querySelector('.footer-hashtag');
    if (hashtag && settings.hashtag) hashtag.textContent = settings.hashtag;

    // --- Page Title ---
    document.title = `Undangan Pernikahan — ${coupleShort}`;
}

/* -----------------------------------------
   0b. LOAD DYNAMIC GALLERY FROM ADMIN
   ----------------------------------------- */
function loadDynamicGallery() {
    let gallery;
    try { gallery = JSON.parse(localStorage.getItem('wedding_gallery')); }
    catch { gallery = null; }
    if (!gallery || gallery.length === 0) return; // Use hardcoded defaults

    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    grid.innerHTML = gallery.map(photo => `
        <div class="gallery-item">
            <img src="${photo.url}" alt="${photo.alt || 'Gallery'}" loading="lazy">
        </div>
    `).join('');

    // Re-init lightbox after gallery load
    initLightbox();
}

/* -----------------------------------------
   0c. LOAD LOVE STORY FROM ADMIN
   ----------------------------------------- */
function initLoveStory() {
    let story;
    try { story = JSON.parse(localStorage.getItem('wedding_story')); }
    catch { story = null; }
    
    if (!story || story.length === 0) return; // Use hardcoded defaults

    const container = document.getElementById('storyTimeline');
    if (!container) return;

    container.innerHTML = story.map(item => `
        <div class="story-item reveal">
            <div class="story-date">${item.year}</div>
            <div class="story-content">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        </div>
    `).join('');
    
    // Re-init scroll reveal for new items
    initScrollReveal();
}

/* -----------------------------------------
   0d. LIGHTBOX FOR GALLERY
   ----------------------------------------- */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery-item img');

    if (!lightbox || !closeBtn) return;

    galleryItems.forEach(img => {
        img.parentNode.onclick = () => {
            lightbox.style.display = 'block';
            lightboxImg.src = img.src;
            lightboxCaption.innerHTML = img.alt;
            document.body.classList.add('no-scroll');
        };
    });

    closeBtn.onclick = () => {
        lightbox.style.display = 'none';
        document.body.classList.remove('no-scroll');
    };

    lightbox.onclick = (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
            document.body.classList.remove('no-scroll');
        }
    };
}





/* -----------------------------------------
   1. GUEST NAME FROM URL PARAMETER
   ----------------------------------------- */
function initGuestName() {
    const params = new URLSearchParams(window.location.search);
    const guestName = params.get('to');

    if (guestName) {
        const decoded = decodeURIComponent(guestName.replace(/\+/g, ' '));
        const el = document.getElementById('guestName');
        if (el) el.textContent = decoded;

        // Also pre-fill RSVP name
        const rsvpName = document.getElementById('rsvpName');
        if (rsvpName) rsvpName.value = decoded;
    }
}

/* -----------------------------------------
   2. COVER / BUKA UNDANGAN
   ----------------------------------------- */
function initCoverButton() {
    const cover = document.getElementById('cover');
    const btn = document.getElementById('openInvitation');
    const mainContent = document.getElementById('mainContent');
    const musicBtn = document.getElementById('musicToggle');

    if (!btn || !cover) return;

    btn.addEventListener('click', () => {
        // Open cover
        cover.classList.add('opened');
        document.body.classList.remove('no-scroll');

        // Show main content
        setTimeout(() => {
            mainContent.classList.add('visible');
        }, 300);

        // Show music button
        setTimeout(() => {
            musicBtn.classList.add('visible');
        }, 800);

        // Try to play music
        playMusic();

        // Remove cover from DOM after animation
        setTimeout(() => {
            cover.style.display = 'none';
        }, 1000);
    });
}

/* -----------------------------------------
   3. BACKGROUND MUSIC
   ----------------------------------------- */
let isPlaying = false;

function playMusic() {
    const audio = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicToggle');
    if (!audio) return;

    let settings;
    try { settings = JSON.parse(localStorage.getItem('wedding_settings')); } catch { settings = null; }

    const customUrl = settings && settings.musicUrl && settings.musicUrl.trim().startsWith('http')
        ? settings.musicUrl.trim()
        : null;

    if (customUrl) {
        // Set src baru — ini otomatis trigger load di belakang layar
        // JANGAN panggil audio.load() manual, karena itu akan membatalkan play()
        audio.src = customUrl;
    }

    audio.play()
        .then(() => {
            isPlaying = true;
            if (musicBtn) musicBtn.classList.add('playing');
        })
        .catch(err => {
            console.warn('[MUSIC] Gagal play:', err);
            isPlaying = false;
        });
}

function initMusicToggle() {
    const btn = document.getElementById('musicToggle');
    const audio = document.getElementById('bgMusic');

    if (!btn || !audio) return;

    btn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            btn.classList.remove('playing');
        } else {
            audio.play().then(() => {
                isPlaying = true;
                btn.classList.add('playing');
            }).catch(() => {});
        }
    });
}

/* -----------------------------------------
   4. COUNTDOWN TIMER
   ----------------------------------------- */
function initCountdown() {
    // Try reading date from admin settings, fallback to default
    let targetDateStr = '2026-06-20T08:00:00+07:00';
    try {
        const settings = JSON.parse(localStorage.getItem('wedding_settings'));
        if (settings && settings.akadDate) targetDateStr = settings.akadDate;
    } catch {}
    const targetDate = new Date(targetDateStr).getTime();

    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minutesEl = document.getElementById('countMinutes');
    const secondsEl = document.getElementById('countSeconds');

    if (!daysEl) return;

    function update() {
        const now = Date.now();
        const diff = targetDate - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

/* -----------------------------------------
   5. SCROLL REVEAL (Intersection Observer)
   ----------------------------------------- */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    if (!reveals.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px',
        }
    );

    reveals.forEach((el) => observer.observe(el));
}

/* -----------------------------------------
   6. RSVP FORM
   ----------------------------------------- */
function initRSVPForm() {
    const form = document.getElementById('rsvpForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('rsvpName').value.trim();
        const attendance = document.getElementById('rsvpAttendance').value;
        const guests = document.getElementById('rsvpGuests').value;
        const message = document.getElementById('rsvpMessage').value.trim();

        if (!name || !attendance) {
            showToast('Mohon lengkapi nama dan kehadiran.');
            return;
        }

        // Create wish object
        const wish = {
            id: Date.now(),
            name,
            attendance,
            guests: parseInt(guests),
            message: message || '🤍',
            timestamp: new Date().toISOString(),
        };

        // Save to localStorage
        const wishes = getWishes();
        wishes.unshift(wish);
        localStorage.setItem('wedding_wishes', JSON.stringify(wishes));

        // Push directly to Supabase cloud
        pushWishToCloud(wish);

        // Reset form
        form.reset();

        // Show confirmation
        showToast('Terima kasih! Ucapan Anda telah terkirim. 🤍');

        // Reload wishes wall
        loadWishes();

        // Scroll to wishes section
        setTimeout(() => {
            document.getElementById('wishes').scrollIntoView({ behavior: 'smooth' });
        }, 500);
    });
}

/* -----------------------------------------
   7. WISHES WALL
   ----------------------------------------- */
function getWishes() {
    try {
        return JSON.parse(localStorage.getItem('wedding_wishes')) || [];
    } catch {
        return [];
    }
}

function loadWishes() {
    const wall = document.getElementById('wishesWall');
    if (!wall) return;

    const wishes = getWishes();

    if (wishes.length === 0) {
        wall.innerHTML = `
            <div class="wishes-empty">
                Belum ada ucapan. Jadilah yang pertama! ✨
            </div>
        `;
        return;
    }

    wall.innerHTML = wishes
        .map((wish) => {
            const initials = wish.name
                .split(' ')
                .map((w) => w.charAt(0).toUpperCase())
                .slice(0, 2)
                .join('');

            const attendanceLabel = wish.attendance === 'hadir' ? 'Hadir' : 'Tidak Hadir';
            const attendanceClass = wish.attendance === 'hadir' ? 'hadir' : 'tidak';

            return `
                <div class="wish-card">
                    <div class="wish-card-header">
                        <div class="wish-avatar">${initials}</div>
                        <span class="wish-name">${escapeHtml(wish.name)}</span>
                        <span class="wish-attendance ${attendanceClass}">${attendanceLabel}</span>
                    </div>
                    <p class="wish-message">${escapeHtml(wish.message)}</p>
                </div>
            `;
        })
        .join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* -----------------------------------------
   8. COPY TO CLIPBOARD (Bank Account)
   ----------------------------------------- */
function initCopyButtons() {
    document.querySelectorAll('.btn-copy').forEach((btn) => {
        btn.addEventListener('click', () => {
            const textToCopy = btn.getAttribute('data-copy');
            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy).then(() => {
                btn.classList.add('copied');
                btn.innerHTML = '✓ Tersalin!';
                showToast('Nomor rekening berhasil disalin!');

                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = '📋 Salin';
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);

                btn.classList.add('copied');
                btn.innerHTML = '✓ Tersalin!';
                showToast('Nomor rekening berhasil disalin!');

                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = '📋 Salin';
                }, 2000);
            });
        });
    });
}

/* -----------------------------------------
   9. TOAST NOTIFICATION
   ----------------------------------------- */
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/* -----------------------------------------
   10. FLOATING PETALS ON COVER
   ----------------------------------------- */
function createPetals() {
    const cover = document.getElementById('cover');
    if (!cover) return;

    const petalCount = 20;

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');

        // Randomize position, size, delay, and duration
        const left = Math.random() * 100;
        const size = 4 + Math.random() * 8;
        const delay = Math.random() * 8;
        const duration = 6 + Math.random() * 8;
        const opacity = 0.1 + Math.random() * 0.3;

        petal.style.left = `${left}%`;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.animationDelay = `${delay}s`;
        petal.style.animationDuration = `${duration}s`;
        petal.style.setProperty('--petal-opacity', opacity);

        // Randomize color between gold and sage green
        const colors = [
            'rgba(196, 165, 90, 0.5)',
            'rgba(123, 142, 109, 0.5)',
            'rgba(232, 213, 163, 0.4)',
        ];
        petal.style.background = colors[Math.floor(Math.random() * colors.length)];

        cover.appendChild(petal);
    }
}

async function pushWishToCloud(newWish) {
    if (!_supa) return;
    try {
        const { data, error } = await _supa
            .from('wedding_invitations')
            .select('wishes')
            .eq('client_id', CLIENT_ID)
            .maybeSingle();

        let latestWishes = [];
        if (data && data.wishes) latestWishes = data.wishes;

        latestWishes.unshift(newWish);

        await _supa
            .from('wedding_invitations')
            .update({ wishes: latestWishes })
            .eq('client_id', CLIENT_ID);
    } catch (err) {
        console.error('Error pushing wish:', err);
    }
}

function initHorizontalScroll() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    let currentIndex = 0;
    let isAnimating = false;
    const sections = document.querySelectorAll('.section');

    function goToSection(index) {
        if (index < 0 || index >= sections.length) return;
        if (isAnimating) return;

        isAnimating = true;

        if (sections[currentIndex]) {
            sections[currentIndex].classList.remove('active');
        }

        currentIndex = index;

        // Apply hardware-accelerated transform
        mainContent.style.transform = `translate3d(-${currentIndex * 100}vw, 0, 0)`;

        if (sections[currentIndex]) {
            sections[currentIndex].classList.add('active');
        }

        setTimeout(() => {
            isAnimating = false;
        }, 1200); // Wait for transition to complete
    }

    // Set initial active
    if (sections[0]) sections[0].classList.add('active');

    window.addEventListener('wheel', (evt) => {
        if (document.body.classList.contains('no-scroll')) return;

        let isInternalScrollArea = false;
        let container = evt.target;
        
        // Find nearest scrollable parent
        while (container && container !== document.body && container !== document.documentElement) {
            if (container.scrollHeight > container.clientHeight) {
                const style = window.getComputedStyle(container);
                if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                    break;
                }
            }
            container = container.parentElement;
        }

        if (container && container !== document.body && container !== document.documentElement) {
            isInternalScrollArea = true;
            const isAtTop = container.scrollTop === 0;
            const isAtBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 2;
            
            if ((isAtTop && evt.deltaY < 0) || (isAtBottom && evt.deltaY > 0)) {
                isInternalScrollArea = false; // Release lock at boundaries
            }
        }

        if (isInternalScrollArea) return;

        if (evt.deltaY != 0) {
            evt.preventDefault();
            if (isAnimating) return;

            const direction = evt.deltaY > 0 ? 1 : -1;
            goToSection(currentIndex + direction);
        }
    }, { passive: false });

    // For mobile
    let touchStartY = 0;
    window.addEventListener('touchstart', (evt) => {
        touchStartY = evt.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (evt) => {
        if (document.body.classList.contains('no-scroll')) return;

        let isInternalScrollArea = false;
        let container = evt.target;
        
        // Find nearest scrollable parent
        while (container && container !== document.body && container !== document.documentElement) {
            if (container.scrollHeight > container.clientHeight) {
                const style = window.getComputedStyle(container);
                if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                    break;
                }
            }
            container = container.parentElement;
        }

        if (container && container !== document.body && container !== document.documentElement) {
            isInternalScrollArea = true;
            const isAtTop = container.scrollTop === 0;
            const isAtBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 2;
            
            const touchEndY = evt.touches[0].clientY;
            const deltaY = touchStartY - touchEndY;
            
            if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
                isInternalScrollArea = false;
            }
        }
        
        if (isInternalScrollArea) return;

        const touchEndY = evt.touches[0].clientY;
        const deltaY = touchStartY - touchEndY;

        if (Math.abs(deltaY) > 40) {
            evt.preventDefault();
            if (isAnimating) return;
            const direction = deltaY > 0 ? 1 : -1;
            goToSection(currentIndex + direction);
            
            // reset to avoid double firing
            touchStartY = touchEndY; 
        }
    }, { passive: false });
}
