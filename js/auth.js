// Authentication Module
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
        this.startSessionTimer();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Navigation
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        document.getElementById('nav-logout')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Password strength indicator
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
        }

        // Session activity tracking
        document.addEventListener('click', () => this.resetSessionTimer());
        document.addEventListener('keypress', () => this.resetSessionTimer());
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const btn = document.getElementById('login-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnSpinner = btn.querySelector('.btn-spinner');
        
        // Clear previous errors
        this.clearErrors('login');
        
        // Get form data
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = document.getElementById('remember-me').checked;
        
        // Validate inputs
        if (!this.validateLoginForm(email, password)) {
            return;
        }

        // Show loading state
        btn.disabled = true;
        btnText.textContent = 'Signing In...';
        btnSpinner.classList.remove('hidden');

        try {
            const response = await apiService.login(email, password);
            
            if (response.success) {
                // Store session
                const sessionData = {
                    user: response.user,
                    token: response.token,
                    loginTime: new Date().toISOString(),
                    rememberMe
                };
                
                if (rememberMe) {
                    localStorage.setItem('authSession', JSON.stringify(sessionData));
                } else {
                    sessionStorage.setItem('authSession', JSON.stringify(sessionData));
                }
                
                this.currentUser = response.user;
                apiService.setToken(response.token);
                this.showDashboard();
                this.showToast('Login successful!', 'success');
                
                // Reset session timer
                this.resetSessionTimer();
            } else {
                this.showError('login-password', response.message || 'Invalid credentials');
            }
        } catch (error) {
            this.showError('login-password', 'Login failed. Please try again.');
            console.error('Login error:', error);
        } finally {
            // Reset button state
            btn.disabled = false;
            btnText.textContent = 'Sign In';
            btnSpinner.classList.add('hidden');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const btn = document.getElementById('register-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnSpinner = btn.querySelector('.btn-spinner');
        
        // Clear previous errors
        this.clearErrors('register');
        
        // Get form data
        const formData = new FormData(e.target);
        const userData = {
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };
        
        // Validate inputs
        if (!this.validateRegisterForm(userData)) {
            return;
        }

        // Show loading state
        btn.disabled = true;
        btnText.textContent = 'Creating Account...';
        btnSpinner.classList.remove('hidden');

        try {
            const response = await apiService.register(userData);
            
            if (response.success) {
                this.showToast('Account created successfully! Please sign in.', 'success');
                this.showLoginForm();
                
                // Pre-fill login email
                document.getElementById('login-email').value = userData.email;
            } else {
                this.showError('register-email', response.message || 'Registration failed');
            }
        } catch (error) {
            this.showError('register-email', 'Registration failed. Please try again.');
            console.error('Registration error:', error);
        } finally {
            // Reset button state
            btn.disabled = false;
            btnText.textContent = 'Create Account';
            btnSpinner.classList.add('hidden');
        }
    }

    validateLoginForm(email, password) {
        let isValid = true;
        
        if (!ValidationService.isValidEmail(email)) {
            this.showError('login-email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!password || password.length < 6) {
            this.showError('login-password', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        return isValid;
    }

    validateRegisterForm(userData) {
        let isValid = true;
        
        // First name validation
        if (!userData.firstname || userData.firstname.length < 2) {
            this.showError('register-firstname', 'First name must be at least 2 characters');
            isValid = false;
        }
        
        // Last name validation
        if (!userData.lastname || userData.lastname.length < 2) {
            this.showError('register-lastname', 'Last name must be at least 2 characters');
            isValid = false;
        }
        
        // Email validation
        if (!ValidationService.isValidEmail(userData.email)) {
            this.showError('register-email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Password validation
        const passwordStrength = ValidationService.getPasswordStrength(userData.password);
        if (passwordStrength.score < 2) {
            this.showError('register-password', 'Password is too weak. ' + passwordStrength.feedback);
            isValid = false;
        }
        
        // Confirm password validation
        if (userData.password !== userData.confirmPassword) {
            this.showError('register-confirm', 'Passwords do not match');
            isValid = false;
        }
        
        return isValid;
    }

    updatePasswordStrength(password) {
        const strength = ValidationService.getPasswordStrength(password);
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');
        
        if (strengthFill && strengthText) {
            strengthFill.className = `strength-fill ${strength.level}`;
            strengthText.textContent = `Password strength: ${strength.level.charAt(0).toUpperCase() + strength.level.slice(1)}`;
        }
    }

    checkExistingSession() {
        const sessionData = localStorage.getItem('authSession') || sessionStorage.getItem('authSession');
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                const loginTime = new Date(session.loginTime);
                const now = new Date();
                const timeDiff = now - loginTime;
                
                // Check if session is still valid (24 hours for remember me, 30 minutes otherwise)
                const maxAge = session.rememberMe ? 24 * 60 * 60 * 1000 : this.sessionTimeout;
                
                if (timeDiff < maxAge) {
                    this.currentUser = session.user;
                    apiService.setToken(session.token);
                    this.showDashboard();
                    this.resetSessionTimer();
                } else {
                    this.clearSession();
                }
            } catch (error) {
                this.clearSession();
            }
        }
    }

    startSessionTimer() {
        this.sessionTimer = setTimeout(() => {
            this.showToast('Session expired. Please log in again.', 'warning');
            this.logout();
        }, this.sessionTimeout);
    }

    resetSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        if (this.currentUser) {
            this.startSessionTimer();
        }
    }

    logout() {
        this.clearSession();
        this.showLoginForm();
        this.showToast('You have been logged out successfully', 'success');
    }

    clearSession() {
        this.currentUser = null;
        apiService.setToken(null);
        localStorage.removeItem('authSession');
        sessionStorage.removeItem('authSession');
        
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    showLoginForm() {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('register-page').classList.add('hidden');
        document.getElementById('dashboard-page').classList.add('hidden');
        document.getElementById('profile-page').classList.add('hidden');
        document.getElementById('analytics-page').classList.add('hidden');
        document.getElementById('navbar').classList.add('hidden');
        
        // Clear forms
        document.getElementById('login-form').reset();
        this.clearErrors('login');
    }

    showRegisterForm() {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('register-page').classList.remove('hidden');
        document.getElementById('dashboard-page').classList.add('hidden');
        document.getElementById('profile-page').classList.add('hidden');
        document.getElementById('analytics-page').classList.add('hidden');
        document.getElementById('navbar').classList.add('hidden');
        
        // Clear forms
        document.getElementById('register-form').reset();
        this.clearErrors('register');
        
        // Reset password strength indicator
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');
        if (strengthFill && strengthText) {
            strengthFill.className = 'strength-fill';
            strengthText.textContent = 'Password strength';
        }
    }

    showDashboard() {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('register-page').classList.add('hidden');
        document.getElementById('dashboard-page').classList.remove('hidden');
        document.getElementById('profile-page').classList.add('hidden');
        document.getElementById('analytics-page').classList.add('hidden');
        document.getElementById('navbar').classList.remove('hidden');
        
        // Show dashboard page through app
        if (window.app) {
            window.app.showPage('dashboard');
        }
    }

    showError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearErrors(formType) {
        const errorElements = document.querySelectorAll(`#${formType}-page .error-message`);
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        // Remove toast after 5 seconds for warning messages, 4 seconds for others
        const duration = type === 'warning' ? 5000 : 4000;
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    // Public methods for role-based access
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    hasAnyRole(roles) {
        return this.currentUser && roles.includes(this.currentUser.role);
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateCurrentUser(userData) {
        this.currentUser = userData;
        
        // Update session storage
        const sessionData = localStorage.getItem('authSession') || sessionStorage.getItem('authSession');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                session.user = userData;
                
                if (session.rememberMe) {
                    localStorage.setItem('authSession', JSON.stringify(session));
                } else {
                    sessionStorage.setItem('authSession', JSON.stringify(session));
                }
            } catch (error) {
                console.error('Error updating session:', error);
            }
        }
    }
}