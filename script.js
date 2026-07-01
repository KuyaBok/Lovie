/* ============================================
   LOVE STORY - JavaScript
   ============================================ */

// ==========================================
// CONFIGURATION - Edit these to personalize!
// ==========================================
const CONFIG = {
    // Your names
    name1: "Joseph",
    name2: "Marga",

    // The date you became a couple (YYYY, MM-1, DD) — Month is 0-indexed!
    // Example: new Date(2024, 0, 15) = January 15, 2024
    anniversaryDate: new Date(2026, 3, 3),
    monthsaryDay: 3,
    firebaseStoragePath: "gallery_uploads",

    // Gallery items - replace with your own images!
    // To add a real photo: { src: "images/photo1.jpg", title: "Our Date", date: "Jan 2024", category: "dates" }
    galleryItems: [
        { placeholder: 1, emoji: "💕", title: "Our First Photo", date: "Add your date", category: "dates" },
        { placeholder: 2, emoji: "🌸", title: "Date Night", date: "Add your date", category: "dates" },
        { placeholder: 3, emoji: "✨", title: "Adventure Time", date: "Add your date", category: "adventures" },
        { placeholder: 4, emoji: "🌅", title: "Sunset Together", date: "Add your date", category: "adventures" },
        { placeholder: 5, emoji: "🥰", title: "Cozy Moments", date: "Add your date", category: "everyday" },
        { placeholder: 6, emoji: "💗", title: "You & Me", date: "Add your date", category: "everyday" },
        { placeholder: 7, emoji: "🎉", title: "Celebrations", date: "Add your date", category: "dates" },
        { placeholder: 8, emoji: "🌙", title: "Late Night Talks", date: "Add your date", category: "everyday" },
        { placeholder: 9, emoji: "🦋", title: "Growing Together", date: "Add your date", category: "adventures" },
    ],
    uploadedPhotosKey: "uploadedGalleryItems",
};

// Toggle PWA features. Set to `true` to enable service worker + install prompt.
const ENABLE_PWA = true;

const APP = {
    galleryItems: [],
    uploadedItems: [],
    letters: [],
};

const LETTERS_STORAGE_KEY = "loveLetters";

const DEFAULT_LETTERS = [
    {
        seal: "💕",
        from: "From: Me",
        date: "Written with love",
        text: "My dearest love,<br><br>Every day with you feels like a dream I never want to wake up from. You are my sunshine on cloudy days, my calm in the storm, and the reason I believe in magic. Thank you for choosing me, for loving me, and for being exactly who you are.<br><br>I love you more than words could ever express. 💕<br><br><em>Forever yours</em>",
    },
    {
        seal: "🌸",
        from: "To: My Everything",
        date: "Always & Forever",
        text: "To the one who makes my heart skip a beat,<br><br>Remember that no matter where life takes us, my heart will always find its way back to you. You are my home, my adventure, and my greatest love story. I promise to love you fiercely, laugh with you endlessly, and hold your hand through every chapter of our lives.<br><br>You are my forever. 🌙✨<br><br><em>With all my love</em>",
    },
    {
        seal: "✨",
        from: "A Little Reminder",
        date: "Every single day",
        text: "Hey you,<br><br>Just a little reminder that you are loved beyond measure. You are beautiful, you are strong, and you are the best thing that has ever happened to me. Never forget that.<br><br>I love you. I love you. I love you. 💗<br><br><em>— Your biggest fan</em>",
    },
];

// ==========================================
// DOM Ready
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initFloatingHearts();
    initSparkles();
    initPetals();
    initNavigation();
    initScrollReveal();
    initTimeline();
    initGallery();
    initLightbox();
    initCelebrations();
    initLetters();
    initCountdown();
    initDaysTogether();
    initMusicPlayer();
    initSeamlessNavigation();
    setFooterYear();
    updateNames();
    initInstallPrompt();

    if (ENABLE_PWA) {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
        }
    } else {
        // Ensure any previously-registered service workers are removed so the
        // browser stops showing native install UI.
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((regs) => {
                regs.forEach((r) => r.unregister());
            }).catch(() => {});
        }
    }
});

// PWA diagnostics overlay removed (no longer used)

// Add a small Reset Install State button to the footer for quick testing
function addResetInstallButton() {
    try {
        const footer = document.querySelector('.footer');
        if (!footer) return;
        if (document.getElementById('resetInstallBtn')) return;
        const btn = document.createElement('button');
        btn.id = 'resetInstallBtn';
        btn.textContent = 'Reset Install State';
        btn.style.marginTop = '8px';
        btn.style.padding = '8px 12px';
        btn.style.fontSize = '12px';
        btn.style.borderRadius = '8px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.background = 'rgba(255,255,255,0.9)';
        btn.style.color = '#7a3b45';
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = 'Resetting...';
            console.log('Resetting install state: unregistering SWs and clearing storage');
            if ('serviceWorker' in navigator) {
                try {
                    const regs = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(regs.map(r => r.unregister()));
                    console.log('Service workers unregistered', regs.length);
                } catch (e) {
                    console.warn('Error unregistering service workers', e);
                }
            }
            try {
                if (navigator.storage && navigator.storage.clear) {
                    await navigator.storage.clear();
                    console.log('Storage cleared');
                } else {
                    localStorage.clear();
                    sessionStorage.clear();
                    console.log('Local/session storage cleared');
                }
            } catch (e) {
                console.warn('Error clearing storage', e);
            }
            location.reload();
        });

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.justifyContent = 'center';
        wrapper.appendChild(btn);
        footer.appendChild(wrapper);
    } catch (e) {
        console.error('Could not add reset button', e);
    }
}

setTimeout(addResetInstallButton, 1000);

// ==========================================
// Update Names
// ==========================================
function updateNames() {
    const name1El = document.querySelector(".hero-name-1");
    const name2El = document.querySelector(".hero-name-2");
    if (name1El) name1El.textContent = CONFIG.name1;
    if (name2El) name2El.textContent = CONFIG.name2;
}

let deferredInstallPrompt = null;

function initInstallPrompt() {
    const footer = document.querySelector(".footer");
    let installBtn = document.getElementById("installBtn");

    // If PWA is disabled, remove any install UI and exit early.
    if (!ENABLE_PWA) {
        const existingInstallArea = document.querySelector('.install-area');
        if (existingInstallArea) existingInstallArea.remove();
        const footerInstall = document.querySelector('.footer-install');
        if (footerInstall) footerInstall.remove();
        if (installBtn) installBtn.remove();
        return;
    }

    // If there's an existing top-right install area (from a previous render or cached DOM),
    // move its button into a footer wrapper so it uses footer styles (prevents top-right positioning).
    const existingInstallArea = document.querySelector('.install-area');
    if (existingInstallArea && footer) {
        const btn = existingInstallArea.querySelector('button');
        if (btn) {
            if (!btn.id) btn.id = 'installBtn';
            // If footer already has an install wrapper, just append the button into it.
            let installWrapper = footer.querySelector('.footer-install');
            if (!installWrapper) {
                installWrapper = document.createElement('div');
                installWrapper.className = 'footer-install';
                footer.appendChild(installWrapper);
            }
            // Ensure the button uses footer styling and move it into the wrapper.
            btn.classList.add('footer-install-btn');
            installWrapper.appendChild(btn);
        }
        existingInstallArea.remove();
    }

    if (!installBtn && footer) {
        const installWrapper = document.createElement("div");
        installWrapper.className = "footer-install";
        installWrapper.innerHTML = '<button class="footer-install-btn" id="installBtn" type="button">Install App</button>';
        footer.appendChild(installWrapper);
        installBtn = document.getElementById("installBtn");
    }

    if (!installBtn) return;

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    const isAppleDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isStandalone) {
        installBtn.classList.add("hidden");
        return;
    }

    const showInstallUI = () => {
        installBtn.classList.remove("hidden");
        installBtn.style.display = "inline-flex";
    };

    const hideInstallUI = () => {
        installBtn.classList.add("hidden");
    };

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        showInstallUI();
    });

    installBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            const choiceResult = await deferredInstallPrompt.userChoice;
            if (choiceResult.outcome === "accepted") {
                hideInstallUI();
            }
            deferredInstallPrompt = null;
            return;
        }

        if (isAppleDevice) {
            alert(
                "📱 To add this page to your home screen:\n\n" +
                "1. Tap the Share button\n" +
                "2. Tap 'Add to Home Screen'\n" +
                "3. Tap 'Add'"
            );
        } else {
            alert(
                "🔧 To install this page as an app:\n\n" +
                "1. Open your browser menu\n" +
                "2. Choose 'Install app' or 'Add to Home screen'\n" +
                "3. Confirm"
            );
        }
    });

    window.addEventListener("appinstalled", () => {
        hideInstallUI();
    });

    setTimeout(() => {
        if (!deferredInstallPrompt && !isStandalone) {
            showInstallUI();
        }
    }, 300);

    // Remove any stray top-right install UI nodes that may have been injected
    // by older page states or duplicated scripts. Look for common text used
    // in the bubble and remove/move those nodes if they are not inside the footer.
    function removeStrayInstallUI() {
        const texts = [
            'Install this page as an app for offline access',
            'Install this page as an app',
            'Install App'
        ];

        const candidates = Array.from(document.querySelectorAll('body *'));
        candidates.forEach((el) => {
            try {
                const txt = (el.textContent || '').trim();
                if (!txt) return;
                for (const t of texts) {
                    if (txt.includes(t)) {
                        // If this element is already inside our footer, keep it.
                        if (el.closest('.footer')) return;
                        // If it's a button we want, move it into footer wrapper.
                        if (el.tagName.toLowerCase() === 'button') {
                            let installWrapper = footer.querySelector('.footer-install');
                            if (!installWrapper) {
                                installWrapper = document.createElement('div');
                                installWrapper.className = 'footer-install';
                                footer.appendChild(installWrapper);
                            }
                            el.classList.add('footer-install-btn');
                            installWrapper.appendChild(el);
                        } else {
                            // Otherwise remove the stray node
                            el.remove();
                        }
                        return;
                    }
                }
            } catch (e) {
                // ignore DOM read errors
            }
        });
    }

    // Run immediately and again shortly after in case other scripts add it later.
    removeStrayInstallUI();
    setTimeout(removeStrayInstallUI, 600);
}

// ==========================================
// Floating Hearts
// ==========================================
function initFloatingHearts() {
    const container = document.getElementById("floatingHearts");
    const hearts = ["💕", "💗", "💖", "💝", "🩷", "🤍", "🩵"];

    function createHeart() {
        const heart = document.createElement("div");
        heart.className = "floating-heart";
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + "%";
        heart.style.fontSize = Math.random() * 16 + 10 + "px";
        heart.style.animationDuration = Math.random() * 12 + 10 + "s";
        heart.style.animationDelay = Math.random() * 5 + "s";
        container.appendChild(heart);

        setTimeout(() => heart.remove(), 25000);
    }

    // Create initial hearts
    for (let i = 0; i < 8; i++) {
        setTimeout(() => createHeart(), i * 800);
    }

    // Keep creating hearts
    setInterval(createHeart, 3000);
}

// ==========================================
// Sparkles
// ==========================================
function initSparkles() {
    const container = document.getElementById("sparkles");

    function createSparkle() {
        const sparkle = document.createElement("div");
        sparkle.className = "sparkle";
        sparkle.style.left = Math.random() * 100 + "%";
        sparkle.style.top = Math.random() * 100 + "%";
        sparkle.style.animationDuration = Math.random() * 3 + 2 + "s";
        sparkle.style.animationDelay = Math.random() * 2 + "s";
        container.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 6000);
    }

    for (let i = 0; i < 15; i++) {
        setTimeout(() => createSparkle(), i * 400);
    }

    setInterval(createSparkle, 1500);
}

// ==========================================
// Petals (Hero section)
// ==========================================
function initPetals() {
    const container = document.getElementById("heroPetals");

    function createPetal() {
        const petal = document.createElement("div");
        petal.className = "petal";
        petal.style.left = Math.random() * 100 + "%";
        petal.style.width = Math.random() * 10 + 8 + "px";
        petal.style.height = petal.style.width;
        petal.style.animationDuration = Math.random() * 6 + 6 + "s";
        petal.style.animationDelay = Math.random() * 4 + "s";
        petal.style.opacity = Math.random() * 0.5 + 0.2;
        container.appendChild(petal);

        setTimeout(() => petal.remove(), 15000);
    }

    for (let i = 0; i < 12; i++) {
        setTimeout(() => createPetal(), i * 500);
    }

    setInterval(createPetal, 2000);
}

// ==========================================
// Navigation
// ==========================================
function initNavigation() {
    const nav = document.getElementById("mainNav");
    const toggle = document.getElementById("navToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-link");
    const navLinks = document.querySelectorAll(".nav-link");

    // Scroll effect
    window.addEventListener("scroll", () => {
        if (window.scrollY > 80) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }

        // Active link highlighting
        const sections = document.querySelectorAll("section[id]");
        let current = "";

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === "#" + current) {
                link.classList.add("active");
            }
        });
    });

    // Mobile toggle
    toggle.addEventListener("click", () => {
        toggle.classList.toggle("active");
        mobileMenu.classList.toggle("active");
        document.body.style.overflow = mobileMenu.classList.contains("active") ? "hidden" : "";
    });

    mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
            toggle.classList.remove("active");
            mobileMenu.classList.remove("active");
            document.body.style.overflow = "";
        });
    });
}

// ==========================================
// Scroll Reveal
// ==========================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        ".story-card, .stat-card, .letter-card, .section-header, .gallery-item, .countdown-card"
    );

    revealElements.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((el) => observer.observe(el));
}

// ==========================================
// Timeline Animation
// ==========================================
function initTimeline() {
    const items = document.querySelectorAll(".timeline-item");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add("visible");
                    }, index * 150);
                }
            });
        },
        { threshold: 0.2 }
    );

    items.forEach((item) => observer.observe(item));
}


async function initGallery() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;

    const filterBtns = document.querySelectorAll(".filter-btn");
    const uploadBtn = document.getElementById("uploadBtn");
    const uploadInput = document.getElementById("photoUpload");
    const storageKey = CONFIG.uploadedPhotosKey;
    const firebaseUploadFolder = window.FIREBASE_STORAGE_PATH || CONFIG.firebaseStoragePath;
    const firebaseEnabled = !!(window.firebaseStorage && typeof window.firebaseStorage.ref === "function");
    let activeFilter = "all";

    APP.uploadedItems = firebaseEnabled ? await loadFirebaseUploads() : loadUploadedItems();

    function loadUploadedItems() {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || [];
        } catch {
            return [];
        }
    }

    function saveUploadedItems() {
        localStorage.setItem(storageKey, JSON.stringify(APP.uploadedItems));
    }

    function getAllGalleryItems() {
        return [...CONFIG.galleryItems, ...APP.uploadedItems];
    }

    function renderGallery(filter = "all") {
        grid.innerHTML = "";
        const allItems = getAllGalleryItems();
        const filtered =
            filter === "all"
                ? allItems
                : allItems.filter((item) => item.category === filter);

        filtered.forEach((item, index) => {
            const realIndex = allItems.indexOf(item);
            const div = document.createElement("div");
            div.className = "gallery-item";
            div.dataset.index = realIndex;
            div.style.animationDelay = index * 0.1 + "s";

            if (item.src) {
                div.innerHTML = `
                    <img src="${item.src}" alt="${item.title}" loading="lazy">
                    <div class="gallery-item-overlay">
                        <div class="gallery-item-title">${item.title}</div>
                        <div class="gallery-item-date">${item.date}</div>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class="gallery-placeholder gallery-placeholder-${item.placeholder}">
                        ${item.emoji}
                    </div>
                    <div class="gallery-item-overlay">
                        <div class="gallery-item-title">${item.title}</div>
                        <div class="gallery-item-date">${item.date}</div>
                    </div>
                `;
            }

            grid.appendChild(div);
        });

        const newItems = grid.querySelectorAll(".gallery-item");
        newItems.forEach((el) => el.classList.add("reveal"));

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            },
            { threshold: 0.1 }
        );

        newItems.forEach((el) => observer.observe(el));
    }

    function formatUploadDate(date) {
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    async function loadFirebaseUploads() {
        if (!firebaseEnabled) return [];

        try {
            const folderRef = window.firebaseStorage.ref(firebaseUploadFolder);
            const result = await folderRef.listAll();
            const items = await Promise.all(
                result.items.map(async (fileRef) => ({
                    src: await fileRef.getDownloadURL(),
                    title: fileRef.name,
                    date: "",
                    category: "custom",
                }))
            );
            return items.reverse();
        } catch (error) {
            console.error("Firebase storage load error:", error);
            return [];
        }
    }

    function handleUpload(files) {
        if (!files || files.length === 0) return;

        Array.from(files).forEach(async (file) => {
            const tempItem = {
                src: URL.createObjectURL(file),
                title: file.name,
                date: formatUploadDate(new Date()),
                category: "custom",
                uploading: true,
            };

            APP.uploadedItems.unshift(tempItem);
            renderGallery(activeFilter);

            if (firebaseEnabled) {
                try {
                    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
                    const storageRef = window.firebaseStorage.ref(`${firebaseUploadFolder}/${safeName}`);
                    await storageRef.put(file);
                    tempItem.src = await storageRef.getDownloadURL();
                    delete tempItem.uploading;
                    APP.uploadedItems = await loadFirebaseUploads();
                    renderGallery(activeFilter);
                } catch (error) {
                    console.error("Firebase upload error:", error);
                    tempItem.error = true;
                    delete tempItem.uploading;
                    renderGallery(activeFilter);
                }
            } else {
                const reader = new FileReader();
                reader.onload = () => {
                    tempItem.src = reader.result;
                    saveUploadedItems();
                    renderGallery(activeFilter);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            activeFilter = btn.dataset.filter;
            renderGallery(activeFilter);
        });
    });

    uploadBtn.addEventListener("click", () => uploadInput.click());
    uploadInput.addEventListener("change", (event) => {
        handleUpload(event.target.files);
        uploadInput.value = "";
    });

    renderGallery();
}

// ==========================================
// Celebrations
// ==========================================
function initCelebrations() {
    const celebrationBanner = document.getElementById("celebrationBanner");
    const today = new Date();
    const message = getTodaySpecialText(today);

    if (!message) return;

    if (celebrationBanner) {
        celebrationBanner.textContent = message;
        celebrationBanner.classList.add("active");
        setTimeout(() => celebrationBanner.classList.remove("active"), 10000);
    }

    startConfetti();
}

function getTodaySpecialText(now) {
    const month = now.getMonth();
    const day = now.getDate();
    const messages = [];
    const isAnniversary = month === 3 && day === 3;
    const isMonthsary = day === 3;
    const isYourBirthday = month === 3 && day === 3;
    const isHerBirthday = month === 8 && day === 6;

    if (isAnniversary) {
        messages.push("Happy Anniversary!");
    }
    if (isMonthsary) {
        messages.push("Happy Monthsary!");
    }
    if (isYourBirthday) {
        messages.push(`Happy Birthday, ${CONFIG.name1}!`);
    }
    if (isHerBirthday) {
        messages.push(`Happy Birthday, ${CONFIG.name2}!`);
    }

    return messages.length ? messages.join(" ") : "";
}

function startConfetti() {
    const container = document.getElementById("confetti");
    if (!container) return;

    const colors = ["#f8cdda", "#f4b6c2", "#c7aed7", "#d0d8e8", "#f2e2c4"];
    let burstCount = 0;

    const interval = setInterval(() => {
        if (burstCount > 25) {
            clearInterval(interval);
            return;
        }
        createConfettiPiece(container, colors);
        createConfettiPiece(container, colors);
        burstCount += 1;
    }, 150);
}

function createConfettiPiece(container, colors) {
    const piece = document.createElement("div");
    const size = Math.floor(Math.random() * 10) + 8;
    const left = Math.random() * 100;
    const rotation = Math.floor(Math.random() * 360);
    const color = colors[Math.floor(Math.random() * colors.length)];

    piece.className = "confetti-piece";
    piece.style.setProperty("--confetti-size", `${size}px`);
    piece.style.setProperty("--confetti-rotation", `${rotation}deg`);
    piece.style.setProperty("--confetti-duration", `${Math.random() * 3 + 4}s`);
    piece.style.left = `${left}%`;
    piece.style.background = color;
    piece.style.top = "-20px";

    container.appendChild(piece);

    setTimeout(() => {
        piece.remove();
    }, 7000);
}

// ==========================================
// Letters
// ==========================================
function initLetters() {
    // The letters page uses realtime Firebase sync via letters-sync.js.
    // Skip localStorage-based letters logic there to avoid conflicting renders.
    if (document.body && document.body.dataset.lettersSync === "true") {
        return;
    }

    const lettersContainer = document.querySelector(".letters-container");
    const addLetterBtn = document.getElementById("addLetterBtn");
    const letterForm = document.getElementById("letterForm");
    const cancelLetterBtn = document.getElementById("cancelLetterBtn");
    const saveLetterBtn = document.getElementById("saveLetterBtn");
    const letterSealInput = document.getElementById("letterSeal");
    const letterFromInput = document.getElementById("letterFrom");
    const letterDateInput = document.getElementById("letterDate");
    const letterTextInput = document.getElementById("letterText");
    const removeModal = document.getElementById("removeLetterModal");
    const confirmRemoveBtn = document.getElementById("confirmRemoveBtn");
    const cancelRemoveBtn = document.getElementById("cancelRemoveBtn");

    // Return early when the letters UI is not present on this page.
    if (!lettersContainer || !addLetterBtn || !letterForm || !cancelLetterBtn || !saveLetterBtn || !removeModal || !confirmRemoveBtn || !cancelRemoveBtn) {
        return;
    }

    let pendingRemoveIndex = null;
    APP.letters = loadSavedLetters();

    function loadSavedLetters() {
        const saved = localStorage.getItem(LETTERS_STORAGE_KEY);
        if (!saved) {
            localStorage.setItem(LETTERS_STORAGE_KEY, JSON.stringify(DEFAULT_LETTERS));
            return DEFAULT_LETTERS.slice();
        }

        try {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : DEFAULT_LETTERS.slice();
        } catch {
            return DEFAULT_LETTERS.slice();
        }
    }

    function saveLetters() {
        localStorage.setItem(LETTERS_STORAGE_KEY, JSON.stringify(APP.letters));
    }

    function renderLetters() {
        lettersContainer.innerHTML = "";
        APP.letters.forEach((letter, index) => {
            const card = createLetterCard(letter, index);
            lettersContainer.appendChild(card);
        });
    }

    function attachLetterEvents(card, index) {
        const envelope = card.querySelector(".letter-envelope");
        if (envelope) {
            envelope.addEventListener("click", () => {
                card.classList.toggle("open");
            });

            envelope.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    card.classList.toggle("open");
                }
            });
        }

        let removeButton = card.querySelector(".letter-remove-btn");
        if (!removeButton) {
            removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "letter-remove-btn";
            removeButton.textContent = "Remove";
            card.appendChild(removeButton);
        }

        removeButton.addEventListener("click", () => {
            pendingRemoveIndex = index;
            removeModal.classList.remove("hidden");
            removeModal.classList.add("visible");
        });
    }

    function createLetterCard(letter, index) {
        const card = document.createElement("div");
        card.className = "letter-card";
        card.dataset.index = index;
        card.innerHTML = `
            <div class="letter-envelope" role="button" tabindex="0">
                <div class="letter-flap"></div>
                <div class="letter-seal">${letter.seal || "💕"}</div>
                <div class="letter-open-label">Open letter</div>
            </div>
            <div class="letter-content">
                <div class="letter-header">
                    <span class="letter-from">${letter.from || "From: You"}</span>
                    <span class="letter-date">${letter.date || "Always & Forever"}</span>
                </div>
                <p class="letter-text">${letter.text || "Your message goes here..."}</p>
            </div>
        `;
        attachLetterEvents(card, index);
        return card;
    }

    function showLetterForm() {
        letterForm.classList.remove("hidden");
        letterForm.classList.add("visible");
    }

    function hideLetterForm() {
        letterForm.classList.add("hidden");
        letterForm.classList.remove("visible");
        letterSealInput.value = "";
        letterFromInput.value = "";
        letterDateInput.value = "";
        letterTextInput.value = "";
    }

    addLetterBtn.addEventListener("click", showLetterForm);
    cancelLetterBtn.addEventListener("click", hideLetterForm);

    saveLetterBtn.addEventListener("click", () => {
        const newLetter = {
            seal: letterSealInput.value.trim() || "💕",
            from: letterFromInput.value.trim() || "From: You",
            date: letterDateInput.value.trim() || "Always & Forever",
            text: letterTextInput.value.trim().replace(/\n/g, "<br>") || "Your message goes here...",
        };

        APP.letters.push(newLetter);
        saveLetters();
        renderLetters();
        hideLetterForm();
    });

    confirmRemoveBtn.addEventListener("click", () => {
        if (pendingRemoveIndex !== null && pendingRemoveIndex >= 0 && pendingRemoveIndex < APP.letters.length) {
            APP.letters.splice(pendingRemoveIndex, 1);
            saveLetters();
            renderLetters();
        }
        pendingRemoveIndex = null;
        removeModal.classList.add("hidden");
        removeModal.classList.remove("visible");
    });

    cancelRemoveBtn.addEventListener("click", () => {
        pendingRemoveIndex = null;
        removeModal.classList.add("hidden");
        removeModal.classList.remove("visible");
    });

    removeModal.addEventListener("click", (event) => {
        if (event.target === removeModal) {
            pendingRemoveIndex = null;
            removeModal.classList.add("hidden");
            removeModal.classList.remove("visible");
        }
    });

    renderLetters();
}

// ==========================================// Lightbox
// ==========================================
function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxPlaceholder = document.getElementById("lightboxPlaceholder");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const closeBtn = document.getElementById("lightboxClose");
    const prevBtn = document.getElementById("lightboxPrev");
    const nextBtn = document.getElementById("lightboxNext");
    const galleryGrid = document.getElementById("galleryGrid");
    if (!lightbox || !galleryGrid) return;

    let currentIndex = 0;
    const allGalleryItems = () => [...CONFIG.galleryItems, ...APP.uploadedItems];

    // Open lightbox on gallery item click
    document.getElementById("galleryGrid").addEventListener("click", (e) => {
        const item = e.target.closest(".gallery-item");
        if (!item) return;

        currentIndex = parseInt(item.dataset.index);
        showLightboxItem(currentIndex);
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    });

    function showLightboxItem(index) {
        const items = allGalleryItems();
        const item = items[index];
        if (!item) return;

        lightboxCaption.textContent = item.title + " — " + item.date;

        if (item.src) {
            lightboxPlaceholder.style.display = "none";
            lightboxImg.style.display = "block";
            lightboxImg.src = item.src;
            lightboxImg.alt = item.title;
        } else {
            lightboxImg.style.display = "none";
            lightboxImg.src = "";
            lightboxPlaceholder.style.display = "flex";
            lightboxPlaceholder.textContent = item.emoji || "❣️";
        }
    }

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    function closeLightbox() {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
    }

    prevBtn.addEventListener("click", () => {
        const items = allGalleryItems();
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        showLightboxItem(currentIndex);
    });

    nextBtn.addEventListener("click", () => {
        const items = allGalleryItems();
        currentIndex = (currentIndex + 1) % items.length;
        showLightboxItem(currentIndex);
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") prevBtn.click();
        if (e.key === "ArrowRight") nextBtn.click();
    });
}

// ==========================================
// Countdown
// ==========================================
function initCountdown() {
    function getTimerElements(prefix, fallbackPrefix = "") {
        const getId = (id) => document.getElementById(`${id}${prefix}`) || document.getElementById(`${id}${fallbackPrefix}`);

        return {
            days: getId("countDays"),
            hours: getId("countHours"),
            minutes: getId("countMinutes"),
            seconds: getId("countSeconds"),
        };
    }

    const anniversaryEls = getTimerElements("Ann", "");
    const monthsaryEls = getTimerElements("Mon");

    function getNextAnniversary(now) {
        const anniversary = new Date(CONFIG.anniversaryDate);
        let nextAnniversary = new Date(now.getFullYear(), anniversary.getMonth(), anniversary.getDate());
        if (nextAnniversary <= now) {
            nextAnniversary = new Date(now.getFullYear() + 1, anniversary.getMonth(), anniversary.getDate());
        }
        return nextAnniversary;
    }

    function getNextMonthsary(now) {
        let nextMonthsary = new Date(now.getFullYear(), now.getMonth(), CONFIG.monthsaryDay);
        if (nextMonthsary <= now) {
            nextMonthsary = new Date(now.getFullYear(), now.getMonth() + 1, CONFIG.monthsaryDay);
        }
        return nextMonthsary;
    }

    function updateTimer(elements, targetDate) {
        if (!elements.days || !elements.hours || !elements.minutes || !elements.seconds) return;

        const now = new Date();
        const diff = targetDate - now;
        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
        const seconds = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));

        elements.days.textContent = String(days).padStart(2, "0");
        elements.hours.textContent = String(hours).padStart(2, "0");
        elements.minutes.textContent = String(minutes).padStart(2, "0");
        elements.seconds.textContent = String(seconds).padStart(2, "0");
    }

    function updateCountdown() {
        const now = new Date();
        updateTimer(anniversaryEls, getNextAnniversary(now));
        updateTimer(monthsaryEls, getNextMonthsary(now));
    }

    if (anniversaryEls.days || monthsaryEls.days) {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
}

// ==========================================
// Days Together Counter
// ==========================================
function initDaysTogether() {
    const startDate = CONFIG.anniversaryDate;
    const now = new Date();
    const diff = now - startDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    const daysEl = document.getElementById("daysTogether");
    const hoursEl = document.getElementById("hoursTogether");
    if (!daysEl || !hoursEl) return;

    animateCounter(daysEl, days);
    animateCounter(hoursEl, hours);
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 80;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 25);
}

// ==========================================
// Music Player
// ==========================================
function initMusicPlayer() {
    const musicBtn = document.getElementById("musicBtn");
    const musicIcon = document.getElementById("musicIcon");
    const musicWaves = document.getElementById("musicWaves");
    const audio = document.getElementById("bgMusic");
    if (!musicBtn || !audio) return;

    const MUSIC_STATE_KEY = "loveMusicState";
    const DEFAULT_MUSIC_SRC = "music/YTDown_YouTube_Lady-Gaga-Bruno-Mars-Die-With-A-Smile-Ly_Media_zgaCZOQCpp8_009_128k.mp3";
    let saveThrottle = 0;

    // Ensure every page has a playable source even if the HTML source tag is missing.
    if (!audio.querySelector("source") && !audio.getAttribute("src")) {
        audio.src = DEFAULT_MUSIC_SRC;
    }

    const readState = () => {
        try {
            const raw = localStorage.getItem(MUSIC_STATE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    };

    const writeState = () => {
        try {
            localStorage.setItem(
                MUSIC_STATE_KEY,
                JSON.stringify({
                    shouldPlay: !audio.paused,
                    currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
                })
            );
        } catch {
            // Ignore storage failures (private mode/quota) and keep player usable.
        }
    };

    const applyUi = (playing) => {
        if (playing) {
            musicWaves.classList.add("playing");
            musicIcon.style.opacity = "0";
        } else {
            musicWaves.classList.remove("playing");
            musicIcon.style.opacity = "1";
            musicIcon.textContent = "🎵";
        }
    };

    const flashBlocked = () => {
        musicIcon.textContent = "🎶";
        setTimeout(() => {
            if (audio.paused) musicIcon.textContent = "🎵";
        }, 1000);
    };

    const tryPlay = async () => {
        try {
            await audio.play();
            return true;
        } catch {
            applyUi(false);
            flashBlocked();
            return false;
        }
    };

    const savedState = readState();
    let shouldResume = !!savedState.shouldPlay;
    const resumeAt = Number(savedState.currentTime) || 0;

    audio.addEventListener("loadedmetadata", () => {
        if (resumeAt > 0 && Number.isFinite(audio.duration) && audio.duration > 0) {
            audio.currentTime = Math.min(resumeAt, Math.max(0, audio.duration - 0.25));
        }
    });

    audio.addEventListener("play", () => {
        applyUi(true);
        writeState();
    });

    audio.addEventListener("pause", () => {
        applyUi(false);
        writeState();
    });

    audio.addEventListener("timeupdate", () => {
        const now = Date.now();
        if (now - saveThrottle > 900) {
            saveThrottle = now;
            writeState();
        }
    });

    document.addEventListener("visibilitychange", async () => {
        if (!document.hidden && shouldResume && audio.paused) {
            const played = await tryPlay();
            shouldResume = played;
        }
    });

    window.addEventListener("pagehide", writeState);
    window.addEventListener("beforeunload", writeState);

    musicBtn.addEventListener("click", async () => {
        if (audio.paused) {
            const played = await tryPlay();
            shouldResume = played;
            writeState();
            return;
        }

        shouldResume = false;
        audio.pause();
        writeState();
    });

    applyUi(!audio.paused);

    // After navigation to another page, resume from prior playback state if possible.
    if (shouldResume) {
        setTimeout(async () => {
            const played = await tryPlay();
            shouldResume = played;
            writeState();
        }, 120);
    }
}

function initSeamlessNavigation() {
    // Only run in the top-level page. If this page is inside an iframe,
    // let the parent handle seamless navigation.
    if (window.top !== window.self) return;

    const navLinks = Array.from(document.querySelectorAll('a[href$=".html"]'));
    if (!navLinks.length) return;

    let seamlessFrame = document.getElementById("seamlessPageFrame");
    if (!seamlessFrame) {
        seamlessFrame = document.createElement("iframe");
        seamlessFrame.id = "seamlessPageFrame";
        seamlessFrame.style.position = "fixed";
        seamlessFrame.style.inset = "0";
        seamlessFrame.style.width = "100vw";
        seamlessFrame.style.height = "100vh";
        seamlessFrame.style.border = "0";
        seamlessFrame.style.background = "#fff";
        seamlessFrame.style.zIndex = "9998";
        seamlessFrame.style.display = "none";
        seamlessFrame.setAttribute("title", "Page Content");
        document.body.appendChild(seamlessFrame);
    }

    const musicPlayer = document.getElementById("musicPlayer");
    if (musicPlayer) {
        musicPlayer.style.zIndex = "2147483647";
    }

    const normalizeHref = (href) => {
        try {
            const u = new URL(href, window.location.href);
            return `${u.pathname}${u.search}${u.hash}`;
        } catch {
            return href;
        }
    };

    const openInFrame = (href, shouldPushState = true) => {
        const target = normalizeHref(href);
        seamlessFrame.style.display = "block";
        seamlessFrame.src = target;
        if (shouldPushState) {
            history.pushState({ seamless: true, href: target }, "", target);
        }
    };

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            if (event.defaultPrevented) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (link.target && link.target !== "_self") return;

            event.preventDefault();
            openInFrame(link.getAttribute("href"), true);
        });
    });

    seamlessFrame.addEventListener("load", () => {
        try {
            const frameDoc = seamlessFrame.contentDocument;
            const frameWin = seamlessFrame.contentWindow;
            if (!frameDoc || !frameWin) return;

            // Keep only one active player (the top-level one).
            const frameAudio = frameDoc.getElementById("bgMusic");
            if (frameAudio) frameAudio.pause();

            let styleTag = frameDoc.getElementById("seamlessHostStyle");
            if (!styleTag) {
                styleTag = frameDoc.createElement("style");
                styleTag.id = "seamlessHostStyle";
                styleTag.textContent = "#musicPlayer, #bgMusic { display: none !important; }";
                frameDoc.head.appendChild(styleTag);
            }

            // Reflect iframe URL in the address bar for shareable links.
            const frameUrl = `${frameWin.location.pathname}${frameWin.location.search}${frameWin.location.hash}`;
            history.replaceState({ seamless: true, href: frameUrl }, "", frameUrl);
        } catch {
            // Ignore access/update issues and keep navigation functional.
        }
    });

    window.addEventListener("popstate", () => {
        const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        openInFrame(current, false);
    });
}

// ==========================================
// Footer Year
// ==========================================
function setFooterYear() {
    const footerYear = document.getElementById("footerYear");
    if (!footerYear) return;
    footerYear.textContent = new Date().getFullYear();
}
