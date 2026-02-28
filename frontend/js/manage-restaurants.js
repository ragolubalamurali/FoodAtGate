// Manage restaurants functionality (Admin) — with food items integration
document.addEventListener('DOMContentLoaded', function () {
    loadRestaurants();

    // Restaurant modal
    const addBtn = document.getElementById('add-restaurant-btn');
    const modal = document.getElementById('restaurant-modal');
    const form = document.getElementById('restaurant-form');
    const cancelBtn = document.getElementById('restaurant-cancel-btn');

    addBtn.addEventListener('click', () => {
        document.getElementById('restaurant-modal-title').textContent = 'Add Restaurant';
        document.getElementById('restaurant-id').value = '';
        document.getElementById('food-items-section').style.display = 'none';
        form.reset();
        modal.classList.add('show');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveRestaurant();
    });

    // Food modal
    const foodForm = document.getElementById('food-form');
    const foodCancelBtn = document.getElementById('food-cancel-btn');

    foodCancelBtn.addEventListener('click', () => {
        document.getElementById('food-modal').classList.remove('show');
    });

    foodForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveFoodItem();
    });

    // Add food item button
    const addFoodBtn = document.getElementById('add-food-item-btn');
    if (addFoodBtn) {
        addFoodBtn.addEventListener('click', () => {
            const restaurantId = document.getElementById('restaurant-id').value;
            if (!restaurantId) return;
            openFoodModal(restaurantId);
        });
    }
});

async function loadRestaurants() {
    const container = document.getElementById('restaurants-container');
    container.innerHTML = '<div class="loading-spinner">Loading restaurants...</div>';

    try {
        const restaurants = await apiGetRestaurants();
        container.innerHTML = '';

        if (restaurants.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🏪</span>
                    <p>No restaurants yet. Click "Add New Restaurant" to get started!</p>
                </div>`;
            return;
        }

        restaurants.forEach(rest => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div style="font-size: 42px; margin-bottom: 10px;">🏪</div>
                <h3>${rest.name}</h3>
                <p>📍 ${rest.location}</p>
                <p>📞 ${rest.contact}</p>
                <div class="status">
                    <span class="status-badge ${rest.isActive ? 'ready' : 'pending'}">
                        ${rest.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm" onclick="editRestaurant('${rest._id}')">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn-outline" onclick="toggleRestaurant('${rest._id}')">
                        ${rest.isActive ? '⏸ Deactivate' : '▶ Activate'}
                    </button>
                    <button class="btn-danger-sm" onclick="deleteRestaurant('${rest._id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        window._adminRestaurants = restaurants;
    } catch (error) {
        container.innerHTML = '<div class="empty-state"><p>Failed to load restaurants. Please try again.</p></div>';
        console.error('Error loading restaurants:', error);
    }
}

async function editRestaurant(id) {
    const restaurants = window._adminRestaurants || [];
    const rest = restaurants.find(r => r._id === id);
    if (!rest) return;

    document.getElementById('restaurant-modal-title').textContent = 'Edit Restaurant';
    document.getElementById('restaurant-id').value = rest._id;
    document.getElementById('restaurant-name').value = rest.name;
    document.getElementById('restaurant-location').value = rest.location;
    document.getElementById('restaurant-contact').value = rest.contact;

    // Show food items section and load foods for this restaurant
    document.getElementById('food-items-section').style.display = 'block';
    await loadFoodItemsForRestaurant(rest._id);

    document.getElementById('restaurant-modal').classList.add('show');
}

async function loadFoodItemsForRestaurant(restaurantId) {
    const container = document.getElementById('food-items-list');
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">Loading food items...</p>';

    try {
        const foods = await apiGetFoods('all', restaurantId);
        container.innerHTML = '';

        if (foods.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">No food items yet. Add one below!</p>';
            return;
        }

        foods.forEach(item => {
            const div = document.createElement('div');
            div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; margin-bottom: 8px; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border-color);';
            div.innerHTML = `
                <div>
                    <strong style="color: var(--text-primary); font-size: 14px;">${item.name}</strong>
                    <span class="category-badge ${item.category}" style="margin-left: 8px;">${item.category}</span>
                    <span style="color: var(--primary); font-weight: 600; margin-left: 8px;">₹${item.price}</span>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button type="button" class="btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="editFoodItem('${item._id}', '${restaurantId}')">Edit</button>
                    <button type="button" class="btn-danger-sm" style="padding: 4px 10px; font-size: 12px;" onclick="deleteFoodItem('${item._id}', '${restaurantId}')">Delete</button>
                </div>
            `;
            container.appendChild(div);
        });

        window._restaurantFoods = foods;
    } catch (error) {
        container.innerHTML = '<p style="color: var(--danger); font-size: 13px;">Failed to load food items.</p>';
    }
}

function openFoodModal(restaurantId, item = null) {
    const modal = document.getElementById('food-modal');
    const form = document.getElementById('food-form');

    if (item) {
        document.getElementById('food-modal-title').textContent = 'Edit Food Item';
        document.getElementById('food-id').value = item._id;
        document.getElementById('food-name').value = item.name;
        document.getElementById('food-description').value = item.description || '';
        document.getElementById('food-price').value = item.price;
        document.getElementById('food-image').value = item.image || '';
        document.getElementById('food-category').value = item.category || 'veg';
    } else {
        document.getElementById('food-modal-title').textContent = 'Add Food Item';
        document.getElementById('food-id').value = '';
        form.reset();
    }

    document.getElementById('food-restaurant-id').value = restaurantId;
    modal.classList.add('show');
}

async function editFoodItem(foodId, restaurantId) {
    const foods = window._restaurantFoods || [];
    const item = foods.find(f => f._id === foodId);
    if (item) {
        openFoodModal(restaurantId, item);
    }
}

async function deleteFoodItem(foodId, restaurantId) {
    if (confirm('Are you sure you want to delete this food item?')) {
        try {
            await apiDeleteFood(foodId);
            await loadFoodItemsForRestaurant(restaurantId);
        } catch (error) {
            alert('Failed to delete food item: ' + (error.message || 'Unknown error'));
        }
    }
}

async function saveFoodItem() {
    const id = document.getElementById('food-id').value;
    const restaurantId = document.getElementById('food-restaurant-id').value;
    const name = document.getElementById('food-name').value;
    const description = document.getElementById('food-description').value;
    const price = parseFloat(document.getElementById('food-price').value);
    const image = document.getElementById('food-image').value;
    const category = document.getElementById('food-category').value;

    const foodData = { name, description, price, image, category, restaurantId };

    try {
        if (id) {
            await apiUpdateFood(id, foodData);
        } else {
            await apiCreateFood(foodData);
        }
        document.getElementById('food-modal').classList.remove('show');
        await loadFoodItemsForRestaurant(restaurantId);
    } catch (error) {
        alert('Failed to save food item: ' + (error.message || 'Unknown error'));
    }
}

async function saveRestaurant() {
    const id = document.getElementById('restaurant-id').value;
    const name = document.getElementById('restaurant-name').value;
    const location = document.getElementById('restaurant-location').value;
    const contact = document.getElementById('restaurant-contact').value;

    const data = { name, location, contact, isActive: true };

    try {
        if (id) {
            await apiUpdateRestaurant(id, data);
        } else {
            await apiCreateRestaurant(data);
        }
        document.getElementById('restaurant-modal').classList.remove('show');
        loadRestaurants();
    } catch (error) {
        alert('Failed to save restaurant: ' + (error.message || 'Unknown error'));
    }
}

async function toggleRestaurant(id) {
    try {
        await apiToggleRestaurant(id);
        loadRestaurants();
    } catch (error) {
        alert('Failed to toggle restaurant: ' + (error.message || 'Unknown error'));
    }
}

async function deleteRestaurant(id) {
    if (confirm('Are you sure you want to delete this restaurant? This will also delete all its food items.')) {
        try {
            await apiDeleteRestaurant(id);
            loadRestaurants();
        } catch (error) {
            alert('Failed to delete restaurant: ' + (error.message || 'Unknown error'));
        }
    }
}
