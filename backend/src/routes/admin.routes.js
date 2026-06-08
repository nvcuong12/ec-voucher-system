import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  approveVoucher,
  createBanner,
  createCategory,
  createContentPage,
  getAllVouchers,
  getAllPartners,
  getActiveBanners,
  getBanners,
  getCategories,
  getComplaints,
  getContentPages,
  getActivePopup,
  getPublicContentPage,
  getPendingVouchers,
  getPopups,
  getUsers,
  getOrders,
  getLogs,
  getDashboard,
  getPartnerBranches,
  getPendingPartners,
  rejectVoucher,
  updateBanner,
  updateCategory,
  updateContentPage,
  updateComplaintStatus,
  updateOrderStatus,
  updatePopup,
  updatePartnerBranchStatus,
  updatePartnerApprovalStatus,
  updatePartnerStatusAny,
  updateUserRole,
  updateUserStatus,
  updateVoucherStatus,
  createPopup,
} from "../controllers/admin.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/content/popups/active", asyncHandler(getActivePopup));
router.get("/content/banners/active", asyncHandler(getActiveBanners));
router.get("/content/pages/public/:slug", asyncHandler(getPublicContentPage));

// All admin routes require ADMIN role
router.use(authenticate, authorize("ADMIN"));

router.get("/users", asyncHandler(getUsers));
router.patch("/users/:id/status", asyncHandler(updateUserStatus));
router.patch("/users/:id/role", asyncHandler(updateUserRole));

router.get("/vouchers/pending", asyncHandler(getPendingVouchers));
router.get("/vouchers", asyncHandler(getAllVouchers));
router.patch("/vouchers/:id/approve", asyncHandler(approveVoucher));
router.patch("/vouchers/:id/reject", asyncHandler(rejectVoucher));
router.patch("/vouchers/:id/status", asyncHandler(updateVoucherStatus));

router.get("/partners/pending", asyncHandler(getPendingPartners));
router.get("/partners", asyncHandler(getAllPartners));
router.patch("/partners/:id/approve", asyncHandler((req, res, next) => {
  req.body = { status: "APPROVED" };
  return updatePartnerApprovalStatus(req, res, next);
}));
router.patch("/partners/:id/reject", asyncHandler((req, res, next) => {
  req.body = { status: "REJECTED", rejection_reason: req.body?.rejection_reason };
  return updatePartnerApprovalStatus(req, res, next);
}));
router.patch("/partners/:id/status", asyncHandler(updatePartnerStatusAny));
router.get("/partners/:id/branches", asyncHandler(getPartnerBranches));
router.patch("/partners/branches/:id", asyncHandler(updatePartnerBranchStatus));

router.get("/orders", asyncHandler(getOrders));
router.patch("/orders/:id/status", asyncHandler(updateOrderStatus));
router.get("/dashboard", asyncHandler(getDashboard));
router.get("/logs", asyncHandler(getLogs));
router.get("/complaints", asyncHandler(getComplaints));
router.patch("/complaints/:id", asyncHandler(updateComplaintStatus));

router.get("/content/categories", asyncHandler(getCategories));
router.post("/content/categories", asyncHandler(createCategory));
router.patch("/content/categories/:id", asyncHandler(updateCategory));

router.get("/content/banners", asyncHandler(getBanners));
router.post("/content/banners", asyncHandler(createBanner));
router.patch("/content/banners/:id", asyncHandler(updateBanner));

router.get("/content/pages", asyncHandler(getContentPages));
router.post("/content/pages", asyncHandler(createContentPage));
router.patch("/content/pages/:id", asyncHandler(updateContentPage));

router.get("/content/popups", asyncHandler(getPopups));
router.post("/content/popups", asyncHandler(createPopup));
router.patch("/content/popups/:id", asyncHandler(updatePopup));

export default router;
