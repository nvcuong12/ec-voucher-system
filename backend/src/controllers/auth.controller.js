import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const register = async (req, res, next) => {
  const { email, password, full_name, phone, role } = req.body;

  // Validate required fields
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: "email, password, full_name are required" });
  }

  // Only allow CUSTOMER & PARTNER self-registration
  const allowedRoles = ["CUSTOMER", "PARTNER"];
  const userRole = role && allowedRoles.includes(role) ? role : "CUSTOMER";

  // Check duplicate email
  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length) {
    return res.status(409).json({ error: "Email already registered" });
  }

  // Hash password (bcrypt, 12 rounds)
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
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const result = await query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: "Account suspended" });
  }

  const token = signToken(user.id);

  // Strip password from response
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
