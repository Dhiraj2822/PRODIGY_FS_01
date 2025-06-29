// Validation Service
class ValidationService {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static getPasswordStrength(password) {
        if (!password) {
            return { score: 0, level: 'weak', feedback: 'Password is required' };
        }

        let score = 0;
        const feedback = [];

        // Length check
        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('Use at least 8 characters');
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Add uppercase letters');
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Add lowercase letters');
        }

        // Number check
        if (/\d/.test(password)) {
            score += 1;
        } else {
            feedback.push('Add numbers');
        }

        // Special character check
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Add special characters');
        }

        // Common password check
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey'
        ];
        
        if (commonPasswords.includes(password.toLowerCase())) {
            score = Math.max(0, score - 2);
            feedback.push('Avoid common passwords');
        }

        // Determine level
        let level;
        if (score < 2) {
            level = 'weak';
        } else if (score < 3) {
            level = 'fair';
        } else if (score < 4) {
            level = 'good';
        } else {
            level = 'strong';
        }

        return {
            score,
            level,
            feedback: feedback.join('. ')
        };
    }

    static isValidName(name) {
        return name && name.length >= 2 && /^[a-zA-Z\s'-]+$/.test(name);
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .trim();
    }

    static isValidRole(role) {
        const validRoles = ['user', 'admin', 'moderator'];
        return validRoles.includes(role);
    }

    static validateRegistrationData(data) {
        const errors = {};

        // First name validation
        if (!this.isValidName(data.firstname)) {
            errors.firstname = 'First name must be at least 2 characters and contain only letters';
        }

        // Last name validation
        if (!this.isValidName(data.lastname)) {
            errors.lastname = 'Last name must be at least 2 characters and contain only letters';
        }

        // Email validation
        if (!this.isValidEmail(data.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        const passwordStrength = this.getPasswordStrength(data.password);
        if (passwordStrength.score < 2) {
            errors.password = `Password is too weak. ${passwordStrength.feedback}`;
        }

        // Role validation (if provided)
        if (data.role && !this.isValidRole(data.role)) {
            errors.role = 'Please select a valid role';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    static validateLoginData(data) {
        const errors = {};

        // Email validation
        if (!this.isValidEmail(data.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!data.password || data.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // XSS Prevention
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // CSRF Token Generation (for demo purposes)
    static generateCSRFToken() {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    }
}