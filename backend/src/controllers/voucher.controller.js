// ================================================================
// voucher.controller.js
// backend/src/controllers/voucher.controller.js
// ================================================================

import { query, getClient, withTransaction } from "../config/database.js";
import { BusinessException } from "../utils/BusinessException.js";
import {
  VOUCHER_STATUS,
  EDITABLE_STATUSES,
  getPartnerByUserIdQuery,
  checkBranchesOwnedQuery,
  insertVoucherQuery,
  insertVoucherBranchesQuery,
  deleteVoucherBranchesQuery,
  getVoucherByIdFullQuery,
  getPublicVoucherByIdQuery,
  updateVoucherQuery,
  listPublicVouchersQuery,
  listPartnerVouchersQuery,
  countPublicVouchersQuery,
  countPartnerVouchersQuery,
} from "../models/voucher.queries.js";

// ─── Helpers ─────────────────────────────────────────────────────

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (v) => UUID_RE.test(String(v ?? ""));

const sendSuccess = (res, data, status = 200) =>
  res.status(status).json({ data });

const parsePositiveInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// ─── Validation ──────────────────────────────────────────────────

/**
 * Validate body cho create / update voucher.
 * Trả về { errors: string[] } nếu có lỗi.
 */
const validateVoucherBody = (body, isUpdate = false) => {
  const errors = [];
  const {
    name,
    original_price,
    sale_price,
    stock,
    sale_start,
    sale_end,
  } = body;

  if (!isUpdate) {
    // Create: bắt buộc name, original_price, sale_price, stock
    if (!name || typeof name !== "string" || !name.trim()) {
      errors.push("name is required");
    }
    if (original_price === undefined || original_price === null) {
      errors.push("original_price is required");
    }
    if (sale_price === undefined || sale_price === null) {
      errors.push("sale_price is required");
    }
    if (stock === undefined || stock === null) {
      errors.push("stock is required");
    }
  }

  // RB-02: sale_price < original_price
  const op = parseFloat(original_price);
  const sp = parseFloat(sale_price);
  if (
    (original_price !== undefined && original_price !== null) ||
    (sale_price !== undefined && sale_price !== null)
  ) {
    if (isNaN(op) || op <= 0) errors.push("original_price must be a positive number");
    if (isNaN(sp) || sp <= 0) errors.push("sale_price must be a positive number");
    if (!isNaN(op) && !isNaN(sp) && sp >= op) {
      errors.push("sale_price must be less than original_price (RB-02)");
    }
  }

  // stock >= 0
  if (stock !== undefined && stock !== null) {
    const s = parseInt(stock, 10);
    if (!Number.isFinite(s) || s < 0) {
      errors.push("stock must be a non-negative integer");
    }
  }

  // RB-03: sale_start / sale_end hợp lệ
  if (sale_start !== undefined && sale_start !== null) {
    const d = new Date(sale_start);
    if (isNaN(d.getTime())) errors.push("sale_start is not a valid date");
  }
  if (sale_end !== undefined && sale_end !== null) {
    const d = new Date(sale_end);
    if (isNaN(d.getTime())) errors.push("sale_end is not a valid date");
  }
  if (sale_start && sale_end) {
    const start = new Date(sale_start);
    const end = new Date(sale_end);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
      errors.push("sale_end must be after sale_start (RB-03)");
    }
  }

  return errors;
};

// ─── GET partner record for current user ─────────────────────────

const getPartnerForUser = async (userId) => {
  const result = await query(getPartnerByUserIdQuery, [userId]);
  return result.rows[0] ?? null;
};

// ─── POST /api/vouchers ───────────────────────────────────────────

export const createVoucher = async (req, res, next) => {
  try {
    // 1. Lấy partner của user đang login
    const partner = await getPartnerForUser(req.user.id);
    if (!partner) {
      return next(new BusinessException("FORBIDDEN", "Partner profile not found", 403));
    }
    if (partner.status !== "APPROVED") {
      return next(
        new BusinessException(
          "FORBIDDEN",
          "Partner account must be approved before creating vouchers",
          403
        )
      );
    }

    // 2. Validate body
    const errors = validateVoucherBody(req.body, false);
    if (errors.length) {
      return next(new BusinessException("VALIDATION_FAILED", errors.join("; "), 400));
    }

    const {
      name,
      description = null,
      category = null,
      original_price,
      sale_price,
      stock,
      sale_start = null,
      sale_end = null,
      valid_until = null,
      terms = null,
      image_url = null,
      branch_ids = [],        // array of UUID
      submit_for_approval = false,
    } = req.body;

    // 3. Validate branch_ids nếu có (deduplicate trước khi check ownership)
    let validatedBranchIds = [];
    if (Array.isArray(branch_ids) && branch_ids.length > 0) {
      const uniqueBranchIds = Array.from(new Set(branch_ids.map(String)));
      const allValid = uniqueBranchIds.every(isValidUuid);
      if (!allValid) {
        return next(new BusinessException("VALIDATION_FAILED", "One or more branch_ids are invalid UUIDs", 400));
      }

      const owned = await query(checkBranchesOwnedQuery, [uniqueBranchIds, partner.id]);
      if (owned.rows.length !== uniqueBranchIds.length) {
        return next(new BusinessException("VALIDATION_FAILED", "Some branches do not belong to your partner account", 400));
      }
      validatedBranchIds = uniqueBranchIds;
    }

    // 4. Xác định initial status
    const initialStatus = submit_for_approval
      ? VOUCHER_STATUS.PENDING_APPROVAL
      : VOUCHER_STATUS.DRAFT;

    // 5. Transaction: insert voucher + branch mapping (use withTransaction helper)
    const result = await withTransaction(async (client) => {
      const vResult = await client.query(insertVoucherQuery, [
        partner.id,
        name.trim(),
        description,
        category,
        parseFloat(original_price),
        parseFloat(sale_price),
        parseInt(stock, 10),
        sale_start || null,
        sale_end || null,
        valid_until || null,
        terms,
        image_url,
        initialStatus,
      ]);

      const voucher = vResult.rows[0];

      if (validatedBranchIds.length > 0) {
        await client.query(insertVoucherBranchesQuery, [
          voucher.id,
          validatedBranchIds,
        ]);
      }

      return voucher.id;
    });

    // Lấy lại record đầy đủ (kèm branches)
    const full = await query(getVoucherByIdFullQuery, [result]);
    return sendSuccess(res, { voucher: full.rows[0] }, 201);
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/vouchers/:id ────────────────────────────────────────

export const updateVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid voucher id", 400));
    }

    // 1. Lấy partner
    const partner = await getPartnerForUser(req.user.id);
    if (!partner) {
      return next(new BusinessException("FORBIDDEN", "Partner profile not found", 403));
    }

    // 2. Kiểm tra voucher tồn tại và thuộc partner
    const existing = await query(getVoucherByIdFullQuery, [id]);
    const voucher = existing.rows[0];

    if (!voucher) {
      return next(new BusinessException("NOT_FOUND", "Voucher not found", 404));
    }
    if (voucher.partner_id !== partner.id) {
      return next(new BusinessException("FORBIDDEN", "You can only edit your own vouchers", 403));
    }
    if (!EDITABLE_STATUSES.includes(voucher.status)) {
      return next(
        new BusinessException(
          "CONFLICT",
          `Cannot edit voucher with status '${voucher.status}'. Only DRAFT or REJECTED vouchers can be edited`,
          409
        )
      );
    }

    // 3. Validate body (partial update)
    const errors = validateVoucherBody(req.body, true);
    if (errors.length) {
      return next(new BusinessException("VALIDATION_FAILED", errors.join("; "), 400));
    }

    const {
      name = null,
      description = null,
      category = null,
      original_price = null,
      sale_price = null,
      stock = null,
      sale_start = null,
      sale_end = null,
      valid_until = null,
      terms = null,
      image_url = null,
      branch_ids,              // undefined = không đổi, [] = xóa hết
      submit_for_approval = false,
    } = req.body;

    // 4. Cross-field price check với giá hiện tại nếu chỉ update 1 field
    const newOp = original_price !== null ? parseFloat(original_price) : parseFloat(voucher.original_price);
    const newSp = sale_price !== null ? parseFloat(sale_price) : parseFloat(voucher.sale_price);
    if (newSp >= newOp) {
      return next(new BusinessException("VALIDATION_FAILED", "sale_price must be less than original_price (RB-02)", 400));
    }

    // 5. Validate branches nếu có (deduplicate before ownership check)
    let updatedBranchIds = null; // null = không cập nhật mapping
    if (Array.isArray(branch_ids)) {
      let uniqueBranchIds = branch_ids;
      if (branch_ids.length > 0) {
        uniqueBranchIds = Array.from(new Set(branch_ids.map(String)));
        const allValid = uniqueBranchIds.every(isValidUuid);
        if (!allValid) {
          return next(new BusinessException("VALIDATION_FAILED", "One or more branch_ids are invalid UUIDs", 400));
        }
        const owned = await query(checkBranchesOwnedQuery, [uniqueBranchIds, partner.id]);
        if (owned.rows.length !== uniqueBranchIds.length) {
          return next(new BusinessException("VALIDATION_FAILED", "Some branches do not belong to your partner account", 400));
        }
      }
      updatedBranchIds = uniqueBranchIds; // có thể be []
    }

    // 6. Xác định next status
    const nextStatus = submit_for_approval
      ? VOUCHER_STATUS.PENDING_APPROVAL
      : VOUCHER_STATUS.DRAFT;

    // 7. Transaction (use withTransaction helper)
    const updatedId = await withTransaction(async (client) => {
      const uResult = await client.query(updateVoucherQuery, [
        name ? name.trim() : null,
        description,
        category,
        original_price !== null ? parseFloat(original_price) : null,
        sale_price !== null ? parseFloat(sale_price) : null,
        stock !== null ? parseInt(stock, 10) : null,
        sale_start,
        sale_end,
        valid_until,
        terms,
        image_url,
        nextStatus,
        id,
        partner.id,
        EDITABLE_STATUSES,
      ]);

      const updated = uResult.rows[0];
      if (!updated) {
        // returning null will cause outer handler to respond with conflict
        return null;
      }

      // Cập nhật branch mapping nếu được cung cấp
      if (updatedBranchIds !== null) {
        await client.query(deleteVoucherBranchesQuery, [id]);
        if (updatedBranchIds.length > 0) {
          await client.query(insertVoucherBranchesQuery, [id, updatedBranchIds]);
        }
      }

      return updated.id;
    });

    if (!updatedId) {
      return next(new BusinessException("CONFLICT", "Update failed: voucher state changed concurrently", 409));
    }

    const full = await query(getVoucherByIdFullQuery, [id]);
    return sendSuccess(res, { voucher: full.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/vouchers/:id ────────────────────────────────────────

export const getVoucherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid voucher id", 400));
    }

    const user = req.user; // có thể null nếu route không require auth

    let result;

    // Partner xem voucher của chính mình → trả full (kể cả DRAFT)
    if (user?.role === "PARTNER") {
      const partner = await getPartnerForUser(user.id);
      if (partner) {
        result = await query(getVoucherByIdFullQuery, [id]);
        const voucher = result.rows[0];
        if (voucher && voucher.partner_id === partner.id) {
          return sendSuccess(res, { voucher });
        }
      }
    }

    // Admin xem được tất cả
    if (user?.role === "ADMIN") {
      result = await query(getVoucherByIdFullQuery, [id]);
      const voucher = result.rows[0];
      if (!voucher) return next(new BusinessException("NOT_FOUND", "Voucher not found", 404));
      return sendSuccess(res, { voucher });
    }

    // Public / customer: chỉ xem APPROVED (RB-01)
    result = await query(getPublicVoucherByIdQuery, [id]);
    const voucher = result.rows[0];
    if (!voucher) {
      return next(new BusinessException("NOT_FOUND", "Voucher not found", 404));
    }
    return sendSuccess(res, { voucher });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/vouchers ────────────────────────────────────────────

export const listVouchers = async (req, res, next) => {
  try {
    const user = req.user; // optional

    const {
      category,
      status,
      partner: partner_id,
      q,
      min_price,
      max_price,
      min_discount,
      area,
      active_status,
    } = req.query;
    const page  = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 20);
    const offset = (page - 1) * limit;

    // Validate partner_id nếu có
    if (partner_id && !isValidUuid(partner_id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid partner id", 400));
    }

    // ── Partner: xem danh sách voucher của chính mình ──────────
    if (user?.role === "PARTNER") {
      const partnerRecord = await getPartnerForUser(user.id);
      if (!partnerRecord) {
        return next(new BusinessException("FORBIDDEN", "Partner profile not found", 403));
      }

      // Validate status nếu có
      const allowedStatuses = Object.values(VOUCHER_STATUS);
      if (status && !allowedStatuses.includes(status.toUpperCase())) {
        return next(new BusinessException("VALIDATION_FAILED", `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`, 400));
      }

      const [rows, count] = await Promise.all([
        query(listPartnerVouchersQuery, [
          partnerRecord.id,
          status ? status.toUpperCase() : null,
          category || null,
          limit,
          offset,
        ]),
        query(countPartnerVouchersQuery, [
          partnerRecord.id,
          status ? status.toUpperCase() : null,
          category || null,
        ]),
      ]);

      return sendSuccess(res, {
        vouchers: rows.rows,
        pagination: {
          total: parseInt(count.rows[0].total, 10),
          page,
          limit,
        },
      });
    }

    // ── Public / Customer / Admin: chỉ xem APPROVED (RB-01) ────
    const publicStatus = active_status
      ? String(active_status).toUpperCase()
      : "ACTIVE";
    const normalizedStatus = publicStatus === "ALL" ? null : publicStatus;

    const [rows, count] = await Promise.all([
      query(listPublicVouchersQuery, [
        q || null,
        category || null,
        partner_id || null,
        min_price ? parseFloat(min_price) : null,
        max_price ? parseFloat(max_price) : null,
        min_discount ? parseFloat(min_discount) : null,
        area || null,
        normalizedStatus,
        limit,
        offset,
      ]),
      query(countPublicVouchersQuery, [
        q || null,
        category || null,
        partner_id || null,
        min_price ? parseFloat(min_price) : null,
        max_price ? parseFloat(max_price) : null,
        min_discount ? parseFloat(min_discount) : null,
        area || null,
        normalizedStatus,
      ]),
    ]);

    return sendSuccess(res, {
      vouchers: rows.rows,
      pagination: {
        total: parseInt(count.rows[0].total, 10),
        page,
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
};
