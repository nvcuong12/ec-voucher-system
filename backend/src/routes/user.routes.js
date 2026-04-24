import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/profile", authenticate, (_req, res) =>
  res.json({ message: "GET /users/profile - Phase 3" })
);
router.put("/profile", authenticate, (_req, res) =>
  res.json({ message: "PUT /users/profile - Phase 3" })
);
router.get("/vouchers", authenticate, (_req, res) =>
  res.json({ message: "GET /users/vouchers (my issued vouchers) - Phase 6" })
);

export default router;
