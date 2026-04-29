import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
	approveVoucher,
	getPendingVouchers,
	getUsers,
	rejectVoucher,
	updateUserStatus,
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize("ADMIN"));

router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);

router.get("/vouchers/pending", getPendingVouchers);
router.patch("/vouchers/:id/approve", approveVoucher);
router.patch("/vouchers/:id/reject", rejectVoucher);

router.get("/orders", (_req, res) => res.json({ message: "GET /admin/orders - Phase 5" }));
router.get("/dashboard", (_req, res) => res.json({ message: "GET /admin/dashboard - Phase 7" }));
router.get("/logs", (_req, res) => res.json({ message: "GET /admin/logs - Phase 7" }));

export default router;
