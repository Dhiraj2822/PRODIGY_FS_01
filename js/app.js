// Main Application Controller
class App {
    constructor() {
        this.auth = new AuthSystem();
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        // Hide loading screen after a brief delay
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1500);

        this.setupGlobalEventListeners();
        this.setupPageNavigation();
    }

    setupGlobalEventListeners() {
        // Dashboard card interactions
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', () => {
                this.handleDashboardCardClick(card);
            });
        });

        // Security: Clear sensitive data on page unload
        window.addEventListener('beforeunload', () => {
            this.clearSensitiveData();
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (!this.auth.isAuthenticated()) {
                this.auth.showLoginForm();
            }
        });
    }

    setupPageNavigation() {
        // Dashboard navigation
        document.getElementById('nav-dashboard')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('dashboard');
        });

        // Analytics navigation
        document.getElementById('nav-analytics')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('analytics');
        });

        document.getElementById('nav-profile')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('profile');
        });

        // Profile form handlers
        this.setupProfileFormHandlers();
    }

    setupProfileFormHandlers() {
        // Profile edit form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // Cancel profile edit
        const cancelBtn = document.getElementById('cancel-profile-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.resetProfileForm());
        }

        // Password change form
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        }

        // Password strength for new password
        const newPasswordInput = document.getElementById('new-password');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', (e) => this.updateNewPasswordStrength(e.target.value));
        }
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.main-page').forEach(page => {
            page.classList.add('hidden');
        });

        // Show selected page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeNavLink = document.getElementById(`nav-${pageName}`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }

        this.currentPage = pageName;

        // Load page-specific data
        if (pageName === 'profile') {
            this.loadProfileData();
        } else if (pageName === 'dashboard') {
            this.loadDashboardData();
        } else if (pageName === 'analytics') {
            this.loadAnalyticsData();
        }
    }

    loadDashboardData() {
        if (!this.auth.isAuthenticated()) return;

        const user = this.auth.getCurrentUser();
        
        // Update welcome message
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome back, ${user.firstname}!`;
        }

        // Update login time
        const loginTime = document.getElementById('login-time');
        if (loginTime) {
            loginTime.textContent = new Date().toLocaleString();
        }

        // Show/hide admin/moderator panel based on role
        const adminPanel = document.getElementById('admin-panel-card');
        if (adminPanel) {
            if (user.role === 'admin') {
                adminPanel.style.display = 'block';
                adminPanel.querySelector('h3').textContent = 'Admin Panel';
                adminPanel.querySelector('p').textContent = 'Full system management';
                adminPanel.querySelector('.stat-icon').textContent = '⚙️';
            } else if (user.role === 'moderator') {
                adminPanel.style.display = 'block';
                adminPanel.querySelector('h3').textContent = 'Moderator Panel';
                adminPanel.querySelector('p').textContent = 'User management tools';
                adminPanel.querySelector('.stat-icon').textContent = '🛡️';
            } else {
                adminPanel.style.display = 'none';
            }
        }
    }

    async loadAnalyticsData() {
        if (!this.auth.isAuthenticated()) return;

        const user = this.auth.getCurrentUser();
        
        // Show/hide admin analytics based on role
        const adminAnalyticsCard = document.getElementById('admin-analytics-card');
        if (adminAnalyticsCard) {
            if (user.role === 'admin' || user.role === 'moderator') {
                adminAnalyticsCard.style.display = 'block';
                
                // Update card title for moderators
                if (user.role === 'moderator') {
                    const cardTitle = adminAnalyticsCard.querySelector('h3');
                    if (cardTitle) {
                        cardTitle.textContent = 'User Overview';
                    }
                }
                
                // Load user count for admin/moderator
                try {
                    const response = await apiService.getAllUsers();
                    if (response.success) {
                        const totalUsersElement = document.getElementById('total-users');
                        const userGrowthElement = document.getElementById('user-growth');
                        
                        if (totalUsersElement) {
                            totalUsersElement.textContent = response.users.length;
                        }
                        
                        if (userGrowthElement) {
                            const recentUsers = response.users.filter(u => {
                                const createdDate = new Date(u.createdAt);
                                const weekAgo = new Date();
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                return createdDate > weekAgo;
                            }).length;
                            
                            userGrowthElement.textContent = recentUsers > 0 
                                ? `+${recentUsers} this week` 
                                : 'No new users this week';
                        }
                    }
                } catch (error) {
                    console.error('Failed to load user analytics:', error);
                }
            } else {
                adminAnalyticsCard.style.display = 'none';
            }
        }

        // Update other analytics with mock data
        this.updateAnalyticsMetrics();
    }

    updateAnalyticsMetrics() {
        // Generate some realistic mock data
        const loginCount = Math.floor(Math.random() * 20) + 5;
        const avgSession = Math.floor(Math.random() * 30) + 15;
        const securityScore = Math.floor(Math.random() * 10) + 90;

        const loginCountElement = document.getElementById('login-count');
        const avgSessionElement = document.getElementById('avg-session');
        const securityScoreElement = document.getElementById('security-score');

        if (loginCountElement) loginCountElement.textContent = loginCount;
        if (avgSessionElement) avgSessionElement.textContent = `${avgSession}m`;
        if (securityScoreElement) securityScoreElement.textContent = `${securityScore}%`;
    }

    loadProfileData() {
        if (!this.auth.isAuthenticated()) return;

        const user = this.auth.getCurrentUser();
        
        // Update profile display
        const profileInitials = document.getElementById('profile-initials');
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileRole = document.getElementById('profile-role');
        const memberSince = document.getElementById('member-since');
        const lastLogin = document.getElementById('last-login');

        if (profileInitials) {
            profileInitials.textContent = `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`;
        }
        
        if (profileName) {
            profileName.textContent = `${user.firstname} ${user.lastname}`;
        }
        
        if (profileEmail) {
            profileEmail.textContent = user.email;
        }
        
        if (profileRole) {
            profileRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
            profileRole.className = `role-badge ${user.role}`;
        }

        if (memberSince) {
            memberSince.textContent = new Date(user.createdAt).toLocaleDateString();
        }

        if (lastLogin) {
            lastLogin.textContent = new Date().toLocaleString();
        }

        // Populate edit form
        const editFirstname = document.getElementById('edit-firstname');
        const editLastname = document.getElementById('edit-lastname');
        const editEmail = document.getElementById('edit-email');

        if (editFirstname) editFirstname.value = user.firstname;
        if (editLastname) editLastname.value = user.lastname;
        if (editEmail) editEmail.value = user.email;
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const btn = document.getElementById('save-profile-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnSpinner = btn.querySelector('.btn-spinner');
        
        // Clear previous errors
        this.clearProfileErrors();
        
        // Get form data
        const formData = new FormData(e.target);
        const updateData = {
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname')
        };
        
        // Validate inputs
        if (!this.validateProfileUpdate(updateData)) {
            return;
        }

        // Show loading state
        btn.disabled = true;
        btnText.textContent = 'Saving...';
        btnSpinner.classList.remove('hidden');

        try {
            const response = await apiService.updateProfile(updateData);
            
            if (response.success) {
                // Update current user data
                const currentUser = this.auth.getCurrentUser();
                currentUser.firstname = updateData.firstname;
                currentUser.lastname = updateData.lastname;
                
                // Update session storage
                this.auth.updateCurrentUser(currentUser);
                
                // Refresh profile display
                this.loadProfileData();
                
                this.auth.showToast('Profile updated successfully!', 'success');
            } else {
                this.showProfileError('edit-firstname', response.message || 'Failed to update profile');
            }
        } catch (error) {
            this.showProfileError('edit-firstname', 'Failed to update profile. Please try again.');
            console.error('Profile update error:', error);
        } finally {
            // Reset button state
            btn.disabled = false;
            btnText.textContent = 'Save Changes';
            btnSpinner.classList.add('hidden');
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        
        const btn = document.getElementById('change-password-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnSpinner = btn.querySelector('.btn-spinner');
        
        // Clear previous errors
        this.clearPasswordErrors();
        
        // Get form data
        const formData = new FormData(e.target);
        const passwordData = {
            currentPassword: formData.get('currentPassword'),
            newPassword: formData.get('newPassword'),
            confirmNewPassword: formData.get('confirmNewPassword')
        };
        
        // Validate inputs
        if (!this.validatePasswordChange(passwordData)) {
            return;
        }

        // Show loading state
        btn.disabled = true;
        btnText.textContent = 'Changing...';
        btnSpinner.classList.remove('hidden');

        try {
            const response = await apiService.changePassword(passwordData.currentPassword, passwordData.newPassword);
            
            if (response.success) {
                this.auth.showToast('Password changed successfully!', 'success');
                
                // Reset form
                document.getElementById('password-form').reset();
                this.resetPasswordStrength();
            } else {
                this.showPasswordError('current-password', response.message || 'Failed to change password');
            }
        } catch (error) {
            this.showPasswordError('current-password', 'Failed to change password. Please try again.');
            console.error('Password change error:', error);
        } finally {
            // Reset button state
            btn.disabled = false;
            btnText.textContent = 'Change Password';
            btnSpinner.classList.add('hidden');
        }
    }

    validateProfileUpdate(data) {
        let isValid = true;
        
        if (!data.firstname || data.firstname.length < 2) {
            this.showProfileError('edit-firstname', 'First name must be at least 2 characters');
            isValid = false;
        }
        
        if (!data.lastname || data.lastname.length < 2) {
            this.showProfileError('edit-lastname', 'Last name must be at least 2 characters');
            isValid = false;
        }
        
        return isValid;
    }

    validatePasswordChange(data) {
        let isValid = true;
        
        if (!data.currentPassword) {
            this.showPasswordError('current-password', 'Current password is required');
            isValid = false;
        }
        
        const passwordStrength = ValidationService.getPasswordStrength(data.newPassword);
        if (passwordStrength.score < 2) {
            this.showPasswordError('new-password', 'Password is too weak. ' + passwordStrength.feedback);
            isValid = false;
        }
        
        if (data.newPassword !== data.confirmNewPassword) {
            this.showPasswordError('confirm-new-password', 'Passwords do not match');
            isValid = false;
        }
        
        return isValid;
    }

    updateNewPasswordStrength(password) {
        const strength = ValidationService.getPasswordStrength(password);
        const strengthFill = document.getElementById('new-strength-fill');
        const strengthText = document.getElementById('new-strength-text');
        
        if (strengthFill && strengthText) {
            strengthFill.className = `strength-fill ${strength.level}`;
            strengthText.textContent = `Password strength: ${strength.level.charAt(0).toUpperCase() + strength.level.slice(1)}`;
        }
    }

    resetPasswordStrength() {
        const strengthFill = document.getElementById('new-strength-fill');
        const strengthText = document.getElementById('new-strength-text');
        
        if (strengthFill && strengthText) {
            strengthFill.className = 'strength-fill';
            strengthText.textContent = 'Password strength';
        }
    }

    resetProfileForm() {
        this.loadProfileData();
        this.clearProfileErrors();
    }

    showProfileError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    showPasswordError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearProfileErrors() {
        const errorElements = document.querySelectorAll('#profile-page .error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }

    clearPasswordErrors() {
        const errorElements = document.querySelectorAll('#password-form .error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }

    handleDashboardCardClick(card) {
        const cardTitle = card.querySelector('h3').textContent;
        
        switch (cardTitle) {
            case 'Profile':
                this.showPage('profile');
                break;
            case 'Security':
                this.auth.showToast('Security settings coming soon!', 'info');
                break;
            case 'Analytics':
                this.showPage('analytics');
                break;
            case 'Admin Panel':
                if (this.auth.hasRole('admin')) {
                    this.openAdminPanel();
                } else {
                    this.auth.showToast('Access denied. Admin privileges required.', 'error');
                }
                break;
            case 'Moderator Panel':
                if (this.auth.hasRole('moderator') || this.auth.hasRole('admin')) {
                    this.openModeratorPanel();
                } else {
                    this.auth.showToast('Access denied. Moderator privileges required.', 'error');
                }
                break;
            default:
                this.auth.showToast(`${cardTitle} section coming soon!`, 'info');
        }
    }

    async openAdminPanel() {
        const modal = this.createModal('Admin Panel', '<div class="loading">Loading users...</div>');
        document.body.appendChild(modal);
        
        try {
            const response = await apiService.getAllUsers();
            if (response.success) {
                const modalBody = modal.querySelector('.modal-body');
                modalBody.innerHTML = this.getAdminPanelContent(response.users);
                this.setupAdminPanelEventListeners(modal);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = '<p class="error">Failed to load users. Please try again.</p>';
            console.error('Admin panel error:', error);
        }
    }

    async openModeratorPanel() {
        const modal = this.createModal('Moderator Panel', '<div class="loading">Loading users...</div>');
        document.body.appendChild(modal);
        
        try {
            const response = await apiService.getAllUsers();
            if (response.success) {
                const modalBody = modal.querySelector('.modal-body');
                modalBody.innerHTML = this.getModeratorPanelContent(response.users);
                this.setupModeratorPanelEventListeners(modal);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = '<p class="error">Failed to load users. Please try again.</p>';
            console.error('Moderator panel error:', error);
        }
    }

    setupAdminPanelEventListeners(modal) {
        // Role change handlers
        modal.querySelectorAll('.role-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const userId = e.target.dataset.userId;
                const newRole = e.target.value;
                const originalRole = e.target.dataset.originalRole;
                
                if (newRole === originalRole) return;
                
                try {
                    const response = await apiService.updateUserRole(userId, newRole);
                    if (response.success) {
                        this.auth.showToast('User role updated successfully', 'success');
                        e.target.dataset.originalRole = newRole;
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error) {
                    this.auth.showToast('Failed to update user role', 'error');
                    e.target.value = originalRole; // Revert selection
                    console.error('Update role error:', error);
                }
            });
        });

        // Delete user handlers
        modal.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.target.dataset.userId;
                const userName = e.target.dataset.userName;
                
                if (confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
                    try {
                        const response = await apiService.deleteUser(userId);
                        if (response.success) {
                            this.auth.showToast('User deleted successfully', 'success');
                            // Remove user row from table
                            const userRow = e.target.closest('.user-row');
                            if (userRow) {
                                userRow.remove();
                            }
                        } else {
                            throw new Error(response.message);
                        }
                    } catch (error) {
                        this.auth.showToast('Failed to delete user', 'error');
                        console.error('Delete user error:', error);
                    }
                }
            });
        });
    }

    setupModeratorPanelEventListeners(modal) {
        // Moderators can only change user roles to 'user' or 'moderator', not 'admin'
        modal.querySelectorAll('.role-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const userId = e.target.dataset.userId;
                const newRole = e.target.value;
                const originalRole = e.target.dataset.originalRole;
                
                if (newRole === originalRole) return;
                
                // Prevent moderators from creating admins
                if (newRole === 'admin') {
                    this.auth.showToast('Moderators cannot assign admin roles', 'warning');
                    e.target.value = originalRole;
                    return;
                }
                
                try {
                    const response = await apiService.updateUserRole(userId, newRole);
                    if (response.success) {
                        this.auth.showToast('User role updated successfully', 'success');
                        e.target.dataset.originalRole = newRole;
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error) {
                    this.auth.showToast('Failed to update user role', 'error');
                    e.target.value = originalRole; // Revert selection
                    console.error('Update role error:', error);
                }
            });
        });

        // View user details (moderators can't delete users)
        modal.querySelectorAll('.view-user-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.dataset.userId;
                const userName = e.target.dataset.userName;
                const userEmail = e.target.dataset.userEmail;
                const userRole = e.target.dataset.userRole;
                const userCreated = e.target.dataset.userCreated;
                
                this.showUserDetailsModal(userId, userName, userEmail, userRole, userCreated);
            });
        });
    }

    showUserDetailsModal(userId, userName, userEmail, userRole, userCreated) {
        const detailsModal = this.createModal('User Details', `
            <div class="user-details-modal">
                <div class="user-detail-item">
                    <label>Name:</label>
                    <span>${userName}</span>
                </div>
                <div class="user-detail-item">
                    <label>Email:</label>
                    <span>${userEmail}</span>
                </div>
                <div class="user-detail-item">
                    <label>Role:</label>
                    <span class="role-badge ${userRole}">${userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
                </div>
                <div class="user-detail-item">
                    <label>Member Since:</label>
                    <span>${new Date(userCreated).toLocaleDateString()}</span>
                </div>
                <div class="user-detail-item">
                    <label>Account Status:</label>
                    <span class="status-active">Active</span>
                </div>
            </div>
        `);
        
        // Add styles for user details modal
        const style = document.createElement('style');
        style.textContent = `
            .user-details-modal {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .user-detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }
            .user-detail-item label {
                font-weight: 600;
                color: #555;
            }
            .user-detail-item span {
                color: #333;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(detailsModal);
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            .modal-content {
                background: white;
                border-radius: 15px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid #eee;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-body {
                padding: 30px;
            }
            .user-management-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .user-management-table th,
            .user-management-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }
            .user-management-table th {
                background: #f8f9fa;
                font-weight: 600;
            }
            .role-select {
                padding: 5px 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background: white;
            }
            .delete-user-btn {
                background: #dc3545;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            }
            .delete-user-btn:hover {
                background: #c82333;
            }
            .view-user-btn {
                background: #17a2b8;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                margin-right: 5px;
            }
            .view-user-btn:hover {
                background: #138496;
            }
            .user-row {
                transition: background-color 0.2s;
            }
            .user-row:hover {
                background-color: #f8f9fa;
            }
            .loading {
                text-align: center;
                padding: 40px;
                color: #666;
            }
            .error {
                color: #dc3545;
                text-align: center;
                padding: 20px;
            }
        `;
        document.head.appendChild(style);

        // Close modal functionality
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    getAdminPanelContent(users) {
        const currentUser = this.auth.getCurrentUser();
        
        return `
            <div class="admin-modal">
                <div class="admin-section">
                    <h3>User Management</h3>
                    <div class="admin-stats">
                        <div class="stat-item">
                            <div class="stat-number">${users.length}</div>
                            <div class="stat-label">Total Users</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${users.filter(u => u.role === 'admin').length}</div>
                            <div class="stat-label">Admins</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${users.filter(u => u.role === 'moderator').length}</div>
                            <div class="stat-label">Moderators</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${users.filter(u => u.role === 'user').length}</div>
                            <div class="stat-label">Users</div>
                        </div>
                    </div>
                </div>
                <div class="admin-section">
                    <h3>All Users</h3>
                    <table class="user-management-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr class="user-row">
                                    <td>${user.firstname} ${user.lastname}</td>
                                    <td>${user.email}</td>
                                    <td>
                                        <select class="role-select" data-user-id="${user.id || user._id}" data-original-role="${user.role}">
                                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                            <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                        </select>
                                    </td>
                                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        ${(user.id || user._id) !== currentUser.id ? `
                                            <button class="delete-user-btn" data-user-id="${user.id || user._id}" data-user-name="${user.firstname} ${user.lastname}">
                                                Delete
                                            </button>
                                        ` : '<span style="color: #666;">Current User</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getModeratorPanelContent(users) {
        const currentUser = this.auth.getCurrentUser();
        
        return `
            <div class="moderator-modal">
                <div class="moderator-section">
                    <h3>User Management (Moderator View)</h3>
                    <div class="moderator-stats">
                        <div class="stat-item">
                            <div class="stat-number">${users.length}</div>
                            <div class="stat-label">Total Users</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${users.filter(u => u.role === 'moderator').length}</div>
                            <div class="stat-label">Moderators</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${users.filter(u => u.role === 'user').length}</div>
                            <div class="stat-label">Regular Users</div>
                        </div>
                    </div>
                    <div class="moderator-info">
                        <p><strong>Moderator Permissions:</strong></p>
                        <ul>
                            <li>✅ View all users</li>
                            <li>✅ Promote users to moderator</li>
                            <li>✅ Demote moderators to user</li>
                            <li>❌ Cannot create admins</li>
                            <li>❌ Cannot delete users</li>
                        </ul>
                    </div>
                </div>
                <div class="moderator-section">
                    <h3>User List</h3>
                    <table class="user-management-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr class="user-row">
                                    <td>${user.firstname} ${user.lastname}</td>
                                    <td>${user.email}</td>
                                    <td>
                                        ${user.role === 'admin' ? 
                                            `<span class="role-badge admin">Admin</span>` :
                                            `<select class="role-select" data-user-id="${user.id || user._id}" data-original-role="${user.role}">
                                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                                <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                                            </select>`
                                        }
                                    </td>
                                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button class="view-user-btn" 
                                                data-user-id="${user.id || user._id}" 
                                                data-user-name="${user.firstname} ${user.lastname}"
                                                data-user-email="${user.email}"
                                                data-user-role="${user.role}"
                                                data-user-created="${user.createdAt}">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    clearSensitiveData() {
        console.log('Clearing sensitive data...');
    }

    handleError(error, context = 'Application') {
        console.error(`${context} Error:`, error);
        this.auth.showToast('An unexpected error occurred. Please try again.', 'error');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (window.app && window.app.auth) {
        window.app.auth.showToast('An unexpected error occurred', 'error');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (window.app && window.app.auth) {
        window.app.auth.showToast('An unexpected error occurred', 'error');
    }
});