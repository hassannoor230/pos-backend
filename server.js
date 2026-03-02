require('./config/dotenv');
const connectDB = require('./config/db');
const app = require('./app');

connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║          SmartPOS Pro - Server           ║
  ╠══════════════════════════════════════════╣
  ║  🚀 Running on: http://localhost:${PORT}   ║
  ║  📦 Environment: ${(process.env.NODE_ENV || 'development').padEnd(22)}║
  ║  🌱 Seed data: npm run seed              ║
  ╚══════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
