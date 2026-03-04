// Authentication functions
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = getCurrentUser();
    const isAdminPage = window.location.pathname.includes('admin') ||
        window.location.pathname.includes('manage');

    if (isAdminPage && (!currentUser || currentUser.role !== 'admin')) {
        window.location.href = 'login.html';
    }

    updateNavbar();
});

function updateNavbar() {
    const currentUser = getCurrentUser();
    const navs = document.querySelectorAll('nav');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navs.forEach(nav => {
        // Clear existing dynamic links
        nav.innerHTML = '';

        if (currentUser) {
            if (currentUser.role === 'student') {
                const baseLinks = [
                    { href: 'index.html', text: 'Home', icon: 'fa-home' },
                    { href: 'menu.html', text: 'Menu', icon: 'fa-utensils' },
                    { href: 'cart.html', html: '<i class="fa-solid fa-cart-shopping"></i> Cart (<span class="nav-cart-count">0</span>)' },
                    { href: 'orders.html', text: 'Orders', icon: 'fa-box' },
                    { href: 'profile.html', text: 'Profile', icon: 'fa-user' }
                ];

                baseLinks.forEach(link => {
                    const a = document.createElement('a');
                    a.href = link.href;
                    if (link.html) {
                        a.innerHTML = link.html;
                    } else {
                        a.textContent = link.text;
                    }
                    if (currentPage === link.href) {
                        a.classList.add('active');
                    }
                    nav.appendChild(a);
                });
            }

            if (currentUser.role === 'admin') {
                const adminLinks = [
                    { href: 'admin.html', text: 'Dashboard' },
                    { href: 'manage-restaurants.html', text: 'Restaurants' },
                    { href: 'manage-menu.html', text: 'Menu' },
                    { href: 'manage-orders.html', text: 'Orders' },
                    { href: 'profile.html', text: 'Profile' }
                ];

                adminLinks.forEach(link => {
                    const a = document.createElement('a');
                    a.href = link.href;
                    a.textContent = link.text;
                    if (currentPage === link.href) {
                        a.classList.add('active');
                    }
                    nav.appendChild(a);
                });
            }
        } else {
            const publicLinks = [
                { href: 'index.html', text: 'Home' },
                { href: 'register.html', text: 'Register', className: 'register-link' },
                { href: 'login.html', text: 'Login', className: 'login-link' }
            ];

            publicLinks.forEach(link => {
                const a = document.createElement('a');
                a.href = link.href;
                a.textContent = link.text;
                if (link.className) a.className = link.className;
                if (currentPage === link.href) {
                    a.classList.add('active');
                }
                nav.appendChild(a);
            });
        }
    });

    // Update hero buttons
    const heroButtons = document.getElementById('hero-buttons');
    const heroLoggedIn = document.getElementById('hero-logged-in');
    if (heroButtons && heroLoggedIn) {
        if (currentUser) {
            heroButtons.style.display = 'none';
            heroLoggedIn.style.display = 'block';
        } else {
            heroButtons.style.display = 'flex';
            heroLoggedIn.style.display = 'none';
        }
    }
}

// Register form handler
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        const messageEl = document.getElementById('register-message');

        // Validate email domain
        const emailDomain = email.split('@')[1];
        if (!emailDomain || emailDomain.toLowerCase() !== 'srisivani.com') {
            messageEl.textContent = 'Only @srisivani.com email addresses are allowed to register';
            messageEl.style.color = 'var(--danger)';
            return;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            messageEl.textContent = 'Passwords do not match';
            messageEl.style.color = 'var(--danger)';
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            messageEl.textContent = 'Password must be at least 6 characters long';
            messageEl.style.color = 'var(--danger)';
            return;
        }

        try {
            await apiRegister(name, email, password);
            messageEl.textContent = 'Registration successful! Redirecting...';
            messageEl.style.color = 'var(--success)';
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1500);
        } catch (error) {
            messageEl.textContent = error.message || 'Registration failed';
            messageEl.style.color = 'var(--danger)';
        }
    });
}

// Login form handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const messageEl = document.getElementById('login-message');

        try {
            const data = await apiLogin(email, password);
            const user = data.user;
            window.location.href = user.role === 'admin' ? 'admin.html' : 'menu.html';
        } catch (error) {
            messageEl.textContent = error.message || 'Invalid credentials';
            messageEl.style.color = 'var(--danger)';
        }
    });
}
