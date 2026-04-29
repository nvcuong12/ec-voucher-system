import express from "express";
import cors from "cors";
import morgan from "morgan";

// Error handling middleware
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

// Route imports (will be expanded in Phase 3+)
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import voucherRoutes from "./routes/voucher.routes.js";
import orderRoutes from "./routes/order.routes.js";
import partnerRoutes from "./routes/partner.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reviewRoutes from "./routes/review.routes.js";

const app = express();
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="VoucherHub">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g)"/>
  <path d="M16 22h32v8H16zm0 12h32v8H16z" fill="#fff"/>
  <circle cx="20" cy="26" r="3" fill="#fff" opacity="0.85"/>
  <circle cx="44" cy="38" r="3" fill="#fff" opacity="0.85"/>
</svg>`;

// ─── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve browser favicon requests directly so they do not fall through to the API 404 handler.
app.get(["/favicon.ico", "/favicon.svg"], (_req, res) => {
  res.type("image/svg+xml").send(faviconSvg);
});

// ─── Health Check ──────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Public Entry Points ───────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    service: "Voucher System API",
    status: "ok",
    docs: "/api",
    health: "/health",
  });
});

app.get("/api", (_req, res) => {
  res.json({
    message: "Voucher System API",
    endpoints: [
      "/api/auth",
      "/api/users",
      "/api/vouchers",
      "/api/orders",
      "/api/partners",
      "/api/admin",
      "/api/reviews",
    ],
  });
});

// ─── API Routes ────────────────────────────────────────────────────
const API = "/api";
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/vouchers`, voucherRoutes);
app.use(`${API}/orders`, orderRoutes);
app.use(`${API}/partners`, partnerRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/reviews`, reviewRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ──────────────────────────────────────────
// PHẢI ở cuối cùng, sau tất cả các route và middleware
app.use(errorHandler);

export default app;
