import { Router } from "express";
import {
	register,
	login,
	getMe,
	forgotPassword,
	resetPassword,
	changePassword,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetPassword));
router.post("/change-password", authenticate, asyncHandler(changePassword));
router.get("/me", authenticate, asyncHandler(getMe));

export default router;
