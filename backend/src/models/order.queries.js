// ================================================================
// order.queries.js
// backend/src/models/order.queries.js
// ================================================================

export const selectVouchersForOrderQuery = `
  SELECT id, sale_price, stock, status, sale_start, sale_end, partner_id, valid_until
  FROM vouchers
  WHERE id = ANY($1::uuid[])
  FOR UPDATE
`;

export const insertOrderQuery = `
  INSERT INTO orders (
    customer_id,
    total_amount,
    status,
    payment_method,
    recipient_name,
    recipient_phone,
    recipient_email,
    note
  )
  VALUES ($1, $2, 'PENDING', $3, $4, $5, $6, $7)
  RETURNING id, customer_id, total_amount, status, payment_ref, payment_method,
            recipient_name, recipient_phone, recipient_email, note,
            paid_at, created_at, updated_at
`;

export const insertOrderItemQuery = `
  INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
  VALUES ($1, $2, $3, $4)
  RETURNING id, order_id, voucher_id, quantity, unit_price, created_at
`;

export const selectOrderByIdQuery = `
  SELECT id, customer_id, total_amount, status, payment_ref, payment_method,
         recipient_name, recipient_phone, recipient_email, note,
         paid_at, created_at, updated_at
  FROM orders
  WHERE id = $1
`;

export const selectOrdersByCustomerQuery = `
  SELECT id, customer_id, total_amount, status, payment_ref, payment_method,
         recipient_name, recipient_phone, recipient_email, note,
         paid_at, created_at, updated_at
  FROM orders
  WHERE customer_id = $1
  ORDER BY created_at DESC
`;

export const selectOrderItemsByOrderIdsQuery = `
  SELECT
    oi.id,
    oi.order_id,
    oi.voucher_id,
    oi.quantity,
    oi.unit_price,
    oi.created_at,
    v.name,
    v.image_url,
    v.sale_end,
    v.valid_until,
    p.business_name
  FROM order_items oi
  JOIN vouchers v ON v.id = oi.voucher_id
  JOIN partners p ON p.id = v.partner_id
  WHERE oi.order_id = ANY($1::uuid[])
  ORDER BY oi.created_at ASC
`;

export const selectIssuedVouchersByOrderItemIdsQuery = `
  SELECT
    iv.id,
    CASE WHEN o.status = 'PAID' THEN iv.code ELSE NULL END AS code,
    iv.order_item_id,
    iv.voucher_id,
    iv.customer_id,
    iv.status,
    iv.used_at,
    iv.used_at_branch,
    pb.name AS used_branch_name,
    iv.expires_at,
    iv.created_at AS issued_at
  FROM issued_vouchers iv
  JOIN order_items oi ON oi.id = iv.order_item_id
  JOIN orders o ON o.id = oi.order_id
  LEFT JOIN partner_branches pb ON pb.id = iv.used_at_branch
  WHERE iv.order_item_id = ANY($1::uuid[])
    AND o.customer_id = $2
  ORDER BY iv.created_at ASC
`;

export const updateVoucherStockQuery = `
  UPDATE vouchers
  SET stock = stock - $1,
      updated_at = NOW()
  WHERE id = $2 AND stock >= $1
  RETURNING id, stock
`;

export const updateOrderPaidQuery = `
  UPDATE orders
  SET status = 'PAID',
      payment_ref = $1,
      paid_at = NOW(),
      updated_at = NOW()
  WHERE id = $2 AND status = 'PENDING'
  RETURNING id, customer_id, total_amount, status, payment_ref, payment_method,
            recipient_name, recipient_phone, recipient_email, note,
            paid_at, created_at, updated_at
`;

export const selectIssuedVouchersByCustomerQuery = `
  SELECT
    iv.id,
    iv.code,
    iv.order_item_id,
    iv.voucher_id,
    iv.customer_id,
    iv.partner_id,
    iv.status,
    iv.used_at,
    iv.used_at_branch,
    iv.expires_at,
    iv.created_at,
    v.name,
    v.description,
    v.image_url,
    v.terms,
    v.sale_price,
    p.business_name
  FROM issued_vouchers iv
  JOIN vouchers v ON v.id = iv.voucher_id
  JOIN partners p ON p.id = iv.partner_id
  WHERE iv.customer_id = $1
  ORDER BY iv.created_at DESC
`;
