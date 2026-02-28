// Orders page functionality
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    loadOrders();
});

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Pending': return 'pending';
        case 'Preparing': return 'preparing';
        case 'Ready': return 'ready';
        case 'Delivered': return 'delivered';
        default: return 'pending';
    }
}

async function loadOrders() {
    const container = document.getElementById('orders-container');
    container.innerHTML = '<div class="loading-spinner">Loading orders...</div>';

    try {
        const orders = await apiGetMyOrders();

        container.innerHTML = '';

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📦</span>
                    <p>No orders yet. Browse the <a href="menu.html" class="auth-link">menu</a> to place your first order!</p>
                </div>`;
            return;
        }

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';

            const restaurantName = order.restaurantId ? order.restaurantId.name : 'Unknown Restaurant';

            const itemsList = order.items.map(item => {
                const foodName = item.foodId ? item.foodId.name : 'Unknown Item';
                const foodPrice = item.foodId ? item.foodId.price : 0;
                return `<li>${foodName} × ${item.quantity} — ₹${foodPrice * item.quantity}</li>`;
            }).join('');

            orderCard.innerHTML = `
                <h3>
                    <span style="color: var(--primary);">#${order._id.slice(-6).toUpperCase()}</span>
                    <span class="status-badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
                </h3>
                <p><strong>Restaurant:</strong> ${restaurantName}</p>
                <p><strong>Items:</strong></p>
                <ul>${itemsList}</ul>
                <p><strong>Total:</strong> <span style="color: var(--primary); font-weight: 700;">₹${order.totalAmount}</span></p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            `;
            container.appendChild(orderCard);
        });
    } catch (error) {
        container.innerHTML = '<div class="empty-state"><p>Failed to load orders. Please try again.</p></div>';
        console.error('Error loading orders:', error);
    }
}
