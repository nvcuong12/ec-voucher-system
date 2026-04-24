import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize("ADMIN"));

router.get("/users", (_req, res) => res.json({ message: "GET /admin/users - Phase 4" }));
router.patch("/users/:id/status", (_req, res) => res.json({ message: "PATCH /admin/users/:id/status - Phase 4" }));

router.get("/vouchers/pending", (_req, res) => res.json({ message: "GET /admin/vouchers/pending - Phase 4" }));
router.patch("/vouchers/:id/approve", (_req, res) => res.json({ message: "PATCH /admin/vouchers/:id/approve - Phase 4" }));
router.patch("/vouchers/:id/reject", (_req, res) => res.json({ message: "PATCH /admin/vouchers/:id/reject - Phase 4" }));

router.get("/orders", (_req, res) => res.json({ message: "GET /admin/orders - Phase 5" }));
router.get("/dashboard", (_req, res) => res.json({ message: "GET /admin/dashboard - Phase 7" }));
router.get("/logs", (_req, res) => res.json({ message: "GET /admin/logs - Phase 7" }));

export default router;
