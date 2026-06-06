import { query } from "../config/database.js";
import { BusinessException } from "../utils/BusinessException.js";
import {
  ADMIN_PARTNER_STATUS,
  ADMIN_LOG_ACTION,
  ADMIN_LOG_ENTITY,
  ADMIN_USER_STATUS,
  ADMIN_USER_STATUS_LABEL,
  ADMIN_VOUCHER_STATUS,
  createBannerQuery,
  createCategoryQuery,
  createContentPageQuery,
  createPopupQuery,
  getActiveContentPageBySlugQuery,
  getActivePopupQuery,
  listAllVouchersQuery,
  listAllPartnersQuery,
  listBannersQuery,
  listCategoriesQuery,
  listContentPagesQuery,
  listPartnerBranchesQuery,
  listPendingPartnersQuery,
  listPendingVouchersQuery,
  listPopupsQuery,
  updateBannerQuery,
  updateBranchStatusQuery,
  updateCategoryQuery,
  updateContentPageQuery,
  updatePopupQuery,
  updatePartnerStatusAnyQuery,
  approveVoucherQuery,
  insertSystemLogQuery,
  rejectVoucherQuery,
  updatePartnerStatusQuery,
  updateUserRoleQuery,
  updateVoucherStatusQuery,
} from "../models/admin.queries.js";
import { selectOrderItemsByOrderIdsQuery } from "../models/order.queries.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (value) => UUID_PATTERN.test(String(value || ""));

const sendSuccess = (res, data, status = 200) => res.status(status).json({ data });

const getRequestIp = (req) =>
  req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.ip ||
  req.socket?.remoteAddress ||
  null;

const logAdminAction = async (req, action, entity, entityId, details = null) => {
  if (!req.user?.id) return;

  try {
    await query(insertSystemLogQuery, [
      req.user.id,
      action,
      entity,
      entityId,
      details ? JSON.stringify(details) : null,
      getRequestIp(req),
    ]);
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

    await logAdminAction(
      req,
      ADMIN_LOG_ACTION.UPDATE_USER_STATUS,
      ADMIN_LOG_ENTITY.USER,
      user.id
    );

    return sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid user id", 400));
    }

    const nextRole = typeof req.body?.role === "string" ? req.body.role.trim().toUpperCase() : "";
    if (!nextRole || !["ADMIN", "PARTNER", "CUSTOMER"].includes(nextRole)) {
      return next(new BusinessException("VALIDATION_FAILED", "role must be ADMIN, PARTNER, or CUSTOMER", 400));
    }

    const result = await query(updateUserRoleQuery, [nextRole, id]);
    const user = result.rows[0];
    if (!user) {
      return next(new BusinessException("NOT_FOUND", "User not found", 404));
    }

    await logAdminAction(
      req,
      ADMIN_LOG_ACTION.UPDATE_USER_ROLE,
      ADMIN_LOG_ENTITY.USER,
      user.id
    );

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

export const getAllVouchers = async (_req, res, next) => {
  try {
    const result = await query(listAllVouchersQuery);
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

    const currentResult = await query(
      `SELECT v.id, v.name, v.status, p.business_name
       FROM vouchers v
       JOIN partners p ON p.id = v.partner_id
       WHERE v.id = $1`,
      [id]
    );
    const currentVoucher = currentResult.rows[0];

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
      req,
      ADMIN_LOG_ACTION.APPROVE_VOUCHER,
      ADMIN_LOG_ENTITY.VOUCHER,
      voucher.id,
      {
        voucher_name: voucher.name,
        partner: currentVoucher?.business_name,
        old_status: currentVoucher?.status,
        new_status: voucher.status,
      }
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

    const currentResult = await query(
      `SELECT v.id, v.name, v.status, p.business_name
       FROM vouchers v
       JOIN partners p ON p.id = v.partner_id
       WHERE v.id = $1`,
      [id]
    );
    const currentVoucher = currentResult.rows[0];

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
      req,
      ADMIN_LOG_ACTION.REJECT_VOUCHER,
      ADMIN_LOG_ENTITY.VOUCHER,
      voucher.id,
      {
        voucher_name: voucher.name,
        partner: currentVoucher?.business_name,
        old_status: currentVoucher?.status,
        new_status: voucher.status,
        rejection_reason: rejectionReason,
      }
    );

    return sendSuccess(res, { voucher });
  } catch (err) {
    next(err);
  }
};

export const updateVoucherStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid voucher id", 400));
    }

    const nextStatus = typeof req.body?.status === "string" ? req.body.status.trim().toUpperCase() : "";
    if (!nextStatus || !Object.values(ADMIN_VOUCHER_STATUS).includes(nextStatus)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid voucher status", 400));
    }

    const allowedCurrent = [ADMIN_VOUCHER_STATUS.APPROVED, ADMIN_VOUCHER_STATUS.SUSPENDED];
    const result = await query(updateVoucherStatusQuery, [nextStatus, id, allowedCurrent]);
    const voucher = result.rows[0];
    if (!voucher) {
      const exists = await query("SELECT id, status FROM vouchers WHERE id = $1", [id]);
      if (!exists.rows[0]) {
        return next(new BusinessException("NOT_FOUND", "Voucher not found", 404));
      }
      return next(new BusinessException("CONFLICT", "Voucher status cannot be updated", 409));
    }

    const action = nextStatus === ADMIN_VOUCHER_STATUS.SUSPENDED
      ? ADMIN_LOG_ACTION.SUSPEND_VOUCHER
      : ADMIN_LOG_ACTION.RESUME_VOUCHER;

    await logAdminAction(req, action, ADMIN_LOG_ENTITY.VOUCHER, voucher.id, { status: nextStatus });

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

export const getAllPartners = async (_req, res, next) => {
  try {
    const result = await query(listAllPartnersQuery);
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
      req,
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

export const updatePartnerStatusAny = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid partner id", 400));
    }

    const nextStatus = typeof req.body?.status === "string" ? req.body.status.trim().toUpperCase() : "";
    if (!nextStatus || !Object.values(ADMIN_PARTNER_STATUS).includes(nextStatus)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid partner status", 400));
    }

    const rejectionReason = typeof req.body?.rejection_reason === "string"
      ? req.body.rejection_reason.trim()
      : null;

    if (nextStatus === ADMIN_PARTNER_STATUS.REJECTED && !rejectionReason) {
      return next(new BusinessException("VALIDATION_FAILED", "rejection_reason is required when rejecting a partner", 400));
    }

    const result = await query(updatePartnerStatusAnyQuery, [
      nextStatus,
      nextStatus === ADMIN_PARTNER_STATUS.REJECTED ? rejectionReason : null,
      id,
    ]);

    const partner = result.rows[0];
    if (!partner) {
      return next(new BusinessException("NOT_FOUND", "Partner not found", 404));
    }

    const action = nextStatus === ADMIN_PARTNER_STATUS.SUSPENDED
      ? ADMIN_LOG_ACTION.SUSPEND_PARTNER
      : ADMIN_LOG_ACTION.RESUME_PARTNER;

    await logAdminAction(req, action, ADMIN_LOG_ENTITY.PARTNER, partner.id, { status: nextStatus });

    return sendSuccess(res, { partner });
  } catch (err) {
    next(err);
  }
};

export const getPartnerBranches = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid partner id", 400));
    }

    const result = await query(listPartnerBranchesQuery, [id]);
    return sendSuccess(res, { branches: result.rows });
  } catch (err) {
    next(err);
  }
};

export const updatePartnerBranchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid branch id", 400));
    }

    if (typeof req.body?.is_active !== "boolean") {
      return next(new BusinessException("VALIDATION_FAILED", "is_active must be boolean", 400));
    }

    const result = await query(updateBranchStatusQuery, [req.body.is_active, id]);
    const branch = result.rows[0];
    if (!branch) {
      return next(new BusinessException("NOT_FOUND", "Branch not found", 404));
    }

    await logAdminAction(req, ADMIN_LOG_ACTION.UPDATE_CONTENT, ADMIN_LOG_ENTITY.PARTNER, branch.id, { is_active: req.body.is_active });
    return sendSuccess(res, { branch });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (_req, res, next) => {
  try {
    const ordersResult = await query(
      `SELECT o.id, o.customer_id, o.total_amount, o.status, o.payment_ref, o.paid_at, o.created_at, o.updated_at,
              u.email AS customer_email, u.full_name AS customer_name
       FROM orders o
       JOIN users u ON u.id = o.customer_id
       ORDER BY o.created_at DESC`
    );

    const orders = ordersResult.rows;
    if (orders.length === 0) {
      return res.json({ data: { orders: [] } });
    }

    const orderIds = orders.map((o) => o.id);
    const itemsResult = await query(selectOrderItemsByOrderIdsQuery, [orderIds]);
    const itemsByOrder = new Map();
    for (const item of itemsResult.rows) {
      if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
      itemsByOrder.get(item.order_id).push(item);
    }

    const payload = orders.map((order) => ({
      ...order,
      items: itemsByOrder.get(order.id) || [],
    }));

    return res.json({ data: { orders: payload } });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid order id", 400));
    }

    const nextStatus = typeof req.body?.status === "string" ? req.body.status.trim().toUpperCase() : "";
    if (!nextStatus || !["CANCELLED", "REFUNDED"].includes(nextStatus)) {
      return next(new BusinessException("VALIDATION_FAILED", "status must be CANCELLED or REFUNDED", 400));
    }

    const currentRes = await query(
      "SELECT id, status FROM orders WHERE id = $1",
      [id]
    );
    const current = currentRes.rows[0];
    if (!current) {
      return next(new BusinessException("NOT_FOUND", "Order not found", 404));
    }
    if (nextStatus === "CANCELLED" && current.status !== "PENDING") {
      return next(new BusinessException("CONFLICT", "Only pending orders can be cancelled", 409));
    }
    if (nextStatus === "REFUNDED" && current.status !== "PAID") {
      return next(new BusinessException("CONFLICT", "Only paid orders can be refunded", 409));
    }

    const result = await query(
      `UPDATE orders
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, customer_id, total_amount, status, payment_ref, payment_method,
                 recipient_name, recipient_phone, recipient_email, note,
                 paid_at, created_at, updated_at`,
      [nextStatus, id]
    );

    const order = result.rows[0];

    if (nextStatus === "REFUNDED") {
      await query(
        `UPDATE issued_vouchers
         SET status = 'CANCELLED'
         WHERE order_item_id IN (
           SELECT id FROM order_items WHERE order_id = $1
         )`,
        [order.id]
      );
    }

    await logAdminAction(req, ADMIN_LOG_ACTION.UPDATE_ORDER_STATUS, ADMIN_LOG_ENTITY.ORDER, order.id, { status: nextStatus });

    return sendSuccess(res, { order });
  } catch (err) {
    next(err);
  }
};

export const getLogs = async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT l.id, l.user_id, l.action, l.entity, l.entity_id, l.details, l.ip_address, l.created_at,
              u.email AS user_email, u.full_name AS user_name
       FROM system_logs l
       LEFT JOIN users u ON u.id = l.user_id
       ORDER BY l.created_at DESC
       LIMIT 200`
    );

    return res.json({ data: { logs: result.rows } });
  } catch (err) {
    next(err);
  }
};

export const getComplaints = async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT c.id, c.customer_id, c.voucher_id, c.issued_voucher_id, c.order_id,
              c.subject, c.message, c.status, c.admin_response, c.resolved_by,
              c.resolved_at, c.created_at, c.updated_at,
              u.email AS customer_email,
              u.full_name AS customer_name,
              v.name AS voucher_name,
              iv.code AS voucher_code
       FROM complaints c
       JOIN users u ON u.id = c.customer_id
       LEFT JOIN vouchers v ON v.id = c.voucher_id
       LEFT JOIN issued_vouchers iv ON iv.id = c.issued_voucher_id
       ORDER BY c.created_at DESC`
    );

    return res.json({ data: { complaints: result.rows } });
  } catch (err) {
    next(err);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid complaint id", 400));
    }

    const nextStatus = typeof req.body?.status === "string"
      ? req.body.status.trim().toUpperCase()
      : "";
    const allowedStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];
    if (!allowedStatuses.includes(nextStatus)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid complaint status", 400));
    }

    const adminResponse = typeof req.body?.admin_response === "string"
      ? req.body.admin_response.trim()
      : null;
    if ((nextStatus === "RESOLVED" || nextStatus === "REJECTED") && !adminResponse) {
      return next(
        new BusinessException(
          "VALIDATION_FAILED",
          "admin_response is required when resolving or rejecting a complaint",
          400
        )
      );
    }

    const result = await query(
      `UPDATE complaints
       SET status = $1,
           admin_response = COALESCE($2, admin_response),
           resolved_by = CASE WHEN $1 IN ('RESOLVED', 'REJECTED') THEN $3 ELSE resolved_by END,
           resolved_at = CASE WHEN $1 IN ('RESOLVED', 'REJECTED') THEN NOW() ELSE resolved_at END,
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, customer_id, voucher_id, issued_voucher_id, order_id,
                 subject, message, status, admin_response, resolved_by,
                 resolved_at, created_at, updated_at`,
      [nextStatus, adminResponse, req.user.id, id]
    );

    const complaint = result.rows[0];
    if (!complaint) {
      return next(new BusinessException("NOT_FOUND", "Complaint not found", 404));
    }

    await logAdminAction(req, "UPDATE_COMPLAINT_STATUS", "complaint", complaint.id, {
      status: nextStatus,
    });

    return res.json({ data: { complaint } });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (_req, res, next) => {
  try {
    const result = await query(listCategoriesQuery);
    return sendSuccess(res, { categories: result.rows });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      return next(new BusinessException("VALIDATION_FAILED", "name is required", 400));
    }

    const isActive = typeof req.body?.is_active === "boolean" ? req.body.is_active : true;
    const result = await query(createCategoryQuery, [name, isActive]);
    const category = result.rows[0];

    await logAdminAction(req, ADMIN_LOG_ACTION.UPDATE_CONTENT, ADMIN_LOG_ENTITY.CONTENT, category.id, { type: "category", operation: "create" });
    return sendSuccess(res, { category }, 201);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid category id", 400));
    }

    const name = typeof req.body?.name === "string" ? req.body.name.trim() : null;
    const isActive = typeof req.body?.is_active === "boolean" ? req.body.is_active : null;
    const result = await query(updateCategoryQuery, [id, name, isActive]);
    const category = result.rows[0];
    if (!category) {
      return next(new BusinessException("NOT_FOUND", "Category not found", 404));
    }

    await logAdminAction(req, ADMIN_LOG_ACTION.UPDATE_CONTENT, ADMIN_LOG_ENTITY.CONTENT, category.id, { type: "category", operation: "update" });
    return sendSuccess(res, { category });
  } catch (err) {
    next(err);
  }
};

export const getBanners = async (_req, res, next) => {
  try {
    const result = await query(listBannersQuery);
    return sendSuccess(res, { banners: result.rows });
  } catch (err) {
    next(err);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const imageUrl = typeof req.body?.image_url === "string" ? req.body.image_url.trim() : "";
    if (!title || !imageUrl) {
      return next(new BusinessException("VALIDATION_FAILED", "title and image_url are required", 400));
    }

    const linkUrl = typeof req.body?.link_url === "string" ? req.body.link_url.trim() : null;
    const sortOrder = Number.isFinite(req.body?.sort_order) ? req.body.sort_order : 0;
    const isActive = typeof req.body?.is_active === "boolean" ? req.body.is_active : true;

    const result = await query(createBannerQuery, [title, imageUrl, linkUrl, sortOrder, isActive]);
    const banner = result.rows[0];

    await logAdminAction(req, ADMIN_LOG_ACTION.UPDATE_CONTENT, ADMIN_LOG_ENTITY.CONTENT, banner.id, { type: "banner", operation: "create" });
    return sendSuccess(res, { banner }, 201);
  } catch (err) {
    next(err);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid banner id", 400));
    }

    const title = typeof req.body?.title === "string" ? req.body.title.trim() : null;
    const imageUrl = typeof req.body?.image_url === "string" ? req.body.image_url.trim() : null;
    const linkUrl = typeof req.body?.link_url === "string" ? req.body.link_url.trim() : null;
    const sortOrder = Number.isFinite(req.body?.sort_order) ? req.body.sort_order : null;
    const isActive = typeof req.body?.is_active === "boolean" ? req.body.is_active : null;

    const result = await query(updateBannerQuery, [id, title, imageUrl, linkUrl, sortOrder, isActive]);
    const banner = result.rows[0];
    if (!banner) {
      return next(new BusinessException("NOT_FOUND", "Banner not found", 404));
    }

    await logAdminAction(req, ADMIN_LOG_ACTION.UPDATE_CONTENT, ADMIN_LOG_ENTITY.CONTENT, banner.id, { type: "banner", operation: "update" });
    return sendSuccess(res, { banner });
  } catch (err) {
    next(err);
  }
};

export const getContentPages = async (_req, res, next) => {
  try {
    const result = await query(listContentPagesQuery);
    return sendSuccess(res, { pages: result.rows });
  } catch (err) {
    next(err);
  }
};

export const getPublicContentPage = async (req, res, next) => {
  try {
    const slug = typeof req.params?.slug === "string" ? req.params.slug.trim() : "";
    if (!slug) {
      return next(new BusinessException("VALIDATION_FAILED", "slug is required", 400));
    }

    const result = await query(getActiveContentPageBySlugQuery, [slug]);
    const page = result.rows[0];
    if (!page) {
      return next(new BusinessException("NOT_FOUND", "Content page not found", 404));
    }
    return sendSuccess(res, { page });
  } catch (err) {
    next(err);
  }
};

export const createContentPage = async (req, res, next) => {
  try {
    const slug = typeof req.body?.slug === "string" ? req.body.slug.trim() : "";
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
    if (!slug || !title || !content) {
      return next(new BusinessException("VALIDATION_FAILED", "slug, title, content are required", 400));
    }

    const isActive = typeof req.body?.is_active === "boolean" ? req.body.is_active : true;
    const result = await query(createContentPageQuery, [slug, title, content, isActive]);
    const page = result.rows[0];

    await logAdminAction(req, ADMIN_LOG_ACTION.UPDATE_CONTENT, ADMIN_LOG_ENTITY.CONTENT, page.id, { type: "page", operation: "create" });
    return sendSuccess(res, { page }, 201);
  } catch (err) {
    next(err);
  }
};

export const updateContentPage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid page id", 400));
    }

    const slug = typeof req.body?.slug === "string" ? req.body.slug.trim() : null;
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : null;
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : null;
    const isActive = typeof req.body?.is_active === "boolean" ? req.body.is_active : null;

    const result = await query(updateContentPageQuery, [id, slug, title, content, isActive]);
    const page = result.rows[0];
    if (!page) {
      return next(new BusinessException("NOT_FOUND", "Page not found", 404));
    }

    await logAdminAction(req, ADMIN_LOG_ACTION.UPDATE_CONTENT, ADMIN_LOG_ENTITY.CONTENT, page.id, { type: "page", operation: "update" });
    return sendSuccess(res, { page });
  } catch (err) {
    next(err);
  }
};

const normalizeOptionalDate = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export const getActivePopup = async (_req, res, next) => {
  try {
    const result = await query(getActivePopupQuery);
    return sendSuccess(res, { popup: result.rows[0] || null });
  } catch (err) {
    next(err);
  }
};

export const getPopups = async (_req, res, next) => {
  try {
    const result = await query(listPopupsQuery);
    return sendSuccess(res, { popups: result.rows });
  } catch (err) {
    next(err);
  }
};

export const createPopup = async (req, res, next) => {
  try {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
    if (!title || !content) {
      return next(new BusinessException("VALIDATION_FAILED", "title and content are required", 400));
    }

    const startDate = normalizeOptionalDate(req.body?.start_date);
    const endDate = normalizeOptionalDate(req.body?.end_date);
    if (startDate === undefined || endDate === undefined) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid popup date", 400));
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return next(new BusinessException("VALIDATION_FAILED", "start_date must be before end_date", 400));
    }

    const isActive = typeof req.body?.is_active === "boolean" ? req.body.is_active : true;
    const result = await query(createPopupQuery, [title, content, isActive, startDate, endDate]);
    const popup = result.rows[0];

    await logAdminAction(req, ADMIN_LOG_ACTION.UPDATE_CONTENT, ADMIN_LOG_ENTITY.CONTENT, popup.id, { type: "popup", operation: "create" });
    return sendSuccess(res, { popup }, 201);
  } catch (err) {
    next(err);
  }
};

export const updatePopup = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid popup id", 400));
    }

    const title = typeof req.body?.title === "string" ? req.body.title.trim() : null;
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : null;
    const isActive = typeof req.body?.is_active === "boolean" ? req.body.is_active : null;
    const startDate = normalizeOptionalDate(req.body?.start_date);
    const endDate = normalizeOptionalDate(req.body?.end_date);
    if (startDate === undefined || endDate === undefined) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid popup date", 400));
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return next(new BusinessException("VALIDATION_FAILED", "start_date must be before end_date", 400));
    }

    const result = await query(updatePopupQuery, [id, title, content, isActive, startDate, endDate]);
    const popup = result.rows[0];
    if (!popup) {
      return next(new BusinessException("NOT_FOUND", "Popup not found", 404));
    }

    await logAdminAction(req, ADMIN_LOG_ACTION.UPDATE_CONTENT, ADMIN_LOG_ENTITY.CONTENT, popup.id, {
      type: "popup",
      operation: isActive === false ? "hide" : "update",
    });
    return sendSuccess(res, { popup });
  } catch (err) {
    next(err);
  }
};

export const getDashboard = async (_req, res, next) => {
  try {
    const [users, partners, vouchers, orders, revenue, issued, topVouchers, revenueByDay] = await Promise.all([
      query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE role = 'CUSTOMER') AS customers,
           COUNT(*) FILTER (WHERE role = 'PARTNER') AS partners,
           COUNT(*) FILTER (WHERE role = 'ADMIN') AS admins
         FROM users`
      ),
      query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
           COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved,
           COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected
         FROM partners`
      ),
      query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status = 'PENDING_APPROVAL') AS pending,
           COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved,
           COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected
         FROM vouchers`
      ),
      query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status = 'PAID') AS paid,
           COUNT(*) FILTER (WHERE status = 'PENDING') AS pending
         FROM orders`
      ),
      query(
        `SELECT COALESCE(SUM(total_amount), 0) AS revenue
         FROM orders
         WHERE status = 'PAID'`
      ),
      query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status = 'UNUSED') AS unused,
           COUNT(*) FILTER (WHERE status = 'USED') AS used,
           COUNT(*) FILTER (
             WHERE status = 'EXPIRED'
                OR (status = 'UNUSED' AND expires_at IS NOT NULL AND expires_at <= NOW())
           ) AS expired
         FROM issued_vouchers`
      ),
      query(
        `SELECT
           v.id,
           v.name,
           p.business_name,
           SUM(oi.quantity) AS sold_count,
           SUM(oi.quantity * oi.unit_price) AS revenue
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         JOIN vouchers v ON v.id = oi.voucher_id
         JOIN partners p ON p.id = v.partner_id
         WHERE o.status = 'PAID'
         GROUP BY v.id, v.name, p.business_name
         ORDER BY sold_count DESC, revenue DESC
         LIMIT 5`
      ),
      query(
        `SELECT
           DATE_TRUNC('day', paid_at)::date AS day,
           COUNT(*) AS paid_orders,
           COALESCE(SUM(total_amount), 0) AS revenue
         FROM orders
         WHERE status = 'PAID' AND paid_at IS NOT NULL
         GROUP BY DATE_TRUNC('day', paid_at)::date
         ORDER BY day DESC
         LIMIT 7`
      ),
    ]);

    return res.json({
      data: {
        users: users.rows[0],
        partners: partners.rows[0],
        vouchers: vouchers.rows[0],
        orders: orders.rows[0],
        revenue: revenue.rows[0],
        issued_vouchers: issued.rows[0],
        top_vouchers: topVouchers.rows,
        revenue_by_day: revenueByDay.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};
