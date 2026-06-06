import { query } from "../config/database.js";
import { BusinessException } from "../utils/BusinessException.js";
import { selectIssuedVouchersByCustomerQuery } from "../models/order.queries.js";

export const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      "SELECT id, email, full_name, phone, role, is_active, created_at, updated_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (!result.rows.length) {
      return next(new BusinessException("USER_NOT_FOUND", "User not found", 404));
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;

    if (!full_name) {
      return next(new BusinessException("VALIDATION_FAILED", "full_name is required", 400));
    }

    const result = await query(
      `UPDATE users 
       SET full_name = $1, phone = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING id, email, full_name, phone, role, is_active, created_at, updated_at`,
      [full_name, phone || null, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const getMyVouchers = async (req, res, next) => {
  try {
    const result = await query(selectIssuedVouchersByCustomerQuery, [req.user.id]);
    return res.json({ data: { vouchers: result.rows } });
  } catch (err) {
    next(err);
  }
};
