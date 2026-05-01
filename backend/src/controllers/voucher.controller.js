import { query } from "../config/database.js";

export const getVouchers = async (req, res) => {
  const { search = "", category = "" } = req.query;

  const clauses = [`v.status = 'APPROVED'`];
  const values = [];

  if (search.trim()) {
    values.push(`%${search.trim()}%`);
    clauses.push(`(v.name ILIKE $${values.length} OR v.description ILIKE $${values.length})`);
  }

  if (category.trim()) {
    values.push(category.trim());
    clauses.push(`v.category = $${values.length}`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const sql = `
    SELECT
      v.id,
      v.name,
      v.description,
      v.category,
      v.original_price,
      v.sale_price,
      v.valid_until,
      v.image_url,
      p.business_name,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', pb.id,
            'name', pb.name,
            'address', pb.address
          )
        ) FILTER (WHERE pb.id IS NOT NULL),
        '[]'::json
      ) AS applicable_branches
    FROM vouchers v
    JOIN partners p ON p.id = v.partner_id
    LEFT JOIN voucher_applicable_branches vab ON vab.voucher_id = v.id
    LEFT JOIN partner_branches pb ON pb.id = vab.branch_id
    ${whereClause}
    GROUP BY v.id, p.business_name
    ORDER BY v.created_at DESC
  `;

  const result = await query(sql, values);
  res.json({ vouchers: result.rows });
};

export const getVoucherById = async (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      v.id,
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
      v.image_url,
      v.status,
      p.business_name,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', pb.id,
            'name', pb.name,
            'address', pb.address,
            'phone', pb.phone
          )
        ) FILTER (WHERE pb.id IS NOT NULL),
        '[]'::json
      ) AS applicable_branches
    FROM vouchers v
    JOIN partners p ON p.id = v.partner_id
    LEFT JOIN voucher_applicable_branches vab ON vab.voucher_id = v.id
    LEFT JOIN partner_branches pb ON pb.id = vab.branch_id
    WHERE v.id = $1 AND v.status = 'APPROVED'
    GROUP BY v.id, p.business_name
    LIMIT 1
  `;

  const result = await query(sql, [id]);
  const voucher = result.rows[0];

  if (!voucher) {
    return res.status(404).json({ error: "Voucher not found" });
  }

  res.json({ voucher });
};
