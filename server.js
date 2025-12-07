const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const sequelize = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/olympiads', require('./routes/olympiads'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/timer', require('./routes/timer'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/reminders', require('./routes/reminders'));

// Front-end routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.get('/dashboard', (req, res) => {
    res.render('pages/dashboard');
});

app.get('/clients', (req, res) => {
    res.render('pages/clients');
});

app.get('/olympiads', (req, res) => {
    res.render('pages/olympiads');
});

app.get('/timer', (req, res) => {
    res.render('pages/timer');
});

app.get('/reports', (req, res) => {
    res.render('pages/reports');
});

app.get('/profile', (req, res) => {
    res.render('pages/profile');
});

app.get('/employees', (req, res) => {
    res.render('pages/employees');
});

// Database sync and server start
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');
    
    await sequelize.sync({ alter: true });
    console.log('✓ Models synced');
    
    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Error starting server:', error);
    process.exit(1);
  }
})();
