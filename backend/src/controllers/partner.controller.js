// ================================================================
// partner.controller.js
// backend/src/controllers/partner.controller.js
// ================================================================

import { query, withTransaction } from "../config/database.js";
import { BusinessException } from "../utils/BusinessException.js";
import {
  insertPartnerBranchQuery,
  insertPartnerQuery,
  selectPartnerByUserIdQuery,
} from "../models/partner.queries.js";
import { getPartnerByUserIdQuery } from "../models/voucher.queries.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (v) => UUID_RE.test(String(v ?? ""));

const requirePartner = async (userId) => {
  const result = await query(getPartnerByUserIdQuery, [userId]);
  return result.rows[0] ?? null;
};

export const registerPartner = async (req, res, next) => {
  try {
    const { business_name, business_license, representative, address, branch_name, branch_address, branch_phone } = req.body;

    if (!business_name || !representative) {
      return next(new BusinessException("VALIDATION_FAILED", "business_name and representative are required", 400));
    }

    const existing = await query(selectPartnerByUserIdQuery, [req.user.id]);
    if (existing.rows[0]) {
      return next(new BusinessException("CONFLICT", "Partner profile already exists", 409));
    }

    const result = await withTransaction(async (client) => {
      const partnerRes = await client.query(insertPartnerQuery, [
        req.user.id,
        business_name,
        business_license || null,
        representative,
        address || null,
      ]);
      const partner = partnerRes.rows[0];

      let branch = null;
      if (branch_name && branch_address) {
        const branchRes = await client.query(insertPartnerBranchQuery, [
          partner.id,
          branch_name,
          branch_address,
          branch_phone || null,
        ]);
        branch = branchRes.rows[0];
      }

      return { partner, branch };
    });

    return res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const createBranch = async (req, res, next) => {
  try {
    const partner = await requirePartner(req.user.id);
    if (!partner) {
      return next(new BusinessException("NOT_FOUND", "Partner profile not found", 404));
    }
    if (partner.status !== "APPROVED") {
      return next(new BusinessException("FORBIDDEN", "Partner must be approved", 403));
    }

    const { name, address, phone } = req.body;
    if (!name || !address) {
      return next(new BusinessException("VALIDATION_FAILED", "name and address are required", 400));
    }

    const result = await query(insertPartnerBranchQuery, [partner.id, name, address, phone || null]);
    return res.status(201).json({ data: { branch: result.rows[0] } });
  } catch (err) {
    next(err);
  }
};

export const scanVoucher = async (req, res, next) => {
  try {
    const { code, branch_id } = req.body;
    if (!code || typeof code !== "string") {
      return next(new BusinessException("VALIDATION_FAILED", "code is required", 400));
    }

    const partner = await requirePartner(req.user.id);
    if (!partner) {
      return next(new BusinessException("NOT_FOUND", "Partner profile not found", 404));
    }
    if (partner.status !== "APPROVED") {
      return next(new BusinessException("FORBIDDEN", "Partner must be approved", 403));
    }

    if (branch_id && !isValidUuid(branch_id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid branch_id", 400));
    }

    const result = await withTransaction(async (client) => {
      if (branch_id) {
        const branchRes = await client.query(
          `SELECT id FROM partner_branches WHERE id = $1 AND partner_id = $2 AND is_active = TRUE`,
          [branch_id, partner.id]
        );
        if (!branchRes.rows[0]) {
          throw new BusinessException("FORBIDDEN", "Branch does not belong to partner", 403);
        }
      }

      const issuedRes = await client.query(
        `SELECT
           iv.id,
           iv.code,
           iv.status,
           iv.expires_at,
           iv.voucher_id,
           iv.customer_id,
           iv.order_item_id,
           v.partner_id,
           v.name,
           v.description,
           v.terms,
           v.sale_price
         FROM issued_vouchers iv
         JOIN vouchers v ON v.id = iv.voucher_id
         WHERE iv.code = $1`,
        [code]
      );

      const issued = issuedRes.rows[0];
      if (!issued) {
        throw new BusinessException("NOT_FOUND", "Voucher code not found", 404);
      }
      if (issued.partner_id !== partner.id) {
        throw new BusinessException("FORBIDDEN", "Voucher does not belong to your partner", 403);
      }
      if (issued.status !== "UNUSED") {
        throw new BusinessException("CONFLICT", "Voucher already used or cancelled", 409);
      }
      if (issued.expires_at && new Date(issued.expires_at) <= new Date()) {
        throw new BusinessException("CONFLICT", "Voucher expired", 409);
      }

      const updateRes = await client.query(
        `UPDATE issued_vouchers
         SET status = 'USED',
             used_at = NOW(),
             used_at_branch = $2
         WHERE id = $1
         RETURNING id, code, status, used_at, used_at_branch, expires_at`,
        [issued.id, branch_id || null]
      );

      return { issued: updateRes.rows[0], voucher: issued };
    });

    return res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const getPartnerDashboard = async (req, res, next) => {
  try {
    const partner = await requirePartner(req.user.id);
    if (!partner) {
      return next(new BusinessException("NOT_FOUND", "Partner profile not found", 404));
    }

    const [voucherStats, orderStats] = await Promise.all([
      query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved,
           COUNT(*) FILTER (WHERE status = 'PENDING_APPROVAL') AS pending
         FROM vouchers
         WHERE partner_id = $1`,
        [partner.id]
      ),
      query(
        `SELECT
           COUNT(*) AS total,
           COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         JOIN vouchers v ON v.id = oi.voucher_id
         WHERE v.partner_id = $1 AND o.status = 'PAID'`,
        [partner.id]
      ),
    ]);

    return res.json({
      data: {
        partner,
        vouchers: voucherStats.rows[0],
        orders: orderStats.rows[0],
      },
    });
  } catch (err) {
    next(err);
  }
};
