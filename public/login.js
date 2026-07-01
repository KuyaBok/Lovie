// Login Page Handler
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (isLoggedIn()) {
        hideLoginOverlay();
        handlePostLoginRedirect();
    } else {
        showLoginOverlay();
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
});

function showLoginOverlay() {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function hideLoginOverlay() {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorElement = document.getElementById('loginError');

    if (validateLogin(username, password)) {
        // Valid credentials
        setCurrentUser(username);
        errorElement.classList.add('hidden');
        hideLoginOverlay();
        handlePostLoginRedirect();
    } else {
        // Invalid credentials
        errorElement.classList.remove('hidden');
        document.getElementById('loginPassword').value = '';
    }
}

function handlePostLoginRedirect() {
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect');
    
    if (redirectUrl && redirectUrl !== 'undefined') {
        window.location.href = decodeURIComponent(redirectUrl);
    }
}
