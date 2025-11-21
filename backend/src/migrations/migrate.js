import mongoose from "mongoose";
import "dotenv/config.js";
import { User } from "../models/User.js";
import fs from "fs";
import path from "path";

async function resetAndSeed() {
  try {
    // Connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB local");

    const db = mongoose.connection.db;

    // RESET DATABASE
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log("Database already empty.");
    } else {
      for (let col of collections) {
        await db.dropCollection(col.name);
        console.log(`Dropped collection: ${col.name}`);
      }
    }

    // CLEAN UP UPLOADS FOLDER (/uploads/rooms/*)
    const uploadDir = path.join(process.cwd(), "uploads/rooms");

    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);

      for (const file of files) {
        if (file !== "room.png") {
          fs.unlinkSync(path.join(uploadDir, file));
          console.log("Deleted:", file);
        }
      }
    } else {
      console.log("uploads/rooms folder not found, skipping.");
    }

    // CLEAN UP RESERVATIONS UPLOADS (/uploads/reservations/*)
    const resUploadDir = path.join(process.cwd(), "uploads/reservations");

    if (fs.existsSync(resUploadDir)) {
      const files = fs.readdirSync(resUploadDir);

      for (const file of files) {
        try {
          fs.unlinkSync(path.join(resUploadDir, file));
          console.log("Deleted reservation upload:", file);
        } catch (err) {
          console.warn("Failed to delete reservation upload:", file, err.message || err);
        }
      }
    } else {
      console.log("uploads/reservations folder not found, skipping.");
    }

    // SEED ADMIN
    const adminEmail = "admin@admin.com";
    const exists = await User.findOne({ email: adminEmail });

    if (!exists) {
      await User.create({
        name: "Administrator",
        email: adminEmail,
        password: "admin123", // hashed automatically by pre-save hook
        role: "admin",
      });

      console.log("Admin user created:");
      console.log("email: admin@admin.com");
      console.log("password: admin123");
    } else {
      console.log("Admin user already exists.");
    }

    await mongoose.connection.close();
    console.log("Reset + Seed Completed.");
  } catch (err) {
    console.error("Error during reset & seed:", err);
    process.exit(1);
  }
}

resetAndSeed();
