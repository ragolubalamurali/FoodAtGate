// Admin dashboard functionality
document.addEventListener('DOMContentLoaded', function () {
    loadDashboard();
});

async function loadDashboard() {
    try {
        const stats = await apiGetStats();

        document.getElementById('total-orders').textContent = stats.totalOrders || 0;
        document.getElementById('pending-orders').textContent = stats.pendingOrders || 0;
        document.getElementById('menu-items').textContent = stats.menuItems || 0;
        document.getElementById('revenue').textContent = stats.revenue || 0;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}
