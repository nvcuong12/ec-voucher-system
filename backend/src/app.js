import express from "express";
import cors from "cors";
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";

// Route imports (will be expanded in Phase 3+)
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import voucherRoutes from "./routes/voucher.routes.js";
import orderRoutes from "./routes/order.routes.js";
import partnerRoutes from "./routes/partner.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reviewRoutes from "./routes/review.routes.js";

const app = express();

// ─── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trace ID Middleware
app.use((req, res, next) => {
  req.traceId = req.headers["x-trace-id"] || uuidv4();
  next();
});

// ─── Health Check & Welcome ──────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.json({ message: "Voucher System Backend is active 🚀" });
});

const API = "/api";
app.get(API, (_req, res) => {
  res.json({ message: "Voucher System API is active 🚀", version: "1.0.0" });
});

// ─── API Routes ────────────────────────────────────────────────────
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/vouchers`, voucherRoutes);
app.use(`${API}/orders`, orderRoutes);
app.use(`${API}/partners`, partnerRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/reviews`, reviewRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ──────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(`❌ [${req.traceId}] Error:`, err.message);
  const status = err.status || 500;
  
  res.status(status).json({
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "Internal Server Error",
      traceId: req.traceId,
    },
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
