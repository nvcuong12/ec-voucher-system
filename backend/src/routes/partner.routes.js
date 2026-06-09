import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { query } from "../config/database.js";
import { getPartnerByUserIdQuery } from "../models/voucher.queries.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { BusinessException } from "../utils/BusinessException.js";
import {
  createBranch,
  createPartnerAppeal,
  checkVoucher,
  getMyPartnerAppeals,
  getPartnerDashboard,
  getPartnerReport,
  registerPartner,
  scanVoucher,
  updatePartnerBranch,
  updatePartnerProfile,
} from "../controllers/partner.controller.js";
import { deleteVoucher, cancelVoucher } from "../controllers/voucher.controller.js";

const router = Router();

router.get(
  "/branches",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(async (req, res, next) => {
    const includeInactive = String(req.query.include_inactive || "false").toLowerCase() === "true";
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
          AND ($2::boolean = TRUE OR is_active = TRUE)
        ORDER BY name ASC
      `,
      [partner.id, includeInactive]
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

router.put(
  "/profile",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(updatePartnerProfile)
);

router.get(
  "/appeals",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(getMyPartnerAppeals)
);

router.post(
  "/appeals",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(createPartnerAppeal)
);

router.get(
  "/dashboard",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(getPartnerDashboard)
);

router.get(
  "/reports",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(getPartnerReport)
);

router.patch(
  "/branches/:id",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(updatePartnerBranch)
);

router.post(
  "/vouchers/check",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(checkVoucher)
);

router.post(
  "/vouchers/scan",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(scanVoucher)
);

router.delete(
  "/vouchers/:id",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(deleteVoucher)
);

router.post(
  "/vouchers/:id/cancel",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(cancelVoucher)
);

export default router;
