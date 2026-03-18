const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db"); // ensure this exists
const errorHandler = require("./middleware/error.middleware");

const app = express();

// 🔥 Connect DB
connectDB();

// ✅ CORS FIX (IMPORTANT)
const allowedOrigins = [
  "https://pos-frontend-khaki.vercel.app",
  "https://pos-frontend-cgxp7fah7-hassan-noors-projects.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS Blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ✅ ROUTES (IMPORTANT FIX)
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/reports", require("./routes/report.routes"));

// ✅ HEALTH
app.get("/api/health", (_, res) => {
  res.json({
    status: "SmartPOS Pro API ✅",
    time: new Date()
  });
});

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("SmartPOS Backend Running 🚀");
});

// ✅ FAVICON FIX
app.get("/favicon.ico", (req, res) => res.sendStatus(204));

// ✅ 404 HANDLER
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ✅ ERROR HANDLER
app.use(errorHandler);

// ❌ NO app.listen (Vercel ke liye)
module.exports = app;