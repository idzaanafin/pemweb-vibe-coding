import { Reservation } from "../models/Reservation.js";
import { Room } from "../models/Room.js";

export const home = (req, res) => {
  res.json({
    message: "Server OK!",
  });
};


/**
 * GET /events
 * Public → tampilkan semua event (reservasi approved)
 */
export const getEvents = async (req, res) => {
  try {
    const events = await Reservation.find({ status: "approved" })
      .populate("room")
      .populate("user", "name email");

    // Format data lebih rapi untuk FE Map
    const formatted = events.map(ev => ({
      id: ev._id,
      title: ev.title,
      description: ev.description,
      startTime: ev.startTime,
      endTime: ev.endTime,
      user: ev.user ? {
        id: ev.user._id,
        name: ev.user.name,
        email: ev.user.email
      } : null,
      room: ev.room ? {
        id: ev.room._id,
        name: ev.room.name,
        code: ev.room.code,
        location: ev.room.location,
        latitude: ev.room.latitude,
        longitude: ev.room.longitude,
        imageUrl: ev.room.imageUrl,
      } : null
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load events",
      error: err.message,
    });
  }
};
