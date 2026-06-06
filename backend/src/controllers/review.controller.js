// ================================================================
// review.controller.js
// backend/src/controllers/review.controller.js
// ================================================================

import { query } from "../config/database.js";
import { BusinessException } from "../utils/BusinessException.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (v) => UUID_RE.test(String(v ?? ""));

const getRequestIp = (req) =>
  req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.ip ||
  req.socket?.remoteAddress ||
  null;

export const createReview = async (req, res, next) => {
  try {
    const { voucher_id, issued_voucher_id, rating, comment } = req.body || {};
    if (!isValidUuid(voucher_id) || !isValidUuid(issued_voucher_id)) {
      return next(new BusinessException("VALIDATION_FAILED", "voucher_id and issued_voucher_id are required", 400));
    }

    const score = parseInt(rating, 10);
    if (!Number.isFinite(score) || score < 1 || score > 5) {
      return next(new BusinessException("VALIDATION_FAILED", "rating must be 1-5", 400));
    }

    const issuedRes = await query(
      `SELECT id, voucher_id, customer_id
       FROM issued_vouchers
       WHERE id = $1 AND customer_id = $2`,
      [issued_voucher_id, req.user.id]
    );
    const issued = issuedRes.rows[0];
    if (!issued || issued.voucher_id !== voucher_id) {
      return next(new BusinessException("FORBIDDEN", "Voucher not owned by customer", 403));
    }

    const existing = await query(
      "SELECT id FROM reviews WHERE issued_voucher_id = $1",
      [issued_voucher_id]
    );
    if (existing.rows.length) {
      return next(new BusinessException("CONFLICT", "Review already exists", 409));
    }

    const result = await query(
      `INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply, created_at`,
      [voucher_id, req.user.id, issued_voucher_id, score, comment || null]
    );

    return res.status(201).json({ data: { review: result.rows[0] } });
  } catch (err) {
    next(err);
  }
};

export const listReviewsByVoucher = async (req, res, next) => {
  try {
    const { voucherId } = req.params;
    if (!isValidUuid(voucherId)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid voucher id", 400));
    }

    const result = await query(
      `SELECT r.id, r.voucher_id, r.customer_id, r.issued_voucher_id, r.rating, r.comment, r.partner_reply, r.created_at,
              u.full_name
       FROM reviews r
       JOIN users u ON u.id = r.customer_id
       WHERE r.voucher_id = $1
       ORDER BY r.created_at DESC`,
      [voucherId]
    );

    return res.json({ data: { reviews: result.rows } });
  } catch (err) {
    next(err);
  }
};

export const replyReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid review id", 400));
    }

    const { partner_reply } = req.body || {};
    if (!partner_reply || typeof partner_reply !== "string") {
      return next(new BusinessException("VALIDATION_FAILED", "partner_reply is required", 400));
    }

    const partnerRes = await query(
      "SELECT id FROM partners WHERE user_id = $1 AND status = 'APPROVED'",
      [req.user.id]
    );
    const partner = partnerRes.rows[0];
    if (!partner) {
      return next(new BusinessException("FORBIDDEN", "Partner profile not found or not approved", 403));
    }

    const result = await query(
      `UPDATE reviews r
       SET partner_reply = $1
       FROM vouchers v
       WHERE r.id = $2
         AND r.voucher_id = v.id
         AND v.partner_id = $3
       RETURNING r.id, r.voucher_id, r.customer_id, r.issued_voucher_id, r.rating, r.comment, r.partner_reply, r.created_at`,
      [partner_reply, id, partner.id]
    );

    const review = result.rows[0];
    if (!review) {
      const exists = await query("SELECT id FROM reviews WHERE id = $1", [id]);
      if (!exists.rows[0]) {
        return next(new BusinessException("NOT_FOUND", "Review not found", 404));
      }
      return next(
        new BusinessException(
          "FORBIDDEN",
          "Bạn không có quyền phản hồi đánh giá này",
          403
        )
      );
    }

    await query(
      `INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
      [
        req.user.id,
        "PARTNER_REPLY_REVIEW",
        "review",
        review.id,
        JSON.stringify({ voucher_id: review.voucher_id }),
        getRequestIp(req),
      ]
    );

    return res.json({ data: { review } });
  } catch (err) {
    next(err);
  }
};
