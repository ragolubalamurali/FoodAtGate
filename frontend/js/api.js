// API Configuration & Helper
const API_BASE = 'http://localhost:5000/api';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Save token to localStorage
function saveToken(token) {
    localStorage.setItem('token', token);
}

// Remove token
function removeToken() {
    localStorage.removeItem('token');
}

// Save user data to localStorage (for quick access without API call)
function saveUserData(user) {
    localStorage.setItem('userData', JSON.stringify(user));
}

// Get cached user data
function getCachedUser() {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
}

// Remove user data
function removeUserData() {
    localStorage.removeItem('userData');
}

// Generic API call helper
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error.message);
        throw error;
    }
}

// ===== AUTH API =====
async function apiRegister(name, email, password) {
    const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    });
    saveToken(data.token);
    saveUserData(data.user);
    return data;
}

async function apiLogin(email, password) {
    const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    saveToken(data.token);
    saveUserData(data.user);
    return data;
}

async function apiGetMe() {
    const data = await apiCall('/auth/me');
    saveUserData(data);
    return data;
}

async function apiUpdateProfile(name, email) {
    const data = await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email })
    });
    saveUserData(data);
    return data;
}

async function apiChangePassword(currentPassword, newPassword) {
    return await apiCall('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
    });
}

async function apiGetStats() {
    return await apiCall('/auth/stats');
}

// ===== FOOD API =====
async function apiGetFoods(category, restaurantId) {
    let queryParams = new URLSearchParams();
    if (category && category !== 'all') {
        queryParams.append('category', category);
    }
    if (restaurantId) {
        queryParams.append('restaurantId', restaurantId);
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await apiCall(`/foods${query}`);
}

async function apiCreateFood(foodData) {
    return await apiCall('/foods', {
        method: 'POST',
        body: JSON.stringify(foodData)
    });
}

async function apiUpdateFood(id, foodData) {
    return await apiCall(`/foods/${id}`, {
        method: 'PUT',
        body: JSON.stringify(foodData)
    });
}

async function apiDeleteFood(id) {
    return await apiCall(`/foods/${id}`, {
        method: 'DELETE'
    });
}

// ===== ORDER API =====
async function apiCreateOrder(orderData) {
    return await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
}

async function apiGetMyOrders() {
    return await apiCall('/orders/my');
}

async function apiGetAllOrders() {
    return await apiCall('/orders');
}

async function apiUpdateOrderStatus(id, status) {
    return await apiCall(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
}

// ===== RESTAURANT API =====
async function apiGetRestaurants() {
    return await apiCall('/restaurants');
}

async function apiGetRestaurantById(id) {
    return await apiCall(`/restaurants/${id}`);
}

async function apiCreateRestaurant(restaurantData) {
    return await apiCall('/restaurants', {
        method: 'POST',
        body: JSON.stringify(restaurantData)
    });
}

async function apiUpdateRestaurant(id, restaurantData) {
    return await apiCall(`/restaurants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(restaurantData)
    });
}

async function apiDeleteRestaurant(id) {
    return await apiCall(`/restaurants/${id}`, {
        method: 'DELETE'
    });
}

async function apiToggleRestaurant(id) {
    return await apiCall(`/restaurants/${id}/toggle`, {
        method: 'PUT'
    });
}
