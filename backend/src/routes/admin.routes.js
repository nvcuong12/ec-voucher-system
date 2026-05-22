import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  approveVoucher,
  getPendingVouchers,
  getUsers,
  rejectVoucher,
  updateUserStatus,
} from "../controllers/admin.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize("ADMIN"));

router.get("/users", asyncHandler(getUsers));
router.patch("/users/:id/status", asyncHandler(updateUserStatus));

router.get("/vouchers/pending", asyncHandler(getPendingVouchers));
router.patch("/vouchers/:id/approve", asyncHandler(approveVoucher));
router.patch("/vouchers/:id/reject", asyncHandler(rejectVoucher));

router.get("/orders", (_req, res) => res.json({ message: "GET /admin/orders - Phase 5" }));
router.get("/dashboard", (_req, res) => res.json({ message: "GET /admin/dashboard - Phase 7" }));
router.get("/logs", (_req, res) => res.json({ message: "GET /admin/logs - Phase 7" }));

export default router;
