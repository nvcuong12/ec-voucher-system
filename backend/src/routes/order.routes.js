import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, authorize("CUSTOMER"), (_req, res) =>
  res.json({ message: "POST /orders - Phase 5" })
);
router.get("/my", authenticate, authorize("CUSTOMER"), (_req, res) =>
  res.json({ message: "GET /orders/my - Phase 5" })
);
router.post("/:id/pay", authenticate, authorize("CUSTOMER"), (_req, res) =>
  res.json({ message: "POST /orders/:id/pay (mock) - Phase 5/6" })
);

export default router;
