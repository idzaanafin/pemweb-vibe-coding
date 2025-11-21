import { Reservation } from "../models/Reservation.js";
import { Room } from "../models/Room.js";
import fs from "fs";
import path from "path";

/**
 * GET ALL RESERVATION
 * - admin → lihat semua
 * - user → lihat miliknya
 */
export const getReservation = async (req, res) => {
  try {
    let reservations;

    if (req.user.role === "admin") {
      reservations = await Reservation.find()
        .populate("room")
        .populate("user", "name email");
    } else {
      reservations = await Reservation.find({ user: req.user._id })
        .populate("room");
    }

    res.json({
      success: true,
      data: reservations,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get reservations",
      error: err.message,
    });
  }
};

/**
 * GET ONE RESERVATION
 * - admin → boleh lihat semua
 * - user  → hanya miliknya
 */
export const detailReservation = async (req, res) => {
  try {
    const id = req.params.id;

    const reservation = await Reservation.findById(id)
      .populate("room")
      .populate("user", "name email");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      reservation.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: not your reservation",
      });
    }

    res.json({
      success: true,
      data: reservation,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get reservation detail",
      error: err.message,
    });
  }
};

/**
 * CREATE RESERVATION
 * - only user
 * - wajib upload PDF
 * - cek bentrok waktu
 * - validasi jam bulat + durasi 1–24 jam
 */
export const createReservation = async (req, res) => {
  try {
    const { room, title, description, startTime, endTime } = req.body;

    if (!room || !title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "room, title, startTime, endTime are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF document is required",
      });
    }

    const checkRoom = await Room.findById(room);
    if (!checkRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Convert to Date
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // VALIDASI: jam bulat
    if (start.getMinutes() !== 0 || start.getSeconds() !== 0) {
      return res.status(400).json({
        success: false,
        message: "startTime must be exactly on the hour (e.g., 09:00)",
      });
    }
    if (end.getMinutes() !== 0 || end.getSeconds() !== 0) {
      return res.status(400).json({
        success: false,
        message: "endTime must be exactly on the hour (e.g., 10:00)",
      });
    }

    // VALIDASI: start < end
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "endTime must be greater than startTime",
      });
    }

    // VALIDASI: startTime harus masa depan
    if (start <= now) {
      return res.status(400).json({
        success: false,
        message: "startTime must be in the future",
      });
    }

    // VALIDASI: minimal 1 jam, maksimal 24 jam
    const diffH = (end - start) / (1000 * 60 * 60);
    if (diffH < 1) {
      return res.status(400).json({
        success: false,
        message: "Minimum reservation duration is 1 hour",
      });
    }
    if (diffH > 24) {
      return res.status(400).json({
        success: false,
        message: "Maximum reservation duration is 24 hours",
      });
    }

    // CEK BENTROK WAKTU
    const conflict = await Reservation.findOne({
      room: room,
      status: { $in: ["pending", "approved"] },
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start }
        }
      ]
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Time conflict: room already reserved in this time range",
      });
    }

    // Buat reservasi baru
    const reservation = await Reservation.create({
      room,
      user: req.user._id,
      title,
      description,
      startTime: start,
      endTime: end,
      documentUrl: `/uploads/reservations/${req.file.filename}`,
    });

    res.status(201).json({
      success: true,
      message: "Reservation created",
      data: reservation,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create reservation",
      error: err.message,
    });
  }
};

/**
 * UPDATE RESERVATION
 * - user → hanya miliknya + status pending
 * - validasi jam bulat + durasi 1–24 jam
 */
export const updateReservation = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, startTime, endTime } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    // only owner
    if (
      req.user.role !== "admin" &&
      reservation.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: not your reservation",
      });
    }

    // only pending
    if (req.user.role !== "admin" && reservation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reservations can be updated",
      });
    }

    // Tentukan waktu baru
    const newStart = startTime ? new Date(startTime) : reservation.startTime;
    const newEnd = endTime ? new Date(endTime) : reservation.endTime;
    const now = new Date();

    // VALIDASI: jam bulat
    if (newStart.getMinutes() !== 0 || newStart.getSeconds() !== 0) {
      return res.status(400).json({
        success: false,
        message: "startTime must be exactly on the hour",
      });
    }
    if (newEnd.getMinutes() !== 0 || newEnd.getSeconds() !== 0) {
      return res.status(400).json({
        success: false,
        message: "endTime must be exactly on the hour",
      });
    }

    // VALIDASI: start < end
    if (newStart >= newEnd) {
      return res.status(400).json({
        success: false,
        message: "endTime must be greater than startTime",
      });
    }

    // VALIDASI: startTime masa depan (user only)
    if (req.user.role !== "admin" && newStart <= now) {
      return res.status(400).json({
        success: false,
        message: "startTime must be in the future",
      });
    }

    // VALIDASI: minimal 1 jam, maksimal 24 jam
    const diffH = (newEnd - newStart) / (1000 * 60 * 60);
    if (diffH < 1) {
      return res.status(400).json({
        success: false,
        message: "Minimum reservation duration is 1 hour",
      });
    }
    if (diffH > 24) {
      return res.status(400).json({
        success: false,
        message: "Maximum reservation duration is 24 hours",
      });
    }

    // CEK BENTROK SAAT UPDATE
    const conflict = await Reservation.findOne({
      _id: { $ne: reservation._id },
      room: reservation.room,
      status: { $in: ["pending", "approved"] },
      $or: [
        {
          startTime: { $lt: newEnd },
          endTime: { $gt: newStart }
        }
      ]
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Time conflict: room already reserved in this time range",
      });
    }

    // replace PDF if uploaded
    if (req.file) {
      const oldPath = path.join(process.cwd(), reservation.documentUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      reservation.documentUrl = `/uploads/reservations/${req.file.filename}`;
    }

    reservation.title = title ?? reservation.title;
    reservation.description = description ?? reservation.description;
    reservation.startTime = newStart;
    reservation.endTime = newEnd;

    await reservation.save();

    res.json({
      success: true,
      message: "Reservation updated",
      data: reservation,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update reservation",
      error: err.message,
    });
  }
};

/**
 * DELETE RESERVATION
 * - user → miliknya + pending
 */
export const deleteReservation = async (req, res) => {
  try {
    const id = req.params.id;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    // only owner
    if (
      req.user.role !== "admin" &&
      reservation.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: not your reservation",
      });
    }

    // only pending
    if (req.user.role !== "admin" && reservation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reservations can be deleted",
      });
    }

    // delete PDF
    const pdfPath = path.join(process.cwd(), reservation.documentUrl);
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

    await reservation.deleteOne();

    res.json({
      success: true,
      message: "Reservation deleted",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete reservation",
      error: err.message,
    });
  }
};

/**
 * ADMIN: APPROVE / REJECT RESERVATION
 */
export const updateReservationStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status, rejectReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved' or 'rejected'",
      });
    }

    if (status === "rejected" && !rejectReason) {
      return res.status(400).json({
        success: false,
        message: "rejectReason is required when rejecting",
      });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    reservation.status = status;
    reservation.rejectReason = status === "rejected" ? rejectReason : undefined;

    await reservation.save();

    res.json({
      success: true,
      message: `Reservation ${status}`,
      data: reservation,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update reservation status",
      error: err.message,
    });
  }
};
