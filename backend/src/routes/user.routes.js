import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getMyVouchers, getProfile, updateProfile } from "../controllers/user.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/profile", authenticate, asyncHandler(getProfile));
router.put("/profile", authenticate, asyncHandler(updateProfile));
router.get(
  "/vouchers",
  authenticate,
  asyncHandler(getMyVouchers)
);

export default router;
