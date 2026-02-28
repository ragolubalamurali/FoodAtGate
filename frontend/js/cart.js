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

    // Build order data for backend
    const orderData = {
        restaurantId: cart[0].restaurantId,
        items: cart.map(item => ({
            foodId: item._id,
            quantity: item.quantity
        })),
        totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    try {
        await apiCreateOrder(orderData);
        clearCart();
        alert('Order placed successfully!');
        window.location.href = 'orders.html';
    } catch (error) {
        alert('Failed to place order: ' + (error.message || 'Unknown error'));
    }
}
