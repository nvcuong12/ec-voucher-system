// ================================================================
// partner.controller.js
// backend/src/controllers/partner.controller.js
// ================================================================

import { query, withTransaction } from "../config/database.js";
import { BusinessException } from "../utils/BusinessException.js";
import {
  insertPartnerBranchQuery,
  insertPartnerQuery,
  updatePartnerBranchQuery,
  updatePartnerProfileQuery,
  selectPartnerByUserIdQuery,
} from "../models/partner.queries.js";
import { getPartnerByUserIdQuery } from "../models/voucher.queries.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (v) => UUID_RE.test(String(v ?? ""));

const getRequestIp = (req) =>
  req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.ip ||
  req.socket?.remoteAddress ||
  null;

const requirePartner = async (userId) => {
  const result = await query(selectPartnerByUserIdQuery, [userId]);
  return result.rows[0] ?? null;
};

const requireApprovedPartner = async (userId) => {
  const partner = await requirePartner(userId);
  if (!partner) {
    throw new BusinessException("NOT_FOUND", "Partner profile not found", 404);
  }
  if (partner.status !== "APPROVED") {
    throw new BusinessException("FORBIDDEN", "Partner must be approved", 403);
  }
  return partner;
};

const requireSuspendedPartner = async (userId) => {
  const partner = await requirePartner(userId);
  if (!partner) {
    throw new BusinessException("NOT_FOUND", "Partner profile not found", 404);
  }
  if (partner.status !== "SUSPENDED") {
    throw new BusinessException(
      "FORBIDDEN",
      "Only suspended partners can submit unlock appeals",
      403
    );
  }
  return partner;
};

const ensurePartnerBranch = async (client, partnerId, branchId) => {
  if (!branchId) {
    throw new BusinessException("VALIDATION_FAILED", "branch_id is required", 400);
  }
  const branchRes = await client.query(
    `SELECT id FROM partner_branches WHERE id = $1 AND partner_id = $2 AND is_active = TRUE`,
    [branchId, partnerId]
  );
  if (!branchRes.rows[0]) {
    throw new BusinessException("FORBIDDEN", "Chi nhánh không thuộc đối tác hiện tại", 403);
  }
};

const ensureVoucherApplicableAtBranch = async (client, voucherId, branchId) => {
  const mappingRes = await client.query(
    `SELECT COUNT(*)::int AS total
     FROM voucher_applicable_branches
     WHERE voucher_id = $1`,
    [voucherId]
  );

  // Existing voucher creation allows no branch_ids. Treat that as "all active branches of this partner".
  if (mappingRes.rows[0]?.total === 0) return;

  const applicableRes = await client.query(
    `SELECT 1
     FROM voucher_applicable_branches
     WHERE voucher_id = $1 AND branch_id = $2`,
    [voucherId, branchId]
  );

  if (!applicableRes.rows[0]) {
    throw new BusinessException(
      "FORBIDDEN",
      "Voucher không áp dụng tại chi nhánh này",
      403
    );
  }
};

const getIssuedVoucherForPartner = async (client, code) => {
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

  return issuedRes.rows[0] ?? null;
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
    const partner = await requireApprovedPartner(req.user.id);

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

export const updatePartnerProfile = async (req, res, next) => {
  try {
    const { business_name, business_license, representative, address } = req.body || {};
    if (
      business_name === undefined &&
      business_license === undefined &&
      representative === undefined &&
      address === undefined
    ) {
      return next(new BusinessException("VALIDATION_FAILED", "No changes provided", 400));
    }

    if (business_name !== undefined && !String(business_name || "").trim()) {
      return next(new BusinessException("VALIDATION_FAILED", "business_name cannot be empty", 400));
    }
    if (representative !== undefined && !String(representative || "").trim()) {
      return next(new BusinessException("VALIDATION_FAILED", "representative cannot be empty", 400));
    }

    const result = await query(updatePartnerProfileQuery, [
      req.user.id,
      business_name ? String(business_name).trim() : null,
      business_license ?? null,
      representative ? String(representative).trim() : null,
      address ?? null,
    ]);

    const partner = result.rows[0];
    if (!partner) {
      return next(new BusinessException("NOT_FOUND", "Partner profile not found", 404));
    }

    return res.json({ data: { partner } });
  } catch (err) {
    next(err);
  }
};

export const updatePartnerBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid branch id", 400));
    }

    const { name, address, phone, is_active } = req.body || {};
    if (name === undefined && address === undefined && phone === undefined && is_active === undefined) {
      return next(new BusinessException("VALIDATION_FAILED", "No changes provided", 400));
    }
    if (name !== undefined && !String(name || "").trim()) {
      return next(new BusinessException("VALIDATION_FAILED", "name cannot be empty", 400));
    }
    if (address !== undefined && !String(address || "").trim()) {
      return next(new BusinessException("VALIDATION_FAILED", "address cannot be empty", 400));
    }

    const partner = await requireApprovedPartner(req.user.id);
    if (partner.status !== "APPROVED") {
      return next(
        new BusinessException(
          "FORBIDDEN",
          "Partner account must be approved before updating branches",
          403
        )
      );
    }


    const result = await query(updatePartnerBranchQuery, [
      id,
      partner.id,
      name ? String(name).trim() : null,
      address ? String(address).trim() : null,
      phone ?? null,
      is_active === undefined ? null : Boolean(is_active),
    ]);

    const branch = result.rows[0];
    if (!branch) {
      return next(new BusinessException("NOT_FOUND", "Branch not found", 404));
    }

    return res.json({ data: { branch } });
  } catch (err) {
    next(err);
  }
};

export const createPartnerAppeal = async (req, res, next) => {
  try {
    const partner = await requireSuspendedPartner(req.user.id);
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
    const evidenceUrl = typeof req.body?.evidence_url === "string"
      ? req.body.evidence_url.trim()
      : null;

    if (!title) {
      return next(new BusinessException("VALIDATION_FAILED", "title is required", 400));
    }
    if (!content) {
      return next(new BusinessException("VALIDATION_FAILED", "content is required", 400));
    }
    if (content.length < 20) {
      return next(new BusinessException("VALIDATION_FAILED", "content must be at least 20 characters", 400));
    }

    const existing = await query(
      `SELECT id
       FROM partner_appeals
       WHERE partner_id = $1 AND status = 'PENDING'
       LIMIT 1`,
      [partner.id]
    );
    if (existing.rows[0]) {
      return next(new BusinessException("CONFLICT", "A pending appeal already exists", 409));
    }

    const result = await query(
      `INSERT INTO partner_appeals (partner_id, user_id, title, content, evidence_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, partner_id, user_id, title, content, evidence_url,
                 status, admin_response, reviewed_by, reviewed_at, created_at, updated_at`,
      [partner.id, req.user.id, title, content, evidenceUrl || null]
    );

    return res.status(201).json({ data: { appeal: result.rows[0] } });
  } catch (err) {
    next(err);
  }
};

export const getMyPartnerAppeals = async (req, res, next) => {
  try {
    const partner = await requirePartner(req.user.id);
    if (!partner) {
      return next(new BusinessException("NOT_FOUND", "Partner profile not found", 404));
    }

    const result = await query(
      `SELECT id, partner_id, user_id, title, content, evidence_url,
              status, admin_response, reviewed_by, reviewed_at, created_at, updated_at
       FROM partner_appeals
       WHERE partner_id = $1
       ORDER BY created_at DESC`,
      [partner.id]
    );

    return res.json({ data: { appeals: result.rows } });
  } catch (err) {
    next(err);
  }
};

export const checkVoucher = async (req, res, next) => {
  try {
    const { code, branch_id } = req.body || {};
    if (!code || typeof code !== "string") {
      return next(new BusinessException("VALIDATION_FAILED", "code is required", 400));
    }

    const partner = await requireApprovedPartner(req.user.id);
    if (branch_id && !isValidUuid(branch_id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid branch_id", 400));
    }

    const result = await withTransaction(async (client) => {
      await ensurePartnerBranch(client, partner.id, branch_id);

      const issued = await getIssuedVoucherForPartner(client, code);
      if (!issued) {
        throw new BusinessException("NOT_FOUND", "Voucher code not found", 404);
      }
      if (issued.partner_id !== partner.id) {
        throw new BusinessException("FORBIDDEN", "Voucher does not belong to your partner", 403);
      }
      await ensureVoucherApplicableAtBranch(client, issued.voucher_id, branch_id);

      const now = new Date();
      const expired = issued.expires_at && new Date(issued.expires_at) <= now;
      let valid = true;
      let reason = null;
      if (issued.status !== "UNUSED") {
        valid = false;
        reason = "Voucher đã được sử dụng";
      } else if (expired) {
        valid = false;
        reason = "Voucher đã hết hạn";
      }

      return { valid, reason, issued, voucher: issued };
    });

    return res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const scanVoucher = async (req, res, next) => {
  try {
    const { code, branch_id } = req.body || {};
    if (!code || typeof code !== "string") {
      return next(new BusinessException("VALIDATION_FAILED", "code is required", 400));
    }

    const partner = await requireApprovedPartner(req.user.id);

    if (branch_id && !isValidUuid(branch_id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid branch_id", 400));
    }

    const result = await withTransaction(async (client) => {
      await ensurePartnerBranch(client, partner.id, branch_id);

      const issued = await getIssuedVoucherForPartner(client, code);
      if (!issued) {
        throw new BusinessException("NOT_FOUND", "Voucher code not found", 404);
      }
      if (issued.partner_id !== partner.id) {
        throw new BusinessException("FORBIDDEN", "Voucher does not belong to your partner", 403);
      }
      await ensureVoucherApplicableAtBranch(client, issued.voucher_id, branch_id);
      if (issued.status !== "UNUSED") {
        throw new BusinessException("CONFLICT", "Voucher đã được sử dụng", 409);
      }
      if (issued.expires_at && new Date(issued.expires_at) <= new Date()) {
        throw new BusinessException("CONFLICT", "Voucher đã hết hạn", 409);
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

      await client.query(
        `INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
        [
          req.user.id,
          "PARTNER_SCAN_VOUCHER",
          "issued_voucher",
          issued.id,
          JSON.stringify({ voucher_id: issued.voucher_id, branch_id }),
          getRequestIp(req),
        ]
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

export const getPartnerReport = async (req, res, next) => {
  try {
    const partner = await requireApprovedPartner(req.user.id);

    const [summaryRevenue, summaryIssued, voucherStats] = await Promise.all([
      query(
        `SELECT
           COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue,
           COALESCE(SUM(oi.quantity), 0) AS sold_count
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         JOIN vouchers v ON v.id = oi.voucher_id
         WHERE v.partner_id = $1 AND o.status = 'PAID'`,
        [partner.id]
      ),
      query(
        `SELECT
           COUNT(*) AS issued_count,
           COUNT(*) FILTER (WHERE status = 'USED') AS used_count,
           COUNT(*) FILTER (
             WHERE status = 'EXPIRED'
                OR (status = 'UNUSED' AND expires_at IS NOT NULL AND expires_at <= NOW())
           ) AS expired_count
         FROM issued_vouchers
         WHERE partner_id = $1`,
        [partner.id]
      ),
      query(
        `WITH revenue AS (
           SELECT oi.voucher_id,
                  SUM(oi.quantity * oi.unit_price) AS revenue,
                  SUM(oi.quantity) AS sold_count
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
           WHERE o.status = 'PAID'
           GROUP BY oi.voucher_id
         ),
         issued AS (
           SELECT voucher_id,
                  COUNT(*) AS issued_count,
                  COUNT(*) FILTER (WHERE status = 'USED') AS used_count,
                  COUNT(*) FILTER (
                    WHERE status = 'EXPIRED'
                       OR (status = 'UNUSED' AND expires_at IS NOT NULL AND expires_at <= NOW())
                  ) AS expired_count
           FROM issued_vouchers
           GROUP BY voucher_id
         )
         SELECT
           v.id,
           v.name,
           v.status,
           COALESCE(r.revenue, 0) AS revenue,
           COALESCE(r.sold_count, 0) AS sold_count,
           COALESCE(i.issued_count, 0) AS issued_count,
           COALESCE(i.used_count, 0) AS used_count,
           COALESCE(i.expired_count, 0) AS expired_count
         FROM vouchers v
         LEFT JOIN revenue r ON r.voucher_id = v.id
         LEFT JOIN issued i ON i.voucher_id = v.id
         WHERE v.partner_id = $1
         ORDER BY v.created_at DESC`,
        [partner.id]
      ),
    ]);

    return res.json({
      data: {
        summary: {
          revenue: summaryRevenue.rows[0].revenue,
          sold_count: parseInt(summaryRevenue.rows[0].sold_count, 10),
          issued_count: parseInt(summaryIssued.rows[0].issued_count, 10),
          used_count: parseInt(summaryIssued.rows[0].used_count, 10),
          expired_count: parseInt(summaryIssued.rows[0].expired_count, 10),
        },
        vouchers: voucherStats.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};
