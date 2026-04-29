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

// ─── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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
