import { Room } from "../models/Room.js";
import path from "path";
import fs from "fs";


// GET ALL ROOMS
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: rooms,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get rooms",
      error: err.message,
    });
  }
};

// GET DETAIL ROOM
export const detailRooms = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get room detail",
      error: err.message,
    });
  }
};

// CREATE ROOM (image optional)
export const createRooms = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      capacity,
      location,
      latitude,
      longitude,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    // cek duplicate code
    if (code) {
      const exists = await Room.findOne({ code });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Room code already exists",
        });
      }
    }

    // otomatis pakai default image jika tidak ada upload
    const roomData = {
      name,
      code,
      description,
      location,
      capacity: capacity ? Number(capacity) : undefined,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      isActive: true,
    };

    // hanya tambahkan imageUrl jika ada upload
    if (req.file) {
      roomData.imageUrl = `/uploads/rooms/${req.file.filename}`;
    }

    const room = await Room.create(roomData);

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create room",
      error: err.message,
    });
  }
};

// UPDATE ROOM (image optional)
export const updateRooms = async (req, res) => {
  try {
    const roomId = req.params.id;

    const fields = { ...req.body };

    // Convert number fields only if provided
    if (fields.capacity !== undefined) fields.capacity = Number(fields.capacity);
    if (fields.latitude !== undefined) fields.latitude = Number(fields.latitude);
    if (fields.longitude !== undefined) fields.longitude = Number(fields.longitude);

    // Only update image if a new file is uploaded
    if (req.file) {
      fields.imageUrl = `/uploads/rooms/${req.file.filename}`;
    }

    const room = await Room.findByIdAndUpdate(roomId, fields, { new: true });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update room",
      error: err.message,
    });
  }
};

// DELETE ROOM
export const deleteRooms = async (req, res) => {
  try {
    const roomId = req.params.id;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Hapus file gambar jika bukan default
    if (room.imageUrl && room.imageUrl !== "/uploads/rooms/room.png") {
      const filePath = path.join(process.cwd(), room.imageUrl);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);        
      }
    }

    // Hapus data room dari database
    await room.deleteOne();

    res.json({
      success: true,
      message: "Room & image deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete room",
      error: err.message,
    });
  }
};