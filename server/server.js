const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables from root directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// MongoDB connection
const connectDB = async () => {
  try {
    // Use environment variable first, fallback to hardcoded if needed
    const mongoURI = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'auth_system';
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName
    });
    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`📊 Connected to database: ${dbName}`);
    console.log(`🔗 Connection string: ${mongoURI.replace(/:[^:@]*@/, ':****@')}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('🔄 Falling back to local storage mode...');
    // Don't exit, allow fallback to localStorage
  }
};

// Connect to database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SecureAuth API is running',
    timestamp: new Date().toISOString(),
    database: process.env.DB_NAME || 'auth_system',
    mongoConnection: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Serve the main HTML file for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      success: false, 
      message: 'API endpoint not found' 
    });
  }
  
  // Serve index.html for all other routes
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Application URL: http://localhost:${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}/api`);
  console.log(`📄 Frontend served from: http://localhost:${PORT}`);
});