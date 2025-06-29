// API Service - MongoDB Atlas Backend Integration
class APIService {
    constructor() {
        this.baseURL = '/api'; // Use relative path since we're on same port
        this.token = null;
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
    }

    // Get headers with authentication
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Handle API responses
    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return data;
    }

    // Simulate network delay for demo
    async delay(ms = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Login API
    async login(email, password) {
        try {
            await this.delay();
            
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ email, password })
            });

            const data = await this.handleResponse(response);
            
            if (data.token) {
                this.setToken(data.token);
            }
            
            return {
                success: true,
                user: data.user,
                token: data.token,
                message: 'Login successful'
            };

        } catch (error) {
            console.error('Login error:', error);
            
            // Only use fallback if it's a network error, not authentication error
            if (this.isNetworkError(error)) {
                return this.loginFallback(email, password);
            }
            
            return {
                success: false,
                message: error.message || 'Login failed'
            };
        }
    }

    // Register API
    async register(userData) {
        try {
            await this.delay();
            
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    firstname: userData.firstname,
                    lastname: userData.lastname,
                    email: userData.email,
                    password: userData.password
                })
            });

            const data = await this.handleResponse(response);
            
            return {
                success: true,
                message: 'User registered successfully'
            };

        } catch (error) {
            console.error('Registration error:', error);
            
            // Only use fallback if it's a network error
            if (this.isNetworkError(error)) {
                return this.registerFallback(userData);
            }
            
            return {
                success: false,
                message: error.message || 'Registration failed'
            };
        }
    }

    // Update user profile
    async updateProfile(userData) {
        try {
            await this.delay();
            
            const response = await fetch(`${this.baseURL}/users/profile`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(userData)
            });

            const data = await this.handleResponse(response);
            
            return {
                success: true,
                user: data.user,
                message: 'Profile updated successfully'
            };

        } catch (error) {
            console.error('Update profile error:', error);
            
            // Only use fallback if it's a network error
            if (this.isNetworkError(error)) {
                return this.updateProfileFallback(userData);
            }
            
            return {
                success: false,
                message: error.message || 'Failed to update profile'
            };
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            await this.delay();
            
            const response = await fetch(`${this.baseURL}/users/change-password`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await this.handleResponse(response);
            
            return {
                success: true,
                message: 'Password changed successfully'
            };

        } catch (error) {
            console.error('Change password error:', error);
            
            // Only use fallback if it's a network error
            if (this.isNetworkError(error)) {
                return this.changePasswordFallback(currentPassword, newPassword);
            }
            
            return {
                success: false,
                message: error.message || 'Failed to change password'
            };
        }
    }

    // Get all users (admin and moderator)
    async getAllUsers() {
        try {
            console.log('Fetching users from API...');
            await this.delay(200);
            
            const response = await fetch(`${this.baseURL}/admin/users`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await this.handleResponse(response);
            console.log('Users fetched successfully:', data.users?.length || 0);
            
            return {
                success: true,
                users: data.users
            };

        } catch (error) {
            console.error('Get all users error:', error);
            
            // Only use fallback if it's a network error
            if (this.isNetworkError(error)) {
                console.warn('Network error detected, using fallback');
                return this.getAllUsersFallback();
            }
            
            return {
                success: false,
                message: error.message || 'Failed to get users'
            };
        }
    }

    // Update user role (admin and moderator)
    async updateUserRole(userId, newRole) {
        try {
            await this.delay();
            
            const response = await fetch(`${this.baseURL}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ role: newRole })
            });

            const data = await this.handleResponse(response);
            
            return {
                success: true,
                message: 'User role updated successfully'
            };

        } catch (error) {
            console.error('Update user role error:', error);
            
            // Only use fallback if it's a network error
            if (this.isNetworkError(error)) {
                return this.updateUserRoleFallback(userId, newRole);
            }
            
            return {
                success: false,
                message: error.message || 'Failed to update user role'
            };
        }
    }

    // Delete user (admin only)
    async deleteUser(userId) {
        try {
            await this.delay();
            
            const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            const data = await this.handleResponse(response);
            
            return {
                success: true,
                message: 'User deleted successfully'
            };

        } catch (error) {
            console.error('Delete user error:', error);
            
            // Only use fallback if it's a network error
            if (this.isNetworkError(error)) {
                return this.deleteUserFallback(userId);
            }
            
            return {
                success: false,
                message: error.message || 'Failed to delete user'
            };
        }
    }

    // Helper method to check if error is network-related
    isNetworkError(error) {
        return error.message.includes('Failed to fetch') || 
               error.message.includes('NetworkError') ||
               error.message.includes('fetch') ||
               error.name === 'TypeError';
    }

    // FALLBACK METHODS FOR DEVELOPMENT (Only used when backend is unreachable)
    
    // Load demo users from localStorage
    loadDemoUsers() {
        const savedUsers = localStorage.getItem('demo_users');
        if (savedUsers) {
            return JSON.parse(savedUsers);
        }
        
        // Initialize with demo users
        const defaultUsers = [
            {
                id: '1',
                firstname: 'Admin',
                lastname: 'User',
                email: 'admin@example.com',
                password: this.hashPassword('admin123'),
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                firstname: 'Jane',
                lastname: 'Smith',
                email: 'user@example.com',
                password: this.hashPassword('user123'),
                role: 'user',
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                firstname: 'Moderator',
                lastname: 'User',
                email: 'moderator@example.com',
                password: this.hashPassword('mod123'),
                role: 'moderator',
                createdAt: new Date().toISOString()
            }
        ];
        
        this.saveDemoUsers(defaultUsers);
        return defaultUsers;
    }

    saveDemoUsers(users) {
        localStorage.setItem('demo_users', JSON.stringify(users));
    }

    hashPassword(password) {
        let hash = 0;
        if (password.length === 0) return hash;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            iat: Date.now()
        };
        return btoa(JSON.stringify(payload));
    }

    async loginFallback(email, password) {
        console.warn('Using fallback authentication - backend not available');
        const users = this.loadDemoUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        if (!this.verifyPassword(password, user.password)) {
            return {
                success: false,
                message: 'Invalid password'
            };
        }

        const token = this.generateToken(user);
        this.setToken(token);

        const userData = {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        return {
            success: true,
            user: userData,
            token: token,
            message: 'Login successful (offline mode)'
        };
    }

    async registerFallback(userData) {
        console.warn('Using fallback registration - backend not available');
        const users = this.loadDemoUsers();
        const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
        
        if (existingUser) {
            return {
                success: false,
                message: 'User with this email already exists'
            };
        }

        const validation = ValidationService.validateRegistrationData({
            ...userData,
            role: 'user'
        });
        
        if (!validation.isValid) {
            return {
                success: false,
                message: Object.values(validation.errors)[0]
            };
        }

        const newUser = {
            id: Date.now().toString(),
            firstname: ValidationService.sanitizeInput(userData.firstname),
            lastname: ValidationService.sanitizeInput(userData.lastname),
            email: userData.email.toLowerCase(),
            password: this.hashPassword(userData.password),
            role: 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveDemoUsers(users);

        return {
            success: true,
            message: 'User registered successfully (offline mode)'
        };
    }

    async updateProfileFallback(userData) {
        console.warn('Using fallback profile update - backend not available');
        const users = this.loadDemoUsers();
        const currentUser = window.app?.auth?.getCurrentUser();
        
        if (!currentUser) {
            return {
                success: false,
                message: 'User not authenticated'
            };
        }

        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex === -1) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        // Update user data
        if (userData.firstname) users[userIndex].firstname = userData.firstname;
        if (userData.lastname) users[userIndex].lastname = userData.lastname;
        users[userIndex].updatedAt = new Date().toISOString();

        this.saveDemoUsers(users);

        return {
            success: true,
            user: {
                id: users[userIndex].id,
                firstname: users[userIndex].firstname,
                lastname: users[userIndex].lastname,
                email: users[userIndex].email,
                role: users[userIndex].role,
                createdAt: users[userIndex].createdAt
            },
            message: 'Profile updated successfully (offline mode)'
        };
    }

    async changePasswordFallback(currentPassword, newPassword) {
        console.warn('Using fallback password change - backend not available');
        const users = this.loadDemoUsers();
        const currentUser = window.app?.auth?.getCurrentUser();
        
        if (!currentUser) {
            return {
                success: false,
                message: 'User not authenticated'
            };
        }

        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex === -1) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        // Verify current password
        if (!this.verifyPassword(currentPassword, users[userIndex].password)) {
            return {
                success: false,
                message: 'Current password is incorrect'
            };
        }

        // Update password
        users[userIndex].password = this.hashPassword(newPassword);
        users[userIndex].updatedAt = new Date().toISOString();

        this.saveDemoUsers(users);

        return {
            success: true,
            message: 'Password changed successfully (offline mode)'
        };
    }

    async getAllUsersFallback() {
        console.warn('Using fallback user list - backend not available');
        const users = this.loadDemoUsers();
        const usersData = users.map(user => ({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }));

        return {
            success: true,
            users: usersData
        };
    }

    async updateUserRoleFallback(userId, newRole) {
        console.warn('Using fallback role update - backend not available');
        const users = this.loadDemoUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        users[userIndex].role = newRole;
        users[userIndex].updatedAt = new Date().toISOString();
        this.saveDemoUsers(users);

        return {
            success: true,
            message: 'User role updated successfully (offline mode)'
        };
    }

    async deleteUserFallback(userId) {
        console.warn('Using fallback user deletion - backend not available');
        const users = this.loadDemoUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        users.splice(userIndex, 1);
        this.saveDemoUsers(users);

        return {
            success: true,
            message: 'User deleted successfully (offline mode)'
        };
    }
}

// Create global instance
const apiService = new APIService();