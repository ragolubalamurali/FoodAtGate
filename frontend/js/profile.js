// Profile page functionality
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    loadProfile();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            logout();
        });
    }
});

async function loadProfile() {
    try {
        // Fetch fresh data from backend
        const user = await apiGetMe();

        // Update profile header
        document.getElementById('user-fullname').textContent = user.name || user.email;
        document.getElementById('user-email-display').textContent = user.email || 'No email provided';

        // Set role badge
        const roleBadge = document.getElementById('user-role-badge');
        roleBadge.textContent = user.role === 'admin' ? 'Administrator' : 'Student';
        roleBadge.className = `role-badge ${user.role}`;

        // Generate user initials for avatar
        const initials = generateInitials(user.name || user.email);
        document.getElementById('user-initials').textContent = initials;

        // Set avatar background color based on role
        const avatarCircle = document.getElementById('user-avatar');
        avatarCircle.className = `avatar-circle ${user.role}`;

        // Fill form fields
        document.getElementById('profile-name').value = user.name || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-phone').value = user.phone || '';
        document.getElementById('profile-address').value = user.address || '';
        document.getElementById('profile-role').value = user.role === 'admin' ? 'Administrator' : 'Student';
    } catch (error) {
        showMessage('Failed to load profile: ' + error.message, 'error');
    }
}

function generateInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
}

// Profile form handler (Personal Information)
const profileForm = document.getElementById('profile-form');
if (profileForm) {
    profileForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('profile-name').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        const phone = document.getElementById('profile-phone').value.trim();
        const address = document.getElementById('profile-address').value.trim();

        if (!name) {
            showMessage('Please enter your full name', 'error');
            return;
        }

        if (!email) {
            showMessage('Please enter your email address', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        try {
            await apiUpdateProfile(name, email, phone, address);
            showMessage('Profile updated successfully!', 'success');
            loadProfile();
        } catch (error) {
            showMessage('Failed to update profile: ' + (error.message || 'Unknown error'), 'error');
        }
    });
}

// Password form handler
const passwordForm = document.getElementById('password-form');
if (passwordForm) {
    passwordForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const currentPassword = document.getElementById('profile-current-password').value;
        const newPassword = document.getElementById('profile-new-password').value;

        if (!currentPassword) {
            showMessage('Please enter your current password', 'error');
            return;
        }

        if (!newPassword) {
            showMessage('Please enter a new password', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showMessage('New password must be at least 6 characters long', 'error');
            return;
        }

        try {
            await apiChangePassword(currentPassword, newPassword);
            showMessage('Password updated successfully!', 'success');
            document.getElementById('profile-current-password').value = '';
            document.getElementById('profile-new-password').value = '';
        } catch (error) {
            showMessage(error.message || 'Failed to update password', 'error');
        }
    });
}

function showMessage(message, type) {
    const messageEl = document.getElementById('profile-message');
    messageEl.textContent = message;
    messageEl.className = `message-container ${type}`;

    if (type === 'success') {
        setTimeout(() => {
            messageEl.textContent = '';
            messageEl.className = 'message-container';
        }, 5000);
    }
}