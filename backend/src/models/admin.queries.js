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
  SUSPENDED: "SUSPENDED",
});

export const ADMIN_VOUCHER_STATUS = Object.freeze({
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
});

export const ADMIN_LOG_ACTION = Object.freeze({
  APPROVE_VOUCHER: "APPROVE_VOUCHER",
  REJECT_VOUCHER: "REJECT_VOUCHER",
  SUSPEND_VOUCHER: "SUSPEND_VOUCHER",
  RESUME_VOUCHER: "RESUME_VOUCHER",
  APPROVE_PARTNER: "APPROVE_PARTNER",
  REJECT_PARTNER: "REJECT_PARTNER",
  SUSPEND_PARTNER: "SUSPEND_PARTNER",
  RESUME_PARTNER: "RESUME_PARTNER",
  UPDATE_USER_ROLE: "UPDATE_USER_ROLE",
  UPDATE_USER_STATUS: "UPDATE_USER_STATUS",
  UPDATE_ORDER_STATUS: "UPDATE_ORDER_STATUS",
  UPDATE_CONTENT: "UPDATE_CONTENT",
});

export const ADMIN_LOG_ENTITY = Object.freeze({
  VOUCHER: "voucher",
  PARTNER: "partner",
  USER: "user",
  ORDER: "order",
  CONTENT: "content",
});

export const listAllPartnersQuery = `
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
  ORDER BY p.created_at DESC
`;

export const updateUserRoleQuery = `
  UPDATE users
  SET role = $1,
      updated_at = NOW()
  WHERE id = $2
  RETURNING id, email, full_name, phone, role, is_active, created_at, updated_at
`;

export const updatePartnerStatusAnyQuery = `
  UPDATE partners
  SET status = $1,
      rejection_reason = $2,
      updated_at = NOW()
  WHERE id = $3
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

export const listPartnerBranchesQuery = `
  SELECT id, partner_id, name, address, phone, is_active, created_at
  FROM partner_branches
  WHERE partner_id = $1
  ORDER BY created_at DESC
`;

export const updateBranchStatusQuery = `
  UPDATE partner_branches
  SET is_active = $1
  WHERE id = $2
  RETURNING id, partner_id, name, address, phone, is_active, created_at
`;

export const updateVoucherStatusQuery = `
  UPDATE vouchers
  SET status = $1,
      updated_at = NOW()
  WHERE id = $2 AND status = ANY($3::voucher_status[])
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

export const listAllVouchersQuery = `
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
    u.email AS partner_email
  FROM vouchers v
  JOIN partners p ON p.id = v.partner_id
  JOIN users u ON u.id = p.user_id
  ORDER BY v.created_at DESC
`;

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

export const listCategoriesQuery = `
  SELECT id, name, is_active, created_at, updated_at
  FROM categories
  ORDER BY created_at DESC
`;

export const createCategoryQuery = `
  INSERT INTO categories (name, is_active)
  VALUES ($1, $2)
  RETURNING id, name, is_active, created_at, updated_at
`;

export const updateCategoryQuery = `
  UPDATE categories
  SET name = COALESCE($2, name),
      is_active = COALESCE($3, is_active),
      updated_at = NOW()
  WHERE id = $1
  RETURNING id, name, is_active, created_at, updated_at
`;

export const listBannersQuery = `
  SELECT id, title, image_url, link_url, sort_order, is_active, created_at, updated_at
  FROM banners
  ORDER BY sort_order ASC, created_at DESC
`;

export const createBannerQuery = `
  INSERT INTO banners (title, image_url, link_url, sort_order, is_active)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id, title, image_url, link_url, sort_order, is_active, created_at, updated_at
`;

export const updateBannerQuery = `
  UPDATE banners
  SET title = COALESCE($2, title),
      image_url = COALESCE($3, image_url),
      link_url = COALESCE($4, link_url),
      sort_order = COALESCE($5, sort_order),
      is_active = COALESCE($6, is_active),
      updated_at = NOW()
  WHERE id = $1
  RETURNING id, title, image_url, link_url, sort_order, is_active, created_at, updated_at
`;

export const listContentPagesQuery = `
  SELECT id, slug, title, content, is_active, created_at, updated_at
  FROM content_pages
  ORDER BY created_at DESC
`;

export const createContentPageQuery = `
  INSERT INTO content_pages (slug, title, content, is_active)
  VALUES ($1, $2, $3, $4)
  RETURNING id, slug, title, content, is_active, created_at, updated_at
`;

export const updateContentPageQuery = `
  UPDATE content_pages
  SET slug = COALESCE($2, slug),
      title = COALESCE($3, title),
      content = COALESCE($4, content),
      is_active = COALESCE($5, is_active),
      updated_at = NOW()
  WHERE id = $1
  RETURNING id, slug, title, content, is_active, created_at, updated_at
`;