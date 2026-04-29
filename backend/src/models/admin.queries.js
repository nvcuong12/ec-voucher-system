export const ADMIN_USER_STATUS = Object.freeze({
  ACTIVE: true,
  SUSPENDED: false,
});

export const ADMIN_USER_STATUS_LABEL = Object.freeze({
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
});

export const ADMIN_PARTNER_STATUS = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
});

export const ADMIN_VOUCHER_STATUS = Object.freeze({
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
});

export const ADMIN_LOG_ACTION = Object.freeze({
  APPROVE_VOUCHER: "APPROVE_VOUCHER",
  REJECT_VOUCHER: "REJECT_VOUCHER",
  APPROVE_PARTNER: "APPROVE_PARTNER",
  REJECT_PARTNER: "REJECT_PARTNER",
});

export const ADMIN_LOG_ENTITY = Object.freeze({
  VOUCHER: "voucher",
  PARTNER: "partner",
});

export const listPendingVouchersQuery = `
  SELECT
    v.id,
    v.partner_id,
    v.name,
    v.description,
    v.category,
    v.original_price,
    v.sale_price,
    v.stock,
    v.sale_start,
    v.sale_end,
    v.valid_until,
    v.terms,
    v.status,
    v.rejection_reason,
    v.image_url,
    v.created_at,
    v.updated_at,
    p.business_name,
    p.status AS partner_status,
    u.email AS partner_email,
    u.full_name AS partner_name
  FROM vouchers v
  JOIN partners p ON p.id = v.partner_id
  JOIN users u ON u.id = p.user_id
  WHERE v.status = $1
  ORDER BY v.created_at DESC
`;

export const approveVoucherQuery = `
  UPDATE vouchers
  SET status = $1,
      rejection_reason = NULL,
      updated_at = NOW()
  WHERE id = $2 AND status = $3
  RETURNING
    id,
    partner_id,
    name,
    description,
    category,
    original_price,
    sale_price,
    stock,
    sale_start,
    sale_end,
    valid_until,
    terms,
    status,
    rejection_reason,
    image_url,
    created_at,
    updated_at
`;

export const rejectVoucherQuery = `
  UPDATE vouchers
  SET status = $1,
      rejection_reason = $2,
      updated_at = NOW()
  WHERE id = $3 AND status = $4
  RETURNING
    id,
    partner_id,
    name,
    description,
    category,
    original_price,
    sale_price,
    stock,
    sale_start,
    sale_end,
    valid_until,
    terms,
    status,
    rejection_reason,
    image_url,
    created_at,
    updated_at
`;

export const listPendingPartnersQuery = `
  SELECT
    p.id,
    p.user_id,
    p.business_name,
    p.business_license,
    p.representative,
    p.address,
    p.status,
    p.rejection_reason,
    p.created_at,
    p.updated_at,
    u.email AS partner_email,
    u.full_name AS partner_name
  FROM partners p
  JOIN users u ON u.id = p.user_id
  WHERE p.status = $1
  ORDER BY p.created_at DESC
`;

export const updatePartnerStatusQuery = `
  UPDATE partners
  SET status = $1,
      rejection_reason = $2,
      updated_at = NOW()
  WHERE id = $3 AND status = $4
  RETURNING
    id,
    user_id,
    business_name,
    business_license,
    representative,
    address,
    status,
    rejection_reason,
    created_at,
    updated_at
`;

export const insertSystemLogQuery = `
  INSERT INTO system_logs (user_id, action, entity, entity_id)
  VALUES ($1, $2, $3, $4)
  RETURNING id, user_id, action, entity, entity_id, created_at
`;