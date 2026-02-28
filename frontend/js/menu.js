// Menu page functionality
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Load restaurants by default
    loadRestaurants();

    // Back to restaurants button
    const backBtn = document.getElementById('back-to-restaurants-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function () {
            document.getElementById('food-view').style.display = 'none';
            document.getElementById('restaurant-view').style.display = 'block';
            window._selectedRestaurantId = null;
        });
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterAndDisplay();
        });
    }

    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterAndDisplay();
        });
    });
});

window._loadedFoods = [];
window._selectedRestaurantId = null;

async function loadRestaurants() {
    const container = document.getElementById('restaurants-container');
    if (!container) return;

    container.innerHTML = '<div class="loading-spinner">Loading restaurants...</div>';

    try {
        const restaurants = await apiGetRestaurants();
        // Filter only active restaurants for students
        const activeRestaurants = restaurants.filter(r => r.isActive);
        container.innerHTML = '';

        if (activeRestaurants.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🏪</span>
                    <p>No restaurants available right now.</p>
                </div>`;
            return;
        }

        activeRestaurants.forEach(rest => {
            const card = document.createElement('div');
            card.className = 'card restaurant-card';
            card.onclick = () => selectRestaurant(rest._id, rest.name);
            card.innerHTML = `
                <span class="restaurant-icon">🏪</span>
                <h3>${rest.name}</h3>
                <p>📍 ${rest.location}</p>
                <div class="status">
                    <span class="status-badge ready">Open</span>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = '<div class="empty-state"><p>Failed to load restaurants. Please try again.</p></div>';
        console.error('Error loading restaurants:', error);
    }
}

async function selectRestaurant(id, name) {
    document.getElementById('restaurant-view').style.display = 'none';
    document.getElementById('food-view').style.display = 'block';
    document.getElementById('selected-restaurant-name').textContent = `Menu for: ${name}`;
    window._selectedRestaurantId = id;

    // reset search and filters
    document.getElementById('search-input').value = '';
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');

    const container = document.getElementById('menu-container');
    container.innerHTML = '<div class="loading-spinner">Loading menu...</div>';

    try {
        const foods = await apiGetFoods('all', id);
        window._loadedFoods = foods;
        filterAndDisplay();
    } catch (error) {
        container.innerHTML = '<div class="empty-state"><p>Failed to load menu. Please try again.</p></div>';
        console.error('Error loading menu:', error);
    }
}

function filterAndDisplay() {
    const container = document.getElementById('menu-container');
    if (!container) return;

    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const activeBtn = document.querySelector('.filter-btn.active');
    const filterType = activeBtn ? activeBtn.dataset.filter : 'all';

    let filtered = window._loadedFoods;

    // Apply category filter
    if (filterType === 'veg') {
        filtered = filtered.filter(item => item.category === 'veg');
    } else if (filterType === 'non-veg') {
        filtered = filtered.filter(item => item.category === 'non-veg');
    }

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
    }

    container.innerHTML = '';

    if (filtered.length === 0) {
        const message = searchTerm || filterType !== 'all'
            ? 'No items found matching your search and filter criteria.'
            : 'No items available for this restaurant.';
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">🍽️</span><p>${message}</p></div>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${item.description || ''}</p>
            <span class="category-badge ${item.category}">${item.category === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}</span>
            <div class="price">₹${item.price}</div>
            <button class="btn btn-orange" onclick="addToCart('${item._id}', '${window._selectedRestaurantId}')">
                <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
        `;
        container.appendChild(card);
    });
}
