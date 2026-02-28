// Manage menu functionality (Admin)
document.addEventListener('DOMContentLoaded', async function () {
    await loadRestaurantsToDropdown();
    loadMenuItems();

    const addBtn = document.getElementById('add-item-btn');
    const modal = document.getElementById('item-modal');
    const form = document.getElementById('item-form');
    const cancelBtn = document.getElementById('cancel-btn');

    addBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add Item';
        document.getElementById('item-id').value = '';
        form.reset();
        modal.classList.add('show');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveItem();
    });
});

async function loadRestaurantsToDropdown() {
    try {
        const restaurants = await apiGetRestaurants();
        const select = document.getElementById('item-restaurant');
        if (select) {
            select.innerHTML = '<option value="">Select a restaurant</option>';
            restaurants.forEach(rest => {
                const opt = document.createElement('option');
                opt.value = rest._id;
                opt.textContent = `${rest.name} (${rest.location})`;
                select.appendChild(opt);
            });
        }
        window._adminRestaurants = restaurants;
    } catch (error) {
        console.error('Failed to load restaurants for dropdown:', error);
    }
}

async function loadMenuItems() {
    const container = document.getElementById('menu-container');
    container.innerHTML = '<div class="loading-spinner">Loading menu...</div>';

    try {
        const foods = await apiGetFoods();
        container.innerHTML = '';

        if (foods.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🍽️</span>
                    <p>No menu items yet. Click "Add New Item" to get started!</p>
                </div>`;
            return;
        }

        foods.forEach(item => {
            const restaurantName = item.restaurantId ? item.restaurantId.name : 'Unassigned';
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
                <div class="price">₹${item.price}</div>
                <p>
                    <span class="category-badge ${item.category}">${item.category}</span>
                </p>
                <p><small>🏪 ${restaurantName}</small></p>
                <div class="card-actions">
                    <button class="btn btn-sm" onclick="editItem('${item._id}')">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn-danger-sm" onclick="deleteItem('${item._id}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        window._adminFoods = foods;
    } catch (error) {
        container.innerHTML = '<div class="empty-state"><p>Failed to load menu. Please try again.</p></div>';
        console.error('Error loading menu:', error);
    }
}

function editItem(id) {
    const foods = window._adminFoods || [];
    const item = foods.find(f => f._id === id);
    if (!item) return;

    document.getElementById('modal-title').textContent = 'Edit Item';
    document.getElementById('item-id').value = item._id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-description').value = item.description || '';
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-image').value = item.image || '';

    const categoryEl = document.getElementById('item-category');
    if (categoryEl) {
        categoryEl.value = item.category || 'veg';
    }

    const restaurantEl = document.getElementById('item-restaurant');
    if (restaurantEl && item.restaurantId) {
        restaurantEl.value = item.restaurantId._id || item.restaurantId;
    }

    document.getElementById('item-modal').classList.add('show');
}

async function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            await apiDeleteFood(id);
            loadMenuItems();
        } catch (error) {
            alert('Failed to delete item: ' + (error.message || 'Unknown error'));
        }
    }
}

async function saveItem() {
    const id = document.getElementById('item-id').value;
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const image = document.getElementById('item-image').value;

    const categoryEl = document.getElementById('item-category');
    const category = categoryEl ? categoryEl.value : 'veg';

    const restaurantEl = document.getElementById('item-restaurant');
    const restaurantId = restaurantEl ? restaurantEl.value : null;

    if (!restaurantId) {
        alert('Please select a restaurant');
        return;
    }

    const foodData = { name, description, price, image, category, restaurantId };

    try {
        if (id) {
            await apiUpdateFood(id, foodData);
        } else {
            await apiCreateFood(foodData);
        }
        document.getElementById('item-modal').classList.remove('show');
        loadMenuItems();
    } catch (error) {
        alert('Failed to save item: ' + (error.message || 'Unknown error'));
    }
}
