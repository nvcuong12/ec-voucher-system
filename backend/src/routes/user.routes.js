import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/profile", authenticate, asyncHandler(getProfile));
router.put("/profile", authenticate, asyncHandler(updateProfile));
router.get(
  "/vouchers",
  authenticate,
  asyncHandler(async (_req, res) =>
    res.json({ message: "GET /users/vouchers (my issued vouchers) - Phase 6" })
  )
);

export default router;
