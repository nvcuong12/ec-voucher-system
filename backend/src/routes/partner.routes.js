import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", authenticate, authorize("PARTNER"), (_req, res) =>
  res.json({ message: "POST /partners/register - Phase 4" })
);
router.get("/dashboard", authenticate, authorize("PARTNER"), (_req, res) =>
  res.json({ message: "GET /partners/dashboard - Phase 7" })
);
router.post("/vouchers/scan", authenticate, authorize("PARTNER"), (_req, res) =>
  res.json({ message: "POST /partners/vouchers/scan - Phase 6" })
);

export default router;
