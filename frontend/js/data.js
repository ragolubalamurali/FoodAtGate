// Data management functions — now uses backend API via api.js
// These functions maintain the same names for backward compatibility

function getCurrentUser() {
    // Returns cached user data (synchronous for navbar/auth checks)
    return getCachedUser();
}

function setCurrentUser(user) {
    saveUserData(user);
}

function logout() {
    removeToken();
    removeUserData();
    localStorage.removeItem('cart');
    window.location.href = 'index.html';
}

// Cart is still stored in localStorage (it's a local concept until order is placed)
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}