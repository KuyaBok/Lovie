// Authentication & Session Management
const VALID_CREDENTIALS = {
    'joseph': 'joseph',
    'marga': 'marga'
};

function getCurrentUser() {
    return sessionStorage.getItem('currentUser');
}

function setCurrentUser(username) {
    sessionStorage.setItem('currentUser', username);
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Check if user needs to login
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html?redirect=' + encodeURIComponent(window.location.pathname);
    }
}

// Validate login credentials
function validateLogin(username, password) {
    const lowerUsername = username.toLowerCase();
    return VALID_CREDENTIALS[lowerUsername] === password.toLowerCase();
}

// Format username for display (capitalize first letter)
function formatUsername(username) {
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
}
