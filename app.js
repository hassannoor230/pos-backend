const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors({ origin: ['https://pos-frontend-cgxp7fah7-hassan-noors-projects.vercel.app', 'http://localhost:3000', 'https://pos-frontend-khaki.vercel.app'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/reports', require('./routes/report.routes'));

// Health
app.get('/api/health', (_, res) => res.json({ status: 'SmartPOS Pro API ✅', time: new Date() }));

// optional root landing page for deploys (avoid 404 noise)
app.get('/', (req, res) => {
  return res.send('SmartPOS Pro backend - run `/api/health` for status');
});

// serve a blank favicon to prevent 404s
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// 404
app.use('*', (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use(errorHandler);

module.exports = app;
