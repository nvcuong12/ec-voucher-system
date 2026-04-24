import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// RB-10: only customers who purchased can review
router.post("/", authenticate, authorize("CUSTOMER"), (_req, res) =>
  res.json({ message: "POST /reviews - Phase 5" })
);
router.get("/voucher/:voucherId", (_req, res) =>
  res.json({ message: "GET /reviews/voucher/:id - Phase 5" })
);
router.post("/:id/reply", authenticate, authorize("PARTNER"), (_req, res) =>
  res.json({ message: "POST /reviews/:id/reply - Phase 5" })
);

export default router;
