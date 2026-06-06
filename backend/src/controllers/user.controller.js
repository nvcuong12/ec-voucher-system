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

export const createComplaint = async (req, res, next) => {
  try {
    const { issued_voucher_id, subject, message } = req.body || {};

    if (!issued_voucher_id || !subject || !message) {
      return next(
        new BusinessException(
          "VALIDATION_FAILED",
          "issued_voucher_id, subject and message are required",
          400
        )
      );
    }

    const issuedResult = await query(
      `SELECT iv.id, iv.voucher_id, oi.order_id
       FROM issued_vouchers iv
       JOIN order_items oi ON oi.id = iv.order_item_id
       WHERE iv.id = $1 AND iv.customer_id = $2`,
      [issued_voucher_id, req.user.id]
    );

    const issued = issuedResult.rows[0];
    if (!issued) {
      return next(new BusinessException("FORBIDDEN", "Voucher not owned by customer", 403));
    }

    const result = await query(
      `INSERT INTO complaints (
         customer_id, voucher_id, issued_voucher_id, order_id, subject, message
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, customer_id, voucher_id, issued_voucher_id, order_id,
                 subject, message, status, admin_response, resolved_by,
                 resolved_at, created_at, updated_at`,
      [
        req.user.id,
        issued.voucher_id,
        issued.id,
        issued.order_id,
        String(subject).trim(),
        String(message).trim(),
      ]
    );

    return res.status(201).json({ data: { complaint: result.rows[0] } });
  } catch (err) {
    next(err);
  }
};

export const getMyComplaints = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.id, c.customer_id, c.voucher_id, c.issued_voucher_id, c.order_id,
              c.subject, c.message, c.status, c.admin_response, c.resolved_at,
              c.created_at, c.updated_at,
              v.name AS voucher_name,
              iv.code AS voucher_code
       FROM complaints c
       LEFT JOIN vouchers v ON v.id = c.voucher_id
       LEFT JOIN issued_vouchers iv ON iv.id = c.issued_voucher_id
       WHERE c.customer_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    return res.json({ data: { complaints: result.rows } });
  } catch (err) {
    next(err);
  }
};
