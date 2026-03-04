// Cart page functionality
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    loadCart();

    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
});

function loadCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');

    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-cart-shopping"></i>
                <p>Your cart is empty. Browse the <a href="menu.html" class="auth-link">menu</a> to add items!</p>
            </div>`;
        totalEl.textContent = '0';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>₹${item.price} × ${item.quantity} = <strong style="color: var(--primary);">₹${itemTotal}</strong></p>
            </div>
            <div class="cart-item-actions">
                <button onclick="updateQuantity(${index}, -1)">−</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)">+</button>
                <button class="btn-remove" onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;
        container.appendChild(cartItem);
    });

    totalEl.textContent = total;
}

function updateQuantity(index, change) {
    let cart = getCart();
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart(cart);
        loadCart();
        updateCartCount();
    }
}

function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    loadCart();
    updateCartCount();
}

async function placeOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Pre-fill from profile data
    try {
        const user = await apiGetMe();
        document.getElementById('delivery-phone').value = user.phone || '';
        document.getElementById('delivery-address').value = user.address || '';
    } catch (e) {
        // If API fails, still show modal with empty fields
    }

    // Show the delivery details modal
    document.getElementById('delivery-modal').style.display = 'flex';
}

// Close modal handlers
document.getElementById('modal-close-btn').addEventListener('click', function () {
    document.getElementById('delivery-modal').style.display = 'none';
});

document.getElementById('modal-cancel-btn').addEventListener('click', function () {
    document.getElementById('delivery-modal').style.display = 'none';
});

// Click outside modal to close
document.getElementById('delivery-modal').addEventListener('click', function (e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});

// Delivery form submit — actually place the order
document.getElementById('delivery-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const phone = document.getElementById('delivery-phone').value.trim();
    const address = document.getElementById('delivery-address').value.trim();

    if (!phone) {
        alert('Please enter your phone number');
        return;
    }

    if (!address) {
        alert('Please enter your delivery address');
        return;
    }

    const cart = getCart();

    // Build order data for backend
    const orderData = {
        restaurantId: cart[0].restaurantId,
        items: cart.map(item => ({
            foodId: item._id,
            quantity: item.quantity
        })),
        totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        phone: phone,
        address: address
    };

    try {
        await apiCreateOrder(orderData);
        clearCart();
        document.getElementById('delivery-modal').style.display = 'none';
        alert('Order placed successfully!');
        window.location.href = 'orders.html';
    } catch (error) {
        alert('Failed to place order: ' + (error.message || 'Unknown error'));
    }
});
