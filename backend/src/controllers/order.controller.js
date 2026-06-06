// ================================================================
// order.controller.js
// backend/src/controllers/order.controller.js
// ================================================================

import crypto from "crypto";
import { query, withTransaction } from "../config/database.js";
import { BusinessException } from "../utils/BusinessException.js";
import {
  insertOrderItemQuery,
  insertOrderQuery,
  selectOrderByIdQuery,
  selectOrderItemsByOrderIdsQuery,
  selectOrdersByCustomerQuery,
  selectIssuedVouchersByOrderItemIdsQuery,
  selectVouchersForOrderQuery,
  updateOrderPaidQuery,
  updateVoucherStockQuery,
} from "../models/order.queries.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (v) => UUID_RE.test(String(v ?? ""));

const normalizeItems = (items) => {
  const map = new Map();
  for (const item of items) {
    const voucherId = String(item.voucher_id || "").trim();
    const quantity = parseInt(item.quantity, 10);
    if (!isValidUuid(voucherId)) {
      throw new BusinessException("VALIDATION_FAILED", "Invalid voucher_id", 400);
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new BusinessException("VALIDATION_FAILED", "quantity must be a positive integer", 400);
    }
    map.set(voucherId, (map.get(voucherId) || 0) + quantity);
  }
  return Array.from(map.entries()).map(([voucher_id, quantity]) => ({
    voucher_id,
    quantity,
  }));
};

const mapOrderItems = (itemsRows) => {
  const byOrder = new Map();
  for (const row of itemsRows) {
    if (!byOrder.has(row.order_id)) byOrder.set(row.order_id, []);
    byOrder.get(row.order_id).push({
      id: row.id,
      order_item_id: row.id,
      order_id: row.order_id,
      voucher_id: row.voucher_id,
      quantity: row.quantity,
      unit_price: row.unit_price,
      subtotal: Number(row.unit_price || 0) * Number(row.quantity || 0),
      created_at: row.created_at,
      name: row.name,
      voucher_name: row.name,
      image_url: row.image_url,
      sale_end: row.sale_end,
      valid_until: row.valid_until,
      business_name: row.business_name,
      issued_vouchers: [],
    });
  }
  return byOrder;
};

const mapIssuedVouchers = (issuedRows) => {
  const byItem = new Map();
  for (const row of issuedRows) {
    if (!byItem.has(row.order_item_id)) byItem.set(row.order_item_id, []);
    byItem.get(row.order_item_id).push({
      id: row.id,
      code: row.code,
      status: row.status,
      issued_at: row.issued_at,
      expires_at: row.expires_at,
      used_at: row.used_at,
      used_branch_id: row.used_at_branch,
      used_branch_name: row.used_branch_name,
    });
  }
  return byItem;
};

const generateCode = () => `VCH-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

const buildOrderResponse = async (orderId) => {
  const orderResult = await query(selectOrderByIdQuery, [orderId]);
  const order = orderResult.rows[0];
  if (!order) return null;
  const itemsResult = await query(selectOrderItemsByOrderIdsQuery, [[orderId]]);
  const itemsMap = mapOrderItems(itemsResult.rows);
  const itemIds = itemsResult.rows.map((item) => item.id);
  if (itemIds.length > 0 && order.status === "PAID") {
    const issuedResult = await query(selectIssuedVouchersByOrderItemIdsQuery, [itemIds, order.customer_id]);
    const issuedMap = mapIssuedVouchers(issuedResult.rows);
    for (const item of itemsMap.get(orderId) || []) {
      item.issued_vouchers = issuedMap.get(item.id) || [];
    }
  }
  return { ...order, items: itemsMap.get(orderId) || [] };
};

export const createOrder = async (req, res, next) => {
  try {
    const rawItems = req.body?.items;
    const {
      recipient_name,
      recipient_phone,
      recipient_email,
      payment_method,
      note,
    } = req.body || {};

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return next(new BusinessException("VALIDATION_FAILED", "items is required", 400));
    }

    if (!payment_method || typeof payment_method !== "string") {
      return next(new BusinessException("VALIDATION_FAILED", "payment_method is required", 400));
    }

    if (!recipient_name || !recipient_phone) {
      return next(new BusinessException("VALIDATION_FAILED", "recipient_name and recipient_phone are required", 400));
    }

    const items = normalizeItems(rawItems);

    const orderId = await withTransaction(async (client) => {
      const voucherIds = items.map((i) => i.voucher_id);
      const vouchersResult = await client.query(selectVouchersForOrderQuery, [voucherIds]);

      if (vouchersResult.rows.length !== voucherIds.length) {
        throw new BusinessException("NOT_FOUND", "One or more vouchers not found", 404);
      }

      const now = new Date();
      const voucherMap = new Map(vouchersResult.rows.map((v) => [v.id, v]));

      let total = 0;
      for (const item of items) {
        const voucher = voucherMap.get(item.voucher_id);
        if (!voucher || voucher.status !== "APPROVED") {
          throw new BusinessException("CONFLICT", "Voucher is not available for purchase", 409);
        }
        if (voucher.sale_start && new Date(voucher.sale_start) > now) {
          throw new BusinessException("CONFLICT", "Voucher sale has not started", 409);
        }
        if (voucher.sale_end && new Date(voucher.sale_end) <= now) {
          throw new BusinessException("CONFLICT", "Voucher sale has ended", 409);
        }
        if (voucher.stock < item.quantity) {
          throw new BusinessException("CONFLICT", "Voucher out of stock", 409);
        }
        total += parseFloat(voucher.sale_price) * item.quantity;
      }

      const orderResult = await client.query(insertOrderQuery, [
        req.user.id,
        total,
        payment_method,
        recipient_name,
        recipient_phone,
        recipient_email || null,
        note || null,
      ]);
      const order = orderResult.rows[0];

      for (const item of items) {
        const voucher = voucherMap.get(item.voucher_id);
        await client.query(insertOrderItemQuery, [
          order.id,
          item.voucher_id,
          item.quantity,
          voucher.sale_price,
        ]);
      }

      return order.id;
    });

    const order = await buildOrderResponse(orderId);
    return res.status(201).json({ data: { order } });
  } catch (err) {
    next(err);
  }
};

export const listMyOrders = async (req, res, next) => {
  try {
    const ordersResult = await query(selectOrdersByCustomerQuery, [req.user.id]);
    const orders = ordersResult.rows;
    if (orders.length === 0) {
      return res.json({ data: { orders: [] } });
    }

    const orderIds = orders.map((o) => o.id);
    const itemsResult = await query(selectOrderItemsByOrderIdsQuery, [orderIds]);
    const itemsMap = mapOrderItems(itemsResult.rows);
    const itemIds = itemsResult.rows.map((item) => item.id);
    const paidOrderIds = new Set(orders.filter((order) => order.status === "PAID").map((order) => order.id));
    if (itemIds.length > 0 && paidOrderIds.size > 0) {
      const issuedResult = await query(selectIssuedVouchersByOrderItemIdsQuery, [itemIds, req.user.id]);
      const issuedMap = mapIssuedVouchers(issuedResult.rows);
      for (const items of itemsMap.values()) {
        for (const item of items) {
          item.issued_vouchers = paidOrderIds.has(item.order_id)
            ? issuedMap.get(item.id) || []
            : [];
        }
      }
    }

    const payload = orders.map((order) => ({
      ...order,
      items: itemsMap.get(order.id) || [],
    }));

    return res.json({ data: { orders: payload } });
  } catch (err) {
    next(err);
  }
};

export const payOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return next(new BusinessException("VALIDATION_FAILED", "Invalid order id", 400));
    }

    const result = await withTransaction(async (client) => {
      const orderRes = await client.query(selectOrderByIdQuery, [id]);
      const order = orderRes.rows[0];
      if (!order || order.customer_id !== req.user.id) {
        throw new BusinessException("NOT_FOUND", "Order not found", 404);
      }
      if (order.status !== "PENDING") {
        throw new BusinessException("CONFLICT", "Order cannot be paid", 409);
      }

      const itemsRes = await client.query(selectOrderItemsByOrderIdsQuery, [[id]]);
      const items = itemsRes.rows;
      if (items.length === 0) {
        throw new BusinessException("CONFLICT", "Order has no items", 409);
      }

      const voucherIds = items.map((i) => i.voucher_id);
      const vouchersRes = await client.query(selectVouchersForOrderQuery, [voucherIds]);
      const voucherMap = new Map(vouchersRes.rows.map((v) => [v.id, v]));

      for (const item of items) {
        const voucher = voucherMap.get(item.voucher_id);
        if (!voucher || voucher.status !== "APPROVED") {
          throw new BusinessException("CONFLICT", "Voucher is not available for purchase", 409);
        }
        if (voucher.sale_start && new Date(voucher.sale_start) > new Date()) {
          throw new BusinessException("CONFLICT", "Voucher sale has not started", 409);
        }
        if (voucher.sale_end && new Date(voucher.sale_end) <= new Date()) {
          throw new BusinessException("CONFLICT", "Voucher sale has ended", 409);
        }
        if (voucher.stock < item.quantity) {
          throw new BusinessException("CONFLICT", "Voucher out of stock", 409);
        }
        const stockRes = await client.query(updateVoucherStockQuery, [item.quantity, item.voucher_id]);
        if (!stockRes.rows[0]) {
          throw new BusinessException("CONFLICT", "Voucher out of stock", 409);
        }
      }

      const paymentRef = `MOCK-${Date.now()}`;
      const paidOrderRes = await client.query(updateOrderPaidQuery, [paymentRef, id]);
      const paidOrder = paidOrderRes.rows[0];
      if (!paidOrder) {
        throw new BusinessException("CONFLICT", "Order payment failed", 409);
      }

      for (const item of items) {
        const voucher = voucherMap.get(item.voucher_id);
        const expiresAt = voucher?.valid_until ? new Date(voucher.valid_until) : null;
        for (let i = 0; i < item.quantity; i += 1) {
          let inserted = false;
          for (let attempt = 0; attempt < 5 && !inserted; attempt += 1) {
            const code = generateCode();
            try {
              await client.query(
                `INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, expires_at)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [code, item.id, item.voucher_id, req.user.id, voucher.partner_id, expiresAt]
              );
              inserted = true;
            } catch (err) {
              if (err.code !== "23505") throw err;
            }
          }
          if (!inserted) {
            throw new BusinessException("CONFLICT", "Failed to generate voucher code", 409);
          }
        }
      }

      return paidOrder.id;
    });

    const order = await buildOrderResponse(result);
    return res.json({ data: { order } });
  } catch (err) {
    next(err);
  }
};
