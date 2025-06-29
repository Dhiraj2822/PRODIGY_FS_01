# 🚀 Setup Instructions

## Quick Start (2 minutes)

1. **Get the code**
   ```bash
   git clone <your-repo-url>
   cd secureauth
   ```

2. **Install everything**
   ```bash
   npm install
   ```

3. **Start the app**
   ```bash
   npm run dev
   ```

4. **Open browser** → `http://localhost:5000`

That's it! The app works immediately with demo data.

## 🔧 Optional: Database Setup

The app works perfectly without a database, but for production use:

1. **Create MongoDB Atlas account** (free)
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create free M0 cluster

2. **Configure connection**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Restart the app**
   ```bash
   npm run dev
   ```

## 🎯 Test Accounts

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123
- **Moderator**: moderator@example.com / mod123

## 📋 Commands

All from project root directory:

- `npm run dev` - Start development server
- `npm run start` - Start production server
- `npm run build` - Build for production
- `npm run audit-fix` - Fix security issues

## 🔐 Environment Variables

Create `.env` file in root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5000
DB_NAME=auth_system
```

## ❓ Need Help?

- Check the main README.md for detailed docs
- All demo accounts work immediately
- App runs offline without database
- Open browser console to see any errors

## 🎉 You're Ready!

The app should now be running at `http://localhost:5000`. Try logging in with the demo accounts or register a new user!