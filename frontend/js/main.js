// Common functionality
document.addEventListener('DOMContentLoaded', function () {
    updateCartCount();
    if (typeof updateNavbar === 'function') updateNavbar();
});

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count, .nav-cart-count');
    cartCountElements.forEach(el => el.textContent = count);
}

function addToCart(foodId, restaurantId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    let cart = getCart();

    // Check restaurant rules
    if (cart.length > 0) {
        // Find existing restaurant ID from the first item
        const existingRestaurantId = cart[0].restaurantId;
        if (existingRestaurantId && existingRestaurantId !== restaurantId) {
            if (confirm('Your cart contains items from another restaurant. Do you want to clear the cart and add this item?')) {
                cart = []; // Clear the cart
            } else {
                return; // User canceled
            }
        }
    }

    const existing = cart.find(c => c._id === foodId);

    if (existing) {
        existing.quantity++;
    } else {
        const foods = window._loadedFoods || [];
        const item = foods.find(f => f._id === foodId);
        if (!item) {
            alert('Item not found. Please refresh the page.');
            return;
        }
        cart.push({
            _id: item._id,
            name: item.name,
            price: item.price,
            quantity: 1,
            restaurantId: restaurantId  // store restaurantId with item
        });
    }

    saveCart(cart);
    updateCartCount();
    alert('Item added to cart!');
}
