// ================================================================
// voucher.queries.js
// backend/src/models/voucher.queries.js
// ================================================================

// ─── Constants ───────────────────────────────────────────────────

export const VOUCHER_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
  EXPIRED: "EXPIRED",
  SOLD_OUT: "SOLD_OUT",
});

// Statuses a partner is allowed to edit
export const EDITABLE_STATUSES = Object.freeze([
  VOUCHER_STATUS.DRAFT,
  VOUCHER_STATUS.REJECTED,
]);

// ─── Queries ─────────────────────────────────────────────────────

/** Lấy partner_id từ user_id đang đăng nhập */
export const getPartnerByUserIdQuery = `
  SELECT id, status
  FROM partners
  WHERE user_id = $1
`;

/** Kiểm tra branch có thuộc partner không */
export const checkBranchesOwnedQuery = `
  SELECT id
  FROM partner_branches
  WHERE id = ANY($1::uuid[])
    AND partner_id = $2
    AND is_active = TRUE
`;

/** Tạo voucher mới */
export const insertVoucherQuery = `
  INSERT INTO vouchers (
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
    image_url,
    status
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
  RETURNING
    id, partner_id, name, description, category,
    original_price, sale_price, stock,
    sale_start, sale_end, valid_until, terms,
    image_url, status, rejection_reason,
    created_at, updated_at
`;

/** Gắn branches vào voucher (batch insert) */
export const insertVoucherBranchesQuery = `
  INSERT INTO voucher_applicable_branches (voucher_id, branch_id)
  SELECT $1, UNNEST($2::uuid[])
  ON CONFLICT (voucher_id, branch_id) DO NOTHING
`;

/** Xóa toàn bộ branch mapping của voucher (dùng khi update) */
export const deleteVoucherBranchesQuery = `
  DELETE FROM voucher_applicable_branches
  WHERE voucher_id = $1
`;

/** Danh sách category công khai cho bộ lọc voucher */
export const listPublicCategoriesQuery = `
  SELECT id, name
  FROM categories
  WHERE is_active = TRUE
  ORDER BY name ASC
`;

/** Lấy voucher theo id (dùng nội bộ, trả full) */
export const getVoucherByIdFullQuery = `
  SELECT
    v.id, v.partner_id, v.name, v.description, v.category,
    v.original_price, v.sale_price, v.stock,
    v.sale_start, v.sale_end, v.valid_until, v.terms,
    v.image_url, v.status, v.rejection_reason,
    v.created_at, v.updated_at,
    p.business_name,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT('id', pb.id, 'name', pb.name, 'address', pb.address)
      ) FILTER (WHERE pb.id IS NOT NULL),
      '[]'
    ) AS applicable_branches
  FROM vouchers v
  JOIN partners p ON p.id = v.partner_id
  LEFT JOIN voucher_applicable_branches vab ON vab.voucher_id = v.id
  LEFT JOIN partner_branches pb ON pb.id = vab.branch_id
  WHERE v.id = $1
  GROUP BY v.id, p.business_name
`;

/** Lấy voucher public (chỉ APPROVED và còn hạn bán) */
export const getPublicVoucherByIdQuery = `
  SELECT
    v.id, v.name, v.description, v.category,
    v.original_price, v.sale_price, v.stock,
    v.sale_start, v.sale_end, v.valid_until, v.terms,
    v.image_url, v.status,
    v.created_at,
    p.business_name,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT('id', pb.id, 'name', pb.name, 'address', pb.address)
      ) FILTER (WHERE pb.id IS NOT NULL),
      '[]'
    ) AS applicable_branches
  FROM vouchers v
  JOIN partners p ON p.id = v.partner_id
  LEFT JOIN voucher_applicable_branches vab ON vab.voucher_id = v.id
  LEFT JOIN partner_branches pb ON pb.id = vab.branch_id
  WHERE v.id = $1
    AND v.status = 'APPROVED'
    AND (v.sale_start IS NULL OR v.sale_start <= NOW())
    AND (v.sale_end IS NULL OR v.sale_end > NOW())
    AND v.stock > 0
  GROUP BY v.id, p.business_name
`;

/** Update voucher (chỉ DRAFT / REJECTED mới cho sửa) */
export const updateVoucherQuery = `
  UPDATE vouchers
  SET
    name           = COALESCE($1, name),
    description    = COALESCE($2, description),
    category       = COALESCE($3, category),
    original_price = COALESCE($4, original_price),
    sale_price     = COALESCE($5, sale_price),
    stock          = COALESCE($6, stock),
    sale_start     = COALESCE($7, sale_start),
    sale_end       = COALESCE($8, sale_end),
    valid_until    = COALESCE($9, valid_until),
    terms          = COALESCE($10, terms),
    image_url      = COALESCE($11, image_url),
    status         = $12,
    rejection_reason = NULL,
    updated_at     = NOW()
  WHERE id = $13
    AND partner_id = $14
    AND status = ANY($15::voucher_status[])
  RETURNING
    id, partner_id, name, description, category,
    original_price, sale_price, stock,
    sale_start, sale_end, valid_until, terms,
    image_url, status, rejection_reason,
    created_at, updated_at
`;

/** Danh sách voucher — public (chỉ APPROVED) */
export const listPublicVouchersQuery = `
  SELECT
    v.id, v.name, v.description, v.category,
    v.original_price, v.sale_price, v.stock,
    v.sale_start, v.sale_end, v.valid_until,
    v.image_url, v.status,
    v.created_at,
    p.id AS partner_id,
    p.business_name
  FROM vouchers v
  JOIN partners p ON p.id = v.partner_id
  WHERE v.status = 'APPROVED'
    AND (v.sale_start IS NULL OR v.sale_start <= NOW())
    AND ($1::text IS NULL OR (v.name ILIKE '%' || $1 || '%' OR v.description ILIKE '%' || $1 || '%'))
    AND ($2::text IS NULL OR v.category = $2)
    AND ($3::uuid IS NULL OR v.partner_id = $3)
    AND ($4::numeric IS NULL OR v.sale_price >= $4)
    AND ($5::numeric IS NULL OR v.sale_price <= $5)
    AND (
      $6::numeric IS NULL
      OR (1 - (v.sale_price / NULLIF(v.original_price, 0))) * 100 >= $6
    )
    AND (
      $11::numeric IS NULL
      OR (1 - (v.sale_price / NULLIF(v.original_price, 0))) * 100 <= $11
    )
    AND (
      $7::text IS NULL
      OR EXISTS (
        SELECT 1
        FROM voucher_applicable_branches vab
        JOIN partner_branches pb ON pb.id = vab.branch_id
        WHERE vab.voucher_id = v.id
          AND pb.address ILIKE '%' || $7 || '%'
      )
    )
    AND (
      $8::text IS NULL
      OR ($8 = 'ACTIVE' AND (v.sale_end IS NULL OR v.sale_end > NOW()) AND v.stock > 0)
      OR ($8 = 'EXPIRED' AND (v.sale_end IS NOT NULL AND v.sale_end <= NOW()))
    )
  ORDER BY v.created_at DESC
  LIMIT $9 OFFSET $10
`;

/** Danh sách voucher — partner (chỉ thấy của mình) */
export const listPartnerVouchersQuery = `
  SELECT
    v.id, v.name, v.description, v.category,
    v.original_price, v.sale_price, v.stock,
    v.sale_start, v.sale_end, v.valid_until,
    v.image_url, v.status, v.rejection_reason,
    v.created_at, v.updated_at
  FROM vouchers v
  WHERE v.partner_id = $1
    AND ($2::voucher_status IS NULL OR v.status = $2::voucher_status)
    AND ($3::text IS NULL OR v.category = $3)
  ORDER BY v.created_at DESC
  LIMIT $4 OFFSET $5
`;

/** Đếm total cho public list */
export const countPublicVouchersQuery = `
  SELECT COUNT(*) AS total
  FROM vouchers v
  WHERE v.status = 'APPROVED'
    AND (v.sale_start IS NULL OR v.sale_start <= NOW())
    AND ($1::text IS NULL OR (v.name ILIKE '%' || $1 || '%' OR v.description ILIKE '%' || $1 || '%'))
    AND ($2::text IS NULL OR v.category = $2)
    AND ($3::uuid IS NULL OR v.partner_id = $3)
    AND ($4::numeric IS NULL OR v.sale_price >= $4)
    AND ($5::numeric IS NULL OR v.sale_price <= $5)
    AND (
      $6::numeric IS NULL
      OR (1 - (v.sale_price / NULLIF(v.original_price, 0))) * 100 >= $6
    )
    AND (
      $9::numeric IS NULL
      OR (1 - (v.sale_price / NULLIF(v.original_price, 0))) * 100 <= $9
    )
    AND (
      $7::text IS NULL
      OR EXISTS (
        SELECT 1
        FROM voucher_applicable_branches vab
        JOIN partner_branches pb ON pb.id = vab.branch_id
        WHERE vab.voucher_id = v.id
          AND pb.address ILIKE '%' || $7 || '%'
      )
    )
    AND (
      $8::text IS NULL
      OR ($8 = 'ACTIVE' AND (v.sale_end IS NULL OR v.sale_end > NOW()) AND v.stock > 0)
      OR ($8 = 'EXPIRED' AND (v.sale_end IS NOT NULL AND v.sale_end <= NOW()))
    )
`;

/** Đếm total cho partner list */
export const countPartnerVouchersQuery = `
  SELECT COUNT(*) AS total
  FROM vouchers v
  WHERE v.partner_id = $1
    AND ($2::voucher_status IS NULL OR v.status = $2::voucher_status)
    AND ($3::text IS NULL OR v.category = $3)
`;
