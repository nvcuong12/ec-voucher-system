import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getVouchers, getVoucherById } from "../controllers/voucher.controller.js";

const router = Router();

// Public routes
router.get("/", asyncHandler(getVouchers));
router.get("/:id", asyncHandler(getVoucherById));

// Partner routes
router.post("/", authenticate, authorize("PARTNER"), (_req, res) =>
  res.json({ message: "POST /vouchers - Phase 4" })
);
router.put("/:id", authenticate, authorize("PARTNER"), (_req, res) =>
  res.json({ message: "PUT /vouchers/:id - Phase 4" })
);

export default router;
