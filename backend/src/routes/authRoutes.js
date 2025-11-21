import { Router } from "express";
import { login, register, me } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { unauthOnly } from "../middleware/unauthOnly.js";

const router = Router();

// hanya bisa diakses kalau BELUM login
router.post("/login", unauthOnly, login);
router.post("/register", unauthOnly, register);

// hanya bisa diakses kalau SUDAH login
router.get("/me", protect, me);

export default router;
