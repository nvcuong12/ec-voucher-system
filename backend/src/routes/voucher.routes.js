import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  createVoucher,
  updateVoucher,
  getVoucherById,
  listVouchers,
  listVoucherCategories,
} from "../controllers/voucher.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

// ── Public / optional-auth routes ──────────────────────────────
// GET /api/vouchers/categories — public filter categories
router.get("/categories", asyncHandler(listVoucherCategories));

// GET /api/vouchers  — public list, partner list (same URL, logic branches by role)
router.get(
  "/",
  (req, res, next) => {
    // Attach user if token present, but don't block unauthenticated requests
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      return authenticate(req, res, next);
    }
    next();
  },
  asyncHandler(listVouchers)
);
 
// GET /api/vouchers/:id — public detail (admin/partner see more via same handler)
router.get(
  "/:id",
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      return authenticate(req, res, next);
    }
    next();
  },
  asyncHandler(getVoucherById)
);
 
// ── Partner-only routes ─────────────────────────────────────────
// POST /api/vouchers — tạo voucher
router.post(
  "/",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(createVoucher)
);
 
// PUT /api/vouchers/:id — sửa voucher
router.put(
  "/:id",
  authenticate,
  authorize("PARTNER"),
  asyncHandler(updateVoucher)
);
 
export default router;
