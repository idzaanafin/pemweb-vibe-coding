import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  title: { type: String, required: true },
  description: { type: String },

  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  documentUrl: { type: String, required: true }, 

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectReason: { type: String },
}, { timestamps: true });


export const Reservation = mongoose.model("Reservation", reservationSchema);
