/* ============================================
   APPRECIATION PAGE - Letters & Responses
   ============================================ */

const APPRECIATION_STORAGE_KEY = "appreciationEntries";
const APPRECIATION_DB_PATH = "appreciations";

let appreciationRef = null;

const TYPE_META = {
    letters: {
        icon: "💌",
        title: "Letters",
        sourceLabel: "Letter",
        sourcePlaceholder: "Write the letter here...",
        responseLabel: "Response / Appreciation",
        responsePlaceholder: "Write your response here...",
    },
    actions: {
        icon: "✨",
        title: "Actions",
        sourceLabel: "Action",
        sourcePlaceholder: "Describe the action you appreciate...",
        responseLabel: "Response / Appreciation",
        responsePlaceholder: "Write your appreciation here...",
    },
    freeform: {
        icon: "📝",
        title: "Freeform",
    },
};

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
    const addBtn = document.getElementById("addAppreciationBtn");
    const form = document.getElementById("appreciationForm");
    const saveBtn = document.getElementById("saveAppreciationBtn");
    const cancelBtn = document.getElementById("cancelAppreciationBtn");
    const typeOptions = Array.from(document.querySelectorAll(".type-option"));
    const fromInput = document.getElementById("appreciationFrom");
    const dateInput = document.getElementById("appreciationDate");
    const sourceRow = document.getElementById("sourceRow");
    const responseRow = document.getElementById("responseRow");
    const sourceLabel = document.getElementById("sourceLabel");
    const responseLabel = document.getElementById("responseLabel");
    const sourceText = document.getElementById("sourceText");
    const responseText = document.getElementById("responseText");
    const freeformRow = document.getElementById("freeformRow");
    const freeformText = document.getElementById("freeformText");

    if (
        !container ||
        !addBtn ||
        !form ||
        !saveBtn ||
        !cancelBtn ||
        !fromInput ||
        !dateInput ||
        !sourceRow ||
        !responseRow ||
        !sourceLabel ||
        !responseLabel ||
        !sourceText ||
        !responseText ||
        !freeformRow ||
        !freeformText ||
        typeOptions.length === 0
    ) {
        return;
    }

    let entries = [];
    const currentUserRaw =
        typeof getCurrentUser === "function" ? getCurrentUser() || "" : "";
    const currentUser = currentUserRaw.toLowerCase();
    let activeType = "letters";
    let editingIndex = -1;

    function sortEntries(list) {
        return list.sort((a, b) => {
            const aTime = a.createdAt || Date.parse(a.timestamp || 0) || 0;
            const bTime = b.createdAt || Date.parse(b.timestamp || 0) || 0;
            return bTime - aTime;
        });
    }

    function setEntries(nextEntries) {
        entries = sortEntries(nextEntries);
        localStorage.setItem(APPRECIATION_STORAGE_KEY, JSON.stringify(entries));
        renderEntries();
    }

    function initAppreciationRealtime() {
        if (!window.firebase || typeof firebase.database !== "function") {
            return false;
        }

        const db = window.database || firebase.database();
        if (!db) {
            return false;
        }

        appreciationRef = db.ref(APPRECIATION_DB_PATH);
        appreciationRef.on("value", (snapshot) => {
            const syncedEntries = [];

            snapshot.forEach((child) => {
                const normalized = normalizeAppreciationEntry({
                    ...child.val(),
                    id: child.key,
                });
                if (normalized) {
                    syncedEntries.push(normalized);
                }
            });

            setEntries(syncedEntries);
        });

        return true;
    }

    function getEntryOwner(item) {
        return typeof item.createdBy === "string"
            ? item.createdBy.toLowerCase()
            : "";
    }

    function canManageEntry(item) {
        return Boolean(currentUser) && getEntryOwner(item) === currentUser;
    }

    function setActiveType(type) {
        activeType = TYPE_META[type] ? type : "letters";
        typeOptions.forEach((button) => {
            button.classList.toggle("active", button.dataset.type === activeType);
        });

        if (activeType === "freeform") {
            sourceRow.classList.add("hidden");
            responseRow.classList.add("hidden");
            freeformRow.classList.remove("hidden");
            return;
        }

        const meta = TYPE_META[activeType];
        sourceLabel.textContent = meta.sourceLabel;
        responseLabel.textContent = meta.responseLabel;
        sourceText.placeholder = meta.sourcePlaceholder;
        responseText.placeholder = meta.responsePlaceholder;

        sourceRow.classList.remove("hidden");
        responseRow.classList.remove("hidden");
        freeformRow.classList.add("hidden");
    }

    function resetForm() {
        fromInput.value = "";
        dateInput.value = "";
        sourceText.value = "";
        responseText.value = "";
        freeformText.value = "";
        editingIndex = -1;
        saveBtn.textContent = "Save";
        setActiveType("letters");
    }

    function showForm() {
        form.classList.remove("hidden");
        form.classList.add("visible");
    }

    function hideForm() {
        form.classList.remove("visible");
        form.classList.add("hidden");
        resetForm();
    }

    function renderEntries() {
        if (entries.length === 0) {
            container.innerHTML = `
                <div class="appreciation-empty" style="grid-column: 1 / -1;">
                    <div class="appreciation-empty-icon">💝</div>
                    <p class="appreciation-empty-text">No appreciations yet</p>
                    <p class="appreciation-empty-subtext">Tap "I Appreciate You" to add one.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = entries
            .map((item, index) => {
                const type = TYPE_META[item.type] ? item.type : "letters";
                const meta = TYPE_META[type];

                if (type === "freeform") {
                    const actionButtons = canManageEntry(item)
                        ? `
                            <div class="entry-actions">
                                <button type="button" class="entry-action-btn" data-action="edit" data-index="${index}">Edit</button>
                                <button type="button" class="entry-action-btn danger" data-action="delete" data-index="${index}">Delete</button>
                            </div>
                        `
                        : "";
                    const ownerLabel = `By ${escapeHtml(getOwnerDisplayName(item.createdBy))}`;
                    const freeformDisplay = getDisplayText(
                        sanitizeEntryText(item.freeformText),
                        "No freeform content yet."
                    );

                    return `
                        <div class="appreciation-card is-collapsed" data-index="${index}" style="animation: fadeInUp 1s ease ${index * 0.1}s both;">
                            ${actionButtons}
                            <div class="letter-received freeform-received">
                                <div class="letter-icon">${meta.icon}</div>
                                <div class="appreciation-entry-type">${meta.title}</div>
                                <div class="entry-owner">${ownerLabel}</div>
                                <div class="card-toggle-hint">Tap card to view content</div>
                                <div class="letter-header">
                                    <div class="letter-from">${escapeHtml(item.from)}</div>
                                    <div class="letter-date">${escapeHtml(item.date)}</div>
                                </div>
                                <div class="letter-content freeform-content">${escapeHtml(freeformDisplay)}</div>
                            </div>
                        </div>
                    `;
                }

                const actionButtons = canManageEntry(item)
                    ? `
                        <div class="entry-actions">
                            <button type="button" class="entry-action-btn" data-action="edit" data-index="${index}">Edit</button>
                            <button type="button" class="entry-action-btn danger" data-action="delete" data-index="${index}">Delete</button>
                        </div>
                    `
                    : "";
                const ownerLabel = `By ${escapeHtml(getOwnerDisplayName(item.createdBy))}`;
                const sourceDisplay = getDisplayText(
                    sanitizeEntryText(item.sourceText),
                    `No ${meta.sourceLabel.toLowerCase()} content yet.`
                );
                const responseDisplay = getDisplayText(
                    sanitizeEntryText(item.responseText),
                    "No response/appreciation yet."
                );

                return `
                    <div class="appreciation-card is-collapsed" data-index="${index}" style="animation: fadeInUp 1s ease ${index * 0.1}s both;">
                        ${actionButtons}
                        <div class="letter-received">
                            <div class="letter-icon">${meta.icon}</div>
                            <div class="appreciation-entry-type">${meta.title}</div>
                            <div class="entry-owner">${ownerLabel}</div>
                            <div class="card-toggle-hint">Tap card to view content</div>
                            <div class="letter-header">
                                <div class="letter-from">${escapeHtml(item.from)}</div>
                                <div class="letter-date">${escapeHtml(item.date)}</div>
                            </div>
                            <span class="entry-subheading">${meta.sourceLabel}</span>
                            <div class="letter-content">${escapeHtml(sourceDisplay)}</div>
                        </div>
                        <div class="response-given">
                            <div class="letter-icon">💝</div>
                            <span class="response-label">${meta.responseLabel}</span>
                            <div class="letter-content response-content">${escapeHtml(responseDisplay)}</div>
                        </div>
                    </div>
                `;
            })
            .join("");
    }

    function openEditor(index) {
        const item = entries[index];
        if (!item || !canManageEntry(item)) return;

        const type = TYPE_META[item.type] ? item.type : "letters";
        editingIndex = index;
        setActiveType(type);

        fromInput.value = item.from || "";
        dateInput.value = item.date || "";

        if (type === "freeform") {
            freeformText.value = item.freeformText || "";
            sourceText.value = "";
            responseText.value = "";
        } else {
            sourceText.value = item.sourceText || "";
            responseText.value = item.responseText || "";
            freeformText.value = "";
        }

        saveBtn.textContent = "Save Changes";
        showForm();
        form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function deleteEntry(index) {
        const item = entries[index];
        if (!item || !canManageEntry(item)) return;
        if (!window.confirm("Delete this appreciation entry?")) return;

        if (appreciationRef && item.id) {
            appreciationRef.child(item.id).remove((error) => {
                if (error) {
                    console.error("Failed to delete appreciation entry:", error);
                    alert("Failed to delete entry. Please try again.");
                }
            });
            return;
        }

        entries.splice(index, 1);
        setEntries([...entries]);
    }

    typeOptions.forEach((button) => {
        button.addEventListener("click", () => setActiveType(button.dataset.type));
    });

    addBtn.addEventListener("click", showForm);
    cancelBtn.addEventListener("click", hideForm);

    container.addEventListener("click", (event) => {
        const actionButton = event.target.closest(".entry-action-btn");
        if (actionButton) {
            const index = Number(actionButton.dataset.index);
            if (!Number.isInteger(index) || index < 0 || index >= entries.length) {
                return;
            }

            const action = actionButton.dataset.action;
            if (action === "edit") {
                openEditor(index);
            } else if (action === "delete") {
                deleteEntry(index);
            }
            return;
        }

        const card = event.target.closest(".appreciation-card");
        if (!card) return;

        const wasCollapsed = card.classList.contains("is-collapsed");
        const allCards = container.querySelectorAll(".appreciation-card");
        allCards.forEach((entryCard) => entryCard.classList.add("is-collapsed"));

        if (wasCollapsed) {
            card.classList.remove("is-collapsed");
        }
    });

    saveBtn.addEventListener("click", () => {
        const from = fromInput.value.trim() || "From: You";
        const date = dateInput.value.trim() || "A moment in time";
        const editingItem = editingIndex >= 0 ? entries[editingIndex] : null;
        if (editingItem && getEntryOwner(editingItem) !== currentUser) {
            return;
        }

        const entryId = editingItem?.id || `local-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
        const createdByValue = editingItem?.createdBy || currentUserRaw || currentUser || null;
        const createdAtValue = editingItem?.createdAt || Date.now();
        const timestampValue = editingItem?.timestamp || new Date(createdAtValue).toISOString();

        let entry;

        if (activeType === "freeform") {
            const freeformValue = freeformText.value.trim();
            if (!freeformValue) return;

            entry = {
                id: entryId,
                type: "freeform",
                from,
                date,
                freeformText: freeformValue,
                createdBy: createdByValue,
                createdAt: createdAtValue,
                timestamp: timestampValue,
                updatedAt: Date.now(),
            };
        } else {
            const sourceValue = sourceText.value.trim();
            const responseValue = responseText.value.trim();
            if (!sourceValue || !responseValue) return;

            entry = {
                id: entryId,
                type: activeType,
                from,
                date,
                sourceText: sourceValue,
                responseText: responseValue,
                createdBy: createdByValue,
                createdAt: createdAtValue,
                timestamp: timestampValue,
                updatedAt: Date.now(),
            };
        }

        if (appreciationRef && entry.id) {
            appreciationRef.child(entry.id).set(entry, (error) => {
                if (error) {
                    console.error("Failed to save appreciation entry:", error);
                    alert("Failed to save entry. Please try again.");
                }
            });
        } else if (editingIndex >= 0) {
            entries[editingIndex] = entry;
            setEntries([...entries]);
        } else {
            setEntries([entry, ...entries]);
        }

        hideForm();
    });

    setActiveType("letters");
    const realtimeEnabled = initAppreciationRealtime();
    if (!realtimeEnabled) {
        setEntries(loadAppreciationEntries());
    }
}

function loadAppreciationEntries() {
    const stored = localStorage.getItem(APPRECIATION_STORAGE_KEY);
    if (!stored) return [];

    try {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .map((item) => normalizeAppreciationEntry(item))
            .filter((item) => item !== null);
    } catch (error) {
        console.error("Failed to parse appreciation entries:", error);
        return [];
    }
}

function normalizeAppreciationEntry(item) {
    if (!item || typeof item !== "object") return null;

    if (item.type && TYPE_META[item.type]) {
        if (item.type === "freeform") {
            const freeformText =
                item.freeformText || item.text || item.freeform || "";
            if (!freeformText || !String(freeformText).trim()) return null;
            return {
                id: item.id || null,
                type: "freeform",
                from: item.from || "From: You",
                date: item.date || "A moment in time",
                freeformText,
                createdBy: item.createdBy || null,
                timestamp: item.timestamp || null,
                createdAt: item.createdAt || null,
                updatedAt: item.updatedAt || null,
            };
        }

        const sourceText =
            item.sourceText || item.letterText || item.letter || item.actionText || "";
        const responseText =
            item.responseText || item.appreciationText || item.response || "";
        if (!String(sourceText).trim() || !String(responseText).trim()) return null;
        return {
            id: item.id || null,
            type: item.type,
            from: item.from || "From: You",
            date: item.date || "A moment in time",
            sourceText,
            responseText,
            createdBy: item.createdBy || null,
            timestamp: item.timestamp || null,
            createdAt: item.createdAt || null,
            updatedAt: item.updatedAt || null,
        };
    }

    // Backward compatibility for existing letter/response entries.
    if (item.letterText && item.responseText) {
        return {
            id: item.id || null,
            type: "letters",
            from: item.letterFrom || "From: You",
            date: item.letterDate || "A moment in time",
            sourceText: item.letterText,
            responseText: item.responseText,
            createdBy: item.createdBy || null,
            timestamp: item.timestamp || null,
            createdAt: item.createdAt || null,
            updatedAt: item.updatedAt || null,
        };
    }

    return null;
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/\n/g, "<br>");
}

function getDisplayText(value, fallback) {
    const text = String(value || "").trim();
    return text || fallback;
}

function sanitizeEntryText(value) {
    const text = String(value || "").trim();
    const lower = text.toLowerCase();
    if (lower === "letter" || lower === "response / appreciation") {
        return "";
    }
    return text;
}

function getOwnerDisplayName(owner) {
    if (!owner || typeof owner !== "string") return "Unknown";
    if (typeof formatUsername === "function") return formatUsername(owner);
    return owner.charAt(0).toUpperCase() + owner.slice(1).toLowerCase();
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
