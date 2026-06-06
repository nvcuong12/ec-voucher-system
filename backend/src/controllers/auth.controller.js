import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";
import { BusinessException } from "../utils/BusinessException.js";

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const resetTokens = new Map();

const normalizeIdentifier = (value) => String(value || "").trim();

const isEmail = (value) => /.+@.+\..+/.test(value);

export const register = async (req, res, next) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    if (!password || !full_name) {
      return next(
        new BusinessException(
          "VALIDATION_FAILED",
          "password and full_name are required",
          400
        )
      );
    }

    if (!email && !phone) {
      return next(
        new BusinessException("VALIDATION_FAILED", "email or phone is required", 400)
      );
    }

    const allowedRoles = ["CUSTOMER", "PARTNER"];
    const userRole = role && allowedRoles.includes(role) ? role : "CUSTOMER";

    if (email) {
      const existingEmail = await query("SELECT id FROM users WHERE email = $1", [email]);
      if (existingEmail.rows.length) {
        return next(
          new BusinessException("USER_DUPLICATE_EMAIL", "Email already registered", 409)
        );
      }
    }

    if (phone) {
      const existingPhone = await query("SELECT id FROM users WHERE phone = $1", [phone]);
      if (existingPhone.rows.length) {
        return next(
          new BusinessException("USER_DUPLICATE_PHONE", "Phone already registered", 409)
        );
      }
    }

    const hashed = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (email, password, full_name, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, phone, role, created_at`,
      [email || null, hashed, full_name, phone || null, userRole]
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
    const { email, password, phone, identifier } = req.body;
    const loginId = normalizeIdentifier(identifier || email || phone);

    if (!loginId || !password) {
      return next(
        new BusinessException(
          "VALIDATION_FAILED",
          "identifier and password are required",
          400
        )
      );
    }

    const result = await query(
      "SELECT * FROM users WHERE email = $1 OR phone = $1",
      [loginId]
    );

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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, phone, identifier } = req.body || {};
    const loginId = normalizeIdentifier(identifier || email || phone);
    if (!loginId) {
      return next(new BusinessException("VALIDATION_FAILED", "email or phone is required", 400));
    }

    const result = await query(
      "SELECT id, email, phone FROM users WHERE email = $1 OR phone = $1",
      [loginId]
    );
    const user = result.rows[0];
    if (!user) {
      return next(new BusinessException("NOT_FOUND", "User not found", 404));
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    resetTokens.set(token, user.id);

    return res.json({ data: { reset_token: token } });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { reset_token, new_password } = req.body || {};
    if (!reset_token || !new_password) {
      return next(new BusinessException("VALIDATION_FAILED", "reset_token and new_password are required", 400));
    }

    const userId = resetTokens.get(reset_token);
    if (!userId) {
      return next(new BusinessException("FORBIDDEN", "Invalid or expired reset token", 403));
    }

    const hashed = await bcrypt.hash(new_password, 12);
    await query("UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2", [hashed, userId]);
    resetTokens.delete(reset_token);

    return res.json({ data: { message: "Password reset successful" } });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body || {};
    if (!current_password || !new_password) {
      return next(new BusinessException("VALIDATION_FAILED", "current_password and new_password are required", 400));
    }

    const result = await query("SELECT password FROM users WHERE id = $1", [req.user.id]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(current_password, user.password))) {
      return next(new BusinessException("INVALID_CREDENTIALS", "Current password is incorrect", 401));
    }

    const hashed = await bcrypt.hash(new_password, 12);
    await query("UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2", [hashed, req.user.id]);

    return res.json({ data: { message: "Password updated" } });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
