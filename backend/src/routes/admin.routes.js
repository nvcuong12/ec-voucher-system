import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  approveVoucher,
  getPendingVouchers,
  getUsers,
  getOrders,
  getLogs,
  getDashboard,
  getPendingPartners,
  rejectVoucher,
  updatePartnerApprovalStatus,
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

router.get("/partners/pending", asyncHandler(getPendingPartners));
router.patch("/partners/:id/approve", asyncHandler((req, res, next) => {
  req.body = { status: "APPROVED" };
  return updatePartnerApprovalStatus(req, res, next);
}));
router.patch("/partners/:id/reject", asyncHandler((req, res, next) => {
  req.body = { status: "REJECTED", rejection_reason: req.body?.rejection_reason };
  return updatePartnerApprovalStatus(req, res, next);
}));

router.get("/orders", asyncHandler(getOrders));
router.get("/dashboard", asyncHandler(getDashboard));
router.get("/logs", asyncHandler(getLogs));

export default router;
