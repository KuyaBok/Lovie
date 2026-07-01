// Firebase Letters Real-time Sync
let lettersRef = null;
let allLetters = [];

function initLettersSync() {
    // Check if user is logged in
    requireLogin();

    if (!window.firebase || !firebase.database) {
        console.error('Firebase database is not available');
        return;
    }

    const db = window.database || firebase.database();
    if (!db) {
        console.error('Realtime database instance is not initialized');
        return;
    }

    // Initialize Firebase reference
    lettersRef = db.ref('letters');

    // Load existing letters and listen for changes
    lettersRef.on('value', (snapshot) => {
        allLetters = [];

        snapshot.forEach((child) => {
            const letter = child.val();
            if (letter && typeof letter === 'object') {
                allLetters.push({ ...letter, id: letter.id || child.key });
            }
        });

        allLetters.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        renderLetters();
    });
}

function addLetter(seal, letterFrom, letterDate, letterText) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        alert('Please login first');
        return;
    }

    if (!lettersRef) {
        alert('Letters sync is still loading. Please wait a moment and try again.');
        return;
    }

    const newRef = lettersRef.push();
    const letterId = newRef.key;
    const newLetter = {
        id: letterId,
        seal: seal || '💌',
        letterFrom: letterFrom || formatUsername(currentUser),
        letterDate: letterDate || 'Forever',
        letterText: String(letterText || '').trim(),
        author: currentUser,
        timestamp: new Date().toISOString(),
        createdAt: Date.now()
    };

    // Save to Firebase
    newRef.set(newLetter, (error) => {
        if (error) {
            alert('Failed to save letter. Please try again.');
            console.error('Firebase write error:', error);
        } else {
            console.log('Letter saved successfully');
        }
    });
}

function deleteLetter(letterId) {
    const currentUser = getCurrentUser();
    const letter = allLetters.find(l => l.id === letterId);
    
    if (!letter) {
        alert('Letter not found');
        return;
    }

    // Only allow deletion if user is the author
    if (letter.author !== currentUser) {
        alert('You can only delete your own letters');
        return;
    }

    lettersRef.child(letterId).remove((error) => {
        if (error) {
            alert('Failed to delete letter. Please try again.');
            console.error('Firebase delete error:', error);
        } else {
            console.log('Letter deleted successfully');
        }
    });
}

function renderLetters() {
    const container = document.querySelector('.letters-container');
    const currentUser = getCurrentUser();
    
    if (!container) return;

    if (allLetters.length === 0) {
        container.innerHTML = `
            <div class="letters-empty">
                <div class="letters-empty-icon">💌</div>
                <p class="letters-empty-text">No love letters yet. Start writing!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = allLetters.map((letter, index) => {
        const isAuthor = letter.author === currentUser;
        const letterNumber = index + 1;
        
        return `
            <div class="letter-card" data-letter-id="${letter.id}">
                <div class="letter-number">#${letterNumber}</div>
                <div class="letter-content-wrapper">
                    <div class="letter-header">
                        <span class="letter-seal">${letter.seal}</span>
                        <div class="letter-meta">
                            <div class="letter-from">From: ${letter.letterFrom}</div>
                            <div class="letter-date">${letter.letterDate}</div>
                        </div>
                    </div>
                    <div class="letter-body">
                        ${String(letter.letterText || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}
                    </div>
                </div>
                ${isAuthor ? `
                    <button class="delete-letter-btn" onclick="showDeleteConfirm('${letter.id}')" title="Delete this letter">
                        🗑️
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
}

function showDeleteConfirm(letterId) {
    const modal = document.getElementById('removeLetterModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('confirmRemoveBtn').onclick = () => {
            deleteLetter(letterId);
            modal.classList.add('hidden');
        };
    }
}

// Handle letter form submission
function setupLetterForm() {
    const addLetterBtn = document.getElementById('addLetterBtn');
    const letterForm = document.getElementById('letterForm');
    const saveLetterBtn = document.getElementById('saveLetterBtn');
    const cancelLetterBtn = document.getElementById('cancelLetterBtn');

    if (!addLetterBtn || !letterForm) return;

    addLetterBtn.addEventListener('click', () => {
        letterForm.classList.remove('hidden');
    });

    cancelLetterBtn.addEventListener('click', () => {
        letterForm.classList.add('hidden');
        resetLetterForm();
    });

    saveLetterBtn.addEventListener('click', () => {
        const seal = document.getElementById('letterSeal').value;
        const from = document.getElementById('letterFrom').value;
        const date = document.getElementById('letterDate').value;
        const text = document.getElementById('letterText').value;

        if (!text.trim()) {
            alert('Please write your letter');
            return;
        }

        addLetter(seal, from, date, text);
        letterForm.classList.add('hidden');
        resetLetterForm();
    });
}

function resetLetterForm() {
    document.getElementById('letterSeal').value = '💌';
    document.getElementById('letterFrom').value = '';
    document.getElementById('letterDate').value = '';
    document.getElementById('letterText').value = '';
}

// Cancel modal handlers
function setupModals() {
    const cancelRemoveBtn = document.getElementById('cancelRemoveBtn');
    const removeModal = document.getElementById('removeLetterModal');

    if (cancelRemoveBtn) {
        cancelRemoveBtn.addEventListener('click', () => {
            removeModal.classList.add('hidden');
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initLettersSync();
    setupLetterForm();
    setupModals();
});
