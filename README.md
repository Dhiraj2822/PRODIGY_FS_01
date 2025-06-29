# SecureAuth - Complete Authentication System

A robust authentication system featuring user management, role-based access control, and administrative tools. Built with modern web technologies and designed for production use.

## 🚀 Quick Start

1. **Clone and install**
   ```bash
   git clone <your-repository-url>
   cd secureauth
   npm install
   ```

2. **Configure environment** (optional - works without database)
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB Atlas credentials
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Open browser** → `http://localhost:5000`

## ✨ Features

- **Complete Authentication System** - Registration, login, logout with JWT
- **Role-Based Access Control** - User, Moderator, Admin roles
- **Admin Dashboard** - Full user management interface
- **Moderator Tools** - Limited user management capabilities
- **Session Security** - Automatic timeout and secure tokens
- **Password Protection** - Strong validation and bcrypt hashing
- **Responsive Design** - Works on all devices
- **Offline Mode** - Works without database connection

## 🛠 Technology Stack

**Frontend**
- Pure HTML5, CSS3, JavaScript (ES6+)
- Custom responsive design
- No external UI frameworks

**Backend**
- Node.js + Express
- MongoDB Atlas (with localStorage fallback)
- JWT authentication + bcrypt
- Comprehensive security middleware

## 📋 Available Scripts

All commands run from the project root:

- `npm run dev` - Start development server
- `npm run start` - Start production server
- `npm run build` - Build for production
- `npm run audit-fix` - Fix security vulnerabilities

## 🔐 Demo Accounts

Test the system with these pre-configured accounts:

- **Admin**: `admin@example.com` / `admin123`
- **User**: `user@example.com` / `user123`
- **Moderator**: `moderator@example.com` / `mod123`

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5000
DB_NAME=auth_system
```

## 🗂 Project Structure

```
secureauth/
├── index.html              # Main application
├── package.json           # All dependencies
├── .env                   # Environment config
├── styles/               # CSS stylesheets
├── js/                   # Frontend JavaScript
├── src/                  # React components (optional)
└── server/               # Backend code
    ├── server.js         # Express server
    ├── models/           # Database models
    ├── routes/           # API routes
    └── middleware/       # Auth middleware
```

## 🔧 MongoDB Atlas Setup

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster (M0 free tier)
3. Create database user with read/write permissions
4. Add your IP to network access whitelist
5. Get connection string and add to `.env`

**Note**: The system works perfectly without a database using localStorage fallback.

## 🛡 Security Features

- **Password Security**: bcrypt hashing, strength validation
- **Account Protection**: JWT tokens, session timeout, account lockout
- **API Security**: Rate limiting, CORS, input validation
- **Data Protection**: Sanitization, security headers

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password

### Admin Functions
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/role` - Change user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - System statistics

## 👥 User Roles

**User** - Standard access to personal dashboard and profile
**Moderator** - Can manage regular users, view user list
**Admin** - Full system access, can manage all users and roles

## 🔄 Making Users Admin

**Option 1: MongoDB Atlas Dashboard**
1. Go to your MongoDB Atlas dashboard
2. Browse Collections → users
3. Edit user document: change `role` to `"admin"`

**Option 2: Admin Panel**
1. Login as existing admin
2. Open Admin Panel from dashboard
3. Use role dropdown to promote users

## 🐛 Troubleshooting

**Database Connection Issues**
- Verify MongoDB Atlas connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

**Login Problems**
- Try demo accounts listed above
- Check browser console for errors
- Verify server is running on port 5000

**Module Errors**
- Run `npm install` from project root
- Ensure all dependencies are installed
- Check Node.js version (14+ required)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes and test
4. Submit pull request

## 📄 License

This project is provided as-is for educational and development purposes.