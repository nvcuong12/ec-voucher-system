import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

// Verify JWT and attach user to req
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "No token provided", traceId: req.traceId },
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB to catch revoked/locked accounts
    const result = await query(
      "SELECT id, email, full_name, role, is_active FROM users WHERE id = $1",
      [decoded.userId]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "User not found", traceId: req.traceId },
      });
    }
    if (!user.is_active) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Account suspended", traceId: req.traceId },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid token", traceId: req.traceId },
      });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Token expired", traceId: req.traceId },
      });
    }
    next(err);
  }
};

// Role-based access control factory
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: `Access denied. Required role: ${roles.join(" or ")}`,
        traceId: req.traceId,
      },
    });
  }
  next();
};
