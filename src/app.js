const express = require('express');
const cors = require('cors');
const { PORT } = require('./config');
const authRoutes = require('./routes/auth.routes');
const { authenticateToken } = require('./middleware/auth');
const userService = require('./services/user.service');

const app = express();
app.use(express.json());

//CORS setup
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization']
}));

// Routes
app.get('/healthcheck', (req, res) => {
  res.send('Test!');
});

// Auth routes
app.use('/auth', authRoutes);

console.log(typeof authenticateToken);

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'This is a protected route', 
    user: req.user 
  });
});

// Initialize server
async function initializeServer() {
  try {
    await userService.readUsers();
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

initializeServer();