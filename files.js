const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');

// Port configuration
const PORT = 4000;

// MongoDB connection
mongoose.connect('mongodb+srv://BobbyBWilfred:Legendbob2005%23@bbwcluster.0ctao.mongodb.net/bbwDatabase?retryWrites=true&w=majority&appName=BBWCluster', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Not Connected', err));

// Define schemas
const cabinetSchema = new mongoose.Schema({
  username: String,
  role: String,
  email: String,
  password: String,
  loginCount: { type: Number, default: 0 }
});
const employerSchema = new mongoose.Schema({
  username: String,
  password: String
});
const customerSchema = new mongoose.Schema({
  username: String,
  password: String
});

// Define chat schema
const chatSchema = new mongoose.Schema({
  user: String, // The user sending the message
  message: String,
  timestamp: { type: Date, default: Date.now }
});

// Define models
const Cabinet = mongoose.model('Cabinet', cabinetSchema);
const Employer = mongoose.model('Employer', employerSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Chat = mongoose.model('Chat', chatSchema);

// Express setup
const app = express();
const server = http.createServer(app); // Use HTTP server for Socket.IO
const io = new Server(server); // Attach Socket.IO to the server

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'file.html'));
});

// API to fetch all cabinet members
app.get('/api/cabinets', async (req, res) => {
  try {
    const cabinets = await Cabinet.find(); // Fetch all cabinet members
    res.json(cabinets);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching cabinet members' });
  }
});

// API to fetch logged-in user details
app.get('/api/user', (req, res) => {
  if (req.session.username) {
    Cabinet.findOne({ username: req.session.username })
      .then(user => {
        res.json({ name: user.username, role: user.role });
      })
      .catch(err => res.status(500).json({ error: 'User not found' }));
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Signup route for Customer (Register)
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  const existingCustomer = await Customer.findOne({ username });
  if (existingCustomer) {
    return res.json({ message: 'Customer already exists!' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newCustomer = new Customer({ username, password: hashedPassword });
  await newCustomer.save();
  res.json({ message: 'Customer signed up successfully!' });
});

// Login route for Customer
app.post('/customer/login', async (req, res) => {
  const { username, password } = req.body;
  const customer = await Customer.findOne({ username });
  if (customer && await bcrypt.compare(password, customer.password)) {
    req.session.username = username; // Save the session
    res.json({ success: true, role: 'customer' });
  } else {
    res.json({ success: false, message: 'Invalid credentials!' });
  }
});

// Login route for Cabinet (Company people)
app.post('/cabinet/login', async (req, res) => {
  const { username, password } = req.body;
  const cabinetUser = await Cabinet.findOne({ username });
  if (cabinetUser && await bcrypt.compare(password, cabinetUser.password)) {
    cabinetUser.loginCount += 1;
    await cabinetUser.save();
    req.session.username = username; // Save the session
    res.json({ success: true, role: 'cabinet' });
  } else {
    res.json({ success: false, message: 'Invalid credentials!' });
  }
});

// Login route for Employer (Company people)
app.post('/employer/login', async (req, res) => {
  const { username, password } = req.body;
  const employerUser = await Employer.findOne({ username });
  if (employerUser && await bcrypt.compare(password, employerUser.password)) {
    req.session.username = username; // Save the session
    res.json({ success: true, role: 'employer' });
  } else {
    res.json({ success: false, message: 'Invalid credentials!' });
  }
});

// Real-time chat functionality using Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected.');

  // Send previous chat history to new user
  Chat.find().sort({ timestamp: 1 }).then((chats) => {
    chats.forEach(chat => {
      socket.emit('cabinet-message', chat); // Send each chat message to the newly connected user
    });
  });

  // Handle incoming chat messages
  socket.on('cabinet-message', async (messageData) => {
    const { message } = messageData;
    const username = messageData.user || socket.handshake.session.username;

    if (username && message) {
      const timestamp = new Date();
      const chat = new Chat({ user: username, message, timestamp });
      await chat.save(); // Save the message to the database

      // Broadcast the message to all connected clients
      io.emit('cabinet-message', { user: username, message, timestamp });
    }
  });

  // Clear chat if the user is the President
  socket.on('clear-chat', async (username) => {
    try {
      const user = await Cabinet.findOne({ username });
      if (user && user.role === 'President') {
        await Chat.deleteMany(); // Clear all chat messages from the database
        io.emit('chat-cleared'); // Notify all clients that the chat has been cleared
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

// Fetch chat history API
app.get('/api/chat', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: 1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
