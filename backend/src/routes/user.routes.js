import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";

const router = Router();

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.get("/vouchers", authenticate, (_req, res) =>
  res.json({ message: "GET /users/vouchers (my issued vouchers) - Phase 6" })
);

export default router;
