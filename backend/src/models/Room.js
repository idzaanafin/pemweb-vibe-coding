import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },         
    code: { type: String, unique: true },           
    description: { type: String },
    capacity: { type: Number },
    location: { type: String },                     
    latitude: { type: Number },                     
    longitude: { type: Number },
    imageUrl: { type: String, default: "/uploads/rooms/room.png" }, 
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Room = mongoose.model("Room", roomSchema);
