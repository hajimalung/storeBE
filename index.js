const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable
const port = 3000;

// Add middleware to parse JSON bodies
app.use(express.json());

// File path for users database
const usersFilePath = path.join(__dirname, 'users.json');

// Function to read users from file
async function readUsers() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data).users;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If file doesn't exist, create it with empty users array
      await fs.writeFile(usersFilePath, JSON.stringify({ users: [] }));
      return [];
    }
    throw error;
  }
}

// Function to write users to file
async function writeUsers(users) {
  await fs.writeFile(usersFilePath, JSON.stringify({ users }, null, 2));
}

app.get('/healthcheck', (req, res) => {
  res.send('Test!');
});

app.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Read current users
    const users = await readUsers();

    // Validate input
    if (!username || !password || !email) {
      return res.status(400).json({ 
        message: 'Username, password and email are required' 
      });
    }
    
    // Check if user already exists
    if (users.find(user => user.username === username)) {
      return res.status(400).json({ 
        message: 'Username already exists' 
      });
    }

    if (users.find(user => user.email === email)) {
      return res.status(400).json({ 
        message: 'Email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    // Save user to file
    users.push(newUser);
    await writeUsers(users);

    // Return success (exclude password from response)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Initialize server
async function initializeServer() {
  try {
    // Ensure users file exists
    await readUsers();
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Read users and find matching email
    const users = await readUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success (exclude password from response)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Example of a protected route using the authentication middleware
app.get('/protected', authenticateToken, async (req, res) => {
  res.json({ 
    message: 'This is a protected route', 
    user: req.user 
  });
});


initializeServer();