import { Router } from "express";
import {
  getReservation,
  detailReservation,
  createReservation,
  updateReservation,
  deleteReservation,
  updateReservationStatus
} from "../controllers/reservationController.js";

import { protect, requireAdmin } from "../middleware/auth.js";
import { blockAdmin } from "../middleware/blockAdmin.js";
import { uploadReservation } from "../middleware/uploadReservation.js";

const router = Router();

/**
 * Rules:
 * - Admin: ONLY read + approve/reject
 * - User: create, update(own pending), delete(own pending)
 */

// GET all reservations
router.get("/", protect, getReservation);

// GET detail reservation
router.get("/:id", protect, detailReservation);

// USER CREATE reservation → block admin
router.post("/", protect, blockAdmin, uploadReservation.single("document"), createReservation);

// USER UPDATE reservation → block admin
router.put("/:id", protect, blockAdmin,  uploadReservation.single("document"), updateReservation);

// USER DELETE reservation → block admin
router.delete("/:id", protect, blockAdmin, deleteReservation);

// ADMIN approve/reject
router.patch("/:id/status", protect, requireAdmin, updateReservationStatus);

export default router;
