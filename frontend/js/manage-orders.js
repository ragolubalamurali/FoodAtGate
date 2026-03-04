// Manage orders functionality (Admin)
document.addEventListener('DOMContentLoaded', function () {
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
    const orders = await apiGetAllOrders();
    container.innerHTML = '';

    if (orders.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📦</span>
                    <p>No orders yet.</p>
                </div>`;
      return;
    }

    const groupedOrders = {};
    orders.forEach(order => {
      const restaurantName = order.restaurantId ? order.restaurantId.name : 'Unknown Restaurant';
      if (!groupedOrders[restaurantName]) {
        groupedOrders[restaurantName] = [];
      }
      groupedOrders[restaurantName].push(order);
    });

    for (const [restaurantName, restaurantOrders] of Object.entries(groupedOrders)) {
      const restaurantSection = document.createElement('div');
      restaurantSection.className = 'restaurant-group';
      restaurantSection.style.marginBottom = '40px';

      const restaurantHeader = document.createElement('h3');
      restaurantHeader.innerHTML = `<i class="fa-solid fa-utensils"></i> ${restaurantName} <span style="font-size: 14px; font-weight: normal; color: var(--text-muted);">(${restaurantOrders.length} orders)</span>`;
      restaurantHeader.style.paddingBottom = '10px';
      restaurantHeader.style.borderBottom = '2px solid var(--primary)';
      restaurantHeader.style.marginBottom = '20px';
      restaurantHeader.style.color = 'var(--text-primary)';
      restaurantSection.appendChild(restaurantHeader);

      restaurantOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';

        const userName = order.userId ? order.userId.name || order.userId.email : 'Unknown User';

        const itemsList = order.items.map(item => {
          const foodName = item.foodId ? item.foodId.name : 'Unknown Item';
          const foodPrice = item.foodId ? item.foodId.price : 0;
          return `<li>${foodName} × ${item.quantity} — ₹${foodPrice * item.quantity}</li>`;
        }).join('');

        orderCard.innerHTML = `
                  <h3>
                      <span style="color: var(--primary);">#${order._id.slice(-6).toUpperCase()}</span>
                      <span style="color: var(--text-secondary); font-weight: 400; font-size: 14px;"> — ${userName}</span>
                  </h3>
                  <p><strong>Phone:</strong> ${order.phone || (order.userId && order.userId.phone) || 'N/A'}</p>
                  <p><strong>Address:</strong> ${order.address || (order.userId && order.userId.address) || 'N/A'}</p>
                  <p><strong>Items:</strong></p>
                  <ul>${itemsList}</ul>
                  <p><strong>Total:</strong> <span style="color: var(--primary); font-weight: 700;">₹${order.totalAmount}</span></p>
                  <p style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                      <strong>Status:</strong> 
                      <select class="status-select" onchange="updateStatus('${order._id}', this.value)">
                          <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                          <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>🍳 Preparing</option>
                          <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>✅ Ready</option>
                          <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>📦 Delivered</option>
                      </select>
                  </p>
                  <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              `;
        restaurantSection.appendChild(orderCard);
      });

      container.appendChild(restaurantSection);
    }
  } catch (error) {
    container.innerHTML = '<div class="empty-state"><p>Failed to load orders. Please try again.</p></div>';
    console.error('Error loading orders:', error);
  }
}

async function updateStatus(orderId, status) {
  try {
    await apiUpdateOrderStatus(orderId, status);
    // Briefly show feedback
    const badge = document.querySelector(`select[onchange*="${orderId}"]`);
    if (badge) {
      badge.style.borderColor = 'var(--success)';
      setTimeout(() => {
        badge.style.borderColor = '';
      }, 1500);
    }
  } catch (error) {
    alert('Failed to update status: ' + (error.message || 'Unknown error'));
  }
}
