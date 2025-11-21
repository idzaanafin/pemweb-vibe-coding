import { Router } from "express";
import {
  getRooms,
  detailRooms,
  updateRooms,
  createRooms,
  deleteRooms,
} from "../controllers/roomController.js";

import { protect, requireAdmin } from "../middleware/auth.js";
import { uploadsRoom } from "../middleware/uploadsRoom.js";

const router = Router();

// Public → semua orang termasuk guest bisa lihat
router.get("/", getRooms);
router.get("/:id", detailRooms);

// Admin only
router.post("/", protect, requireAdmin, uploadsRoom.single("image"), createRooms);
router.put("/:id", protect, requireAdmin, uploadsRoom.single("image"), updateRooms);
router.delete("/:id", protect, requireAdmin, deleteRooms);

export default router;
