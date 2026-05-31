import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { query } from "../config/database.js";
import { getPartnerByUserIdQuery } from "../models/voucher.queries.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { BusinessException } from "../utils/BusinessException.js";
import {
  createBranch,
  getPartnerDashboard,
  registerPartner,
  scanVoucher,
} from "../controllers/partner.controller.js";

const router = Router();

router.get(
  "/branches",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(async (req, res, next) => {
    const partnerResult = await query(getPartnerByUserIdQuery, [req.user.id]);
    const partner = partnerResult.rows[0];

    if (!partner) {
      return next(new BusinessException("NOT_FOUND", "Partner profile not found", 404));
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
  })
);

router.post(
  "/branches",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(createBranch)
);

router.post(
  "/register",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(registerPartner)
);

router.get(
  "/dashboard",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(getPartnerDashboard)
);

router.post(
  "/vouchers/scan",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(scanVoucher)
);

export default router;
