import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", (_req, res) => res.json({ message: "GET /vouchers - Phase 5" }));
router.get("/:id", (_req, res) => res.json({ message: "GET /vouchers/:id - Phase 5" }));

// Partner routes
router.post("/", authenticate, authorize("PARTNER"), (_req, res) =>
  res.json({ message: "POST /vouchers - Phase 4" })
);
router.put("/:id", authenticate, authorize("PARTNER"), (_req, res) =>
  res.json({ message: "PUT /vouchers/:id - Phase 4" })
);

export default router;
