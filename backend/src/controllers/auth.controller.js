import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";
import { BusinessException } from "../utils/BusinessException.js";

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const register = async (req, res, next) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    if (!email || !password || !full_name) {
      return next(
        new BusinessException(
          "VALIDATION_FAILED",
          "email, password, full_name are required",
          400
        )
      );
    }

    const allowedRoles = ["CUSTOMER", "PARTNER"];
    const userRole = role && allowedRoles.includes(role) ? role : "CUSTOMER";

    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length) {
      return next(
        new BusinessException("USER_DUPLICATE_EMAIL", "Email already registered", 409)
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (email, password, full_name, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, phone, role, created_at`,
      [email, hashed, full_name, phone || null, userRole]
    );

    const user = result.rows[0];
    const token = signToken(user.id);

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new BusinessException(
          "VALIDATION_FAILED",
          "email and password are required",
          400
        )
      );
    }

    const result = await query("SELECT * FROM users WHERE email = $1", [email]);

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new BusinessException("INVALID_CREDENTIALS", "Invalid credentials", 401));
    }

    if (!user.is_active) {
      return next(new BusinessException("FORBIDDEN", "Account suspended", 403));
    }

    const token = signToken(user.id);

    const { password: _ignored, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
