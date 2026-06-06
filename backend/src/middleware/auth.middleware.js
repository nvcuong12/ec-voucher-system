import jwt from "jsonwebtoken";
import { query } from "../config/database.js";
import { BusinessException } from "../utils/BusinessException.js";

// Verify JWT and attach user to req
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next(new BusinessException("UNAUTHORIZED", "No token provided", 401));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB to catch revoked/locked accounts
    const result = await query(
      "SELECT id, email, full_name, phone, role, is_active FROM users WHERE id = $1",
      [decoded.userId]
    );

    const user = result.rows[0];
    if (!user) {
      return next(new BusinessException("UNAUTHORIZED", "User not found", 401));
    }
    if (!user.is_active) {
      return next(new BusinessException("FORBIDDEN", "Account suspended", 403));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(new BusinessException("UNAUTHORIZED", "Invalid token", 401));
    }
    if (err.name === "TokenExpiredError") {
      return next(new BusinessException("UNAUTHORIZED", "Token expired", 401));
    }
    next(err);
  }
};

// Role-based access control factory
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(
      new BusinessException(
        "FORBIDDEN",
        `Access denied. Required role: ${roles.join(" or ")}`,
        403
      )
    );
  }
  next();
};
