import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { query } from "../config/database.js";
import { getPartnerByUserIdQuery } from "../models/voucher.queries.js";

const router = Router();

router.get("/branches", authenticate, authorize("PARTNER"), async (req, res, next) => {
  try {
    const partnerResult = await query(getPartnerByUserIdQuery, [req.user.id]);
    const partner = partnerResult.rows[0];

    if (!partner) {
      return res.status(404).json({ error: "Partner profile not found" });
    }

    const branchesResult = await query(
      `
        SELECT id, name, address, phone, is_active
        FROM partner_branches
        WHERE partner_id = $1
          AND is_active = TRUE
        ORDER BY name ASC
      `,
      [partner.id]
    );

    return res.json({ data: { branches: branchesResult.rows } });
  } catch (err) {
    next(err);
  }
});

router.post("/register", authenticate, authorize("PARTNER"), (_req, res) =>
  res.json({ message: "POST /partners/register - Phase 4" })
);
router.get("/dashboard", authenticate, authorize("PARTNER"), (_req, res) =>
  res.json({ message: "GET /partners/dashboard - Phase 7" })
);
router.post("/vouchers/scan", authenticate, authorize("PARTNER"), (_req, res) =>
  res.json({ message: "POST /partners/vouchers/scan - Phase 6" })
);

export default router;
