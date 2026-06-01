// ================================================================
// partner.queries.js
// backend/src/models/partner.queries.js
// ================================================================

export const insertPartnerQuery = `
  INSERT INTO partners (user_id, business_name, business_license, representative, address, status)
  VALUES ($1, $2, $3, $4, $5, 'PENDING')
  RETURNING id, user_id, business_name, business_license, representative, address, status, rejection_reason, created_at, updated_at
`;

export const insertPartnerBranchQuery = `
  INSERT INTO partner_branches (partner_id, name, address, phone)
  VALUES ($1, $2, $3, $4)
  RETURNING id, partner_id, name, address, phone, is_active, created_at
`;

export const selectPartnerByUserIdQuery = `
  SELECT id, user_id, business_name, business_license, representative, address, status, rejection_reason, created_at, updated_at
  FROM partners
  WHERE user_id = $1
`;

export const selectBranchesByPartnerQuery = `
  SELECT id, name, address, phone, is_active
  FROM partner_branches
  WHERE partner_id = $1
  ORDER BY created_at DESC
`;

export const updatePartnerProfileQuery = `
  UPDATE partners
  SET
    business_name = COALESCE($2, business_name),
    business_license = COALESCE($3, business_license),
    representative = COALESCE($4, representative),
    address = COALESCE($5, address),
    updated_at = NOW()
  WHERE user_id = $1
  RETURNING id, user_id, business_name, business_license, representative, address, status, rejection_reason, created_at, updated_at
`;

export const updatePartnerBranchQuery = `
  UPDATE partner_branches
  SET
    name = COALESCE($3, name),
    address = COALESCE($4, address),
    phone = COALESCE($5, phone),
    is_active = COALESCE($6, is_active)
  WHERE id = $1 AND partner_id = $2
  RETURNING id, partner_id, name, address, phone, is_active, created_at
`;
