import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createComplaint,
  getMyComplaints,
  getMyVouchers,
  getProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/profile", authenticate, asyncHandler(getProfile));
router.put("/profile", authenticate, asyncHandler(updateProfile));
router.get(
  "/vouchers",
  authenticate,
  asyncHandler(getMyVouchers)
);
router.get("/complaints", authenticate, asyncHandler(getMyComplaints));
router.post("/complaints", authenticate, asyncHandler(createComplaint));

export default router;
