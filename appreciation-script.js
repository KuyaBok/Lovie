/* ============================================
   APPRECIATION PAGE - Letters & Responses
   ============================================ */

const APPRECIATION_STORAGE_KEY = "appreciationLetters";

const DEFAULT_APPRECIATION = [
    {
        letterIcon: "💌",
        letterFrom: "From: You",
        letterDate: "A moment in time",
        letterText: "Your letter will appear here once you add it. Share your thoughts, your feelings, and the moments that matter most to you.",
        responseIcon: "💝",
        responseText: "This is where I'll share my heartfelt response and appreciation for every word you wrote. Your letters mean the world to me.",
    },
];

document.addEventListener("DOMContentLoaded", () => {
    initFloatingHearts();
    initSparkles();
    initPetals();
    initNavigation();
    initScrollReveal();
    initAppreciation();
    initMusicPlayer();
    setFooterYear();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
    }
});

function initAppreciation() {
    const container = document.getElementById("appreciationContainer");
    if (!container) return;

    const stored = localStorage.getItem(APPRECIATION_STORAGE_KEY);
    const letters = stored ? JSON.parse(stored) : DEFAULT_APPRECIATION;

    if (letters.length === 0) {
        container.innerHTML = `
            <div class="appreciation-empty" style="grid-column: 1 / -1;">
                <div class="appreciation-empty-icon">💌</div>
                <p class="appreciation-empty-text">No letters yet</p>
                <p class="appreciation-empty-text" style="font-size: 0.95rem; font-family: var(--font-body); font-style: normal;">Share a letter and I'll respond with my appreciation</p>
            </div>
        `;
        return;
    }

    container.innerHTML = letters
        .map(
            (item, index) => `
        <div class="appreciation-card" style="animation: fadeInUp 1s ease ${index * 0.1}s both;">
            <div class="letter-received">
                <div class="letter-icon">${item.letterIcon}</div>
                <div class="letter-header">
                    <div class="letter-from">${item.letterFrom}</div>
                    <div class="letter-date">${item.letterDate}</div>
                </div>
                <div class="letter-content">${item.letterText}</div>
            </div>
            <div class="response-given">
                <div class="letter-icon">${item.responseIcon}</div>
                <span class="response-label">My Response</span>
                <div class="letter-content" style="font-style: normal;">${item.responseText}</div>
            </div>
        </div>
    `
        )
        .join("");
}

// Import shared functions from main script
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

    for (let i = 0; i < 8; i++) {
        setTimeout(() => createHeart(), i * 800);
    }

    setInterval(createHeart, 3000);
}

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

function initNavigation() {
    const nav = document.getElementById("mainNav");
    const toggle = document.getElementById("navToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-link");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 80) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }

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

function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        ".appreciation-card, .section-header"
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

function initMusicPlayer() {
    const musicBtn = document.getElementById("musicBtn");
    const bgMusic = document.getElementById("bgMusic");
    const musicWaves = document.getElementById("musicWaves");

    if (!musicBtn || !bgMusic) return;

    let isPlaying = false;

    musicBtn.addEventListener("click", () => {
        isPlaying = !isPlaying;

        if (isPlaying) {
            bgMusic.play();
            musicWaves.classList.add("playing");
        } else {
            bgMusic.pause();
            musicWaves.classList.remove("playing");
        }
    });
}

function setFooterYear() {
    const yearSpan = document.getElementById("footerYear");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}
