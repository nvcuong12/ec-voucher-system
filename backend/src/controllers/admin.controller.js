import { query } from "../config/database.js";
import { BusinessException } from "../utils/BusinessException.js";
import {
  ADMIN_PARTNER_STATUS,
  ADMIN_LOG_ACTION,
  ADMIN_LOG_ENTITY,
  ADMIN_USER_STATUS,
  ADMIN_USER_STATUS_LABEL,
  ADMIN_VOUCHER_STATUS,
  listPendingPartnersQuery,
  listPendingVouchersQuery,
  approveVoucherQuery,
  insertSystemLogQuery,
  rejectVoucherQuery,
  updatePartnerStatusQuery,
} from "../models/admin.queries.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (value) => UUID_PATTERN.test(String(value || ""));

const sendSuccess = (res, data, status = 200) => res.status(status).json({ data });

const logAdminAction = async (userId, action, entity, entityId) => {
  if (!userId) return;

  try {
    await query(insertSystemLogQuery, [userId, action, entity, entityId]);
  } catch (err) {
    console.error("Failed to write admin audit log:", err.message);
  }
};

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
};

const normalizeUserStatus = (body = {}) => {
  if (Object.prototype.hasOwnProperty.call(body, "is_active")) {
    return normalizeBoolean(body.is_active);
  }

  if (typeof body.status === "string") {
    const normalized = body.status.trim().toUpperCase();
    if (normalized === ADMIN_USER_STATUS_LABEL.ACTIVE) return ADMIN_USER_STATUS.ACTIVE;
    if (normalized === ADMIN_USER_STATUS_LABEL.SUSPENDED) return ADMIN_USER_STATUS.SUSPENDED;
  }

  return null;
};

export const getUsers = async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, email, full_name, phone, role, is_active, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    return sendSuccess(res, { users: result.rows });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid user id", 400));
    }

    const nextIsActive = normalizeUserStatus(req.body);
    if (nextIsActive === null) {
      return next(new BusinessException("VALIDATION_FAILED", `status must be ${ADMIN_USER_STATUS_LABEL.ACTIVE} or ${ADMIN_USER_STATUS_LABEL.SUSPENDED}, or is_active must be a boolean`, 400));
    }

    const result = await query(
      `UPDATE users
       SET is_active = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, full_name, phone, role, is_active, created_at, updated_at`,
      [nextIsActive, id]
    );

    const user = result.rows[0];
    if (!user) {
      return next(new BusinessException("NOT_FOUND", "User not found", 404));
    }

    return sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

export const getPendingVouchers = async (_req, res, next) => {
  try {
    const result = await query(listPendingVouchersQuery, [ADMIN_VOUCHER_STATUS.PENDING_APPROVAL]);

    return sendSuccess(res, { vouchers: result.rows });
  } catch (err) {
    next(err);
  }
};

export const approveVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid voucher id", 400));
    }

    const result = await query(approveVoucherQuery, [
      ADMIN_VOUCHER_STATUS.APPROVED,
      id,
      ADMIN_VOUCHER_STATUS.PENDING_APPROVAL,
    ]);

    const voucher = result.rows[0];
    if (!voucher) {
      const exists = await query("SELECT id FROM vouchers WHERE id = $1", [id]);
      if (!exists.rows[0]) {
        return next(new BusinessException("NOT_FOUND", "Voucher not found", 404));
      }
      return next(new BusinessException("CONFLICT", "Voucher is not pending approval", 409));
    }

    await logAdminAction(
      req.user?.id,
      ADMIN_LOG_ACTION.APPROVE_VOUCHER,
      ADMIN_LOG_ENTITY.VOUCHER,
      voucher.id
    );

    return sendSuccess(res, { voucher });
  } catch (err) {
    next(err);
  }
};

export const rejectVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid voucher id", 400));
    }

    const rejectionReason = typeof req.body?.rejection_reason === "string"
      ? req.body.rejection_reason.trim()
      : "";

    if (!rejectionReason) {
      return next(new BusinessException("VALIDATION_FAILED", "rejection_reason is required", 400));
    }

    const result = await query(rejectVoucherQuery, [
      ADMIN_VOUCHER_STATUS.REJECTED,
      rejectionReason,
      id,
      ADMIN_VOUCHER_STATUS.PENDING_APPROVAL,
    ]);

    const voucher = result.rows[0];
    if (!voucher) {
      const exists = await query("SELECT id FROM vouchers WHERE id = $1", [id]);
      if (!exists.rows[0]) {
        return next(new BusinessException("NOT_FOUND", "Voucher not found", 404));
      }
      return next(new BusinessException("CONFLICT", "Voucher is not pending approval", 409));
    }

    await logAdminAction(
      req.user?.id,
      ADMIN_LOG_ACTION.REJECT_VOUCHER,
      ADMIN_LOG_ENTITY.VOUCHER,
      voucher.id
    );

    return sendSuccess(res, { voucher });
  } catch (err) {
    next(err);
  }
};

export const getPendingPartners = async (_req, res, next) => {
  try {
    const result = await query(listPendingPartnersQuery, [ADMIN_PARTNER_STATUS.PENDING]);
    return sendSuccess(res, { partners: result.rows });
  } catch (err) {
    next(err);
  }
};

export const updatePartnerApprovalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid partner id", 400));
    }

    const nextStatus = typeof req.body?.status === "string" ? req.body.status.trim().toUpperCase() : "";
    if (!Object.values(ADMIN_PARTNER_STATUS).includes(nextStatus) || nextStatus === ADMIN_PARTNER_STATUS.PENDING) {
      return next(new BusinessException("VALIDATION_FAILED", `status must be ${ADMIN_PARTNER_STATUS.APPROVED} or ${ADMIN_PARTNER_STATUS.REJECTED}`, 400));
    }

    const rejectionReason = typeof req.body?.rejection_reason === "string"
      ? req.body.rejection_reason.trim()
      : null;

    if (nextStatus === ADMIN_PARTNER_STATUS.REJECTED && !rejectionReason) {
      return next(new BusinessException("VALIDATION_FAILED", "rejection_reason is required when rejecting a partner", 400));
    }

    const result = await query(updatePartnerStatusQuery, [
      nextStatus,
      nextStatus === ADMIN_PARTNER_STATUS.REJECTED ? rejectionReason : null,
      id,
      ADMIN_PARTNER_STATUS.PENDING,
    ]);

    const partner = result.rows[0];
    if (!partner) {
      const exists = await query("SELECT id FROM partners WHERE id = $1", [id]);
      if (!exists.rows[0]) {
        return next(new BusinessException("NOT_FOUND", "Partner not found", 404));
      }
      return next(new BusinessException("CONFLICT", "Partner is not pending approval", 409));
    }

    await logAdminAction(
      req.user?.id,
      nextStatus === ADMIN_PARTNER_STATUS.APPROVED
        ? ADMIN_LOG_ACTION.APPROVE_PARTNER
        : ADMIN_LOG_ACTION.REJECT_PARTNER,
      ADMIN_LOG_ENTITY.PARTNER,
      partner.id
    );

    return sendSuccess(res, { partner });
  } catch (err) {
    next(err);
  }
};