require('./config/dotenv');
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// 🔥 IMPORTANT FIX
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║          SmartPOS Pro - Server           ║
  ╠══════════════════════════════════════════╣
  ║  🚀 Running on: http://localhost:${PORT}   ║
  ║  📦 Environment: ${(process.env.NODE_ENV || 'development').padEnd(22)}║
  ╚══════════════════════════════════════════╝
    `);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
  });
}

module.exports = app;  // 🔥 VERY IMPORTANT FOR VERCEL