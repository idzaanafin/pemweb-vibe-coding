import multer from "multer";
import path from "path";
import fs from "fs";

const folder = "uploads/reservations";

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder, { recursive: true });
}

const storageReservation = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// Only PDF allowed
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(null, false);
    // res.status(400).json({ message: "Only PDF documents are allowed" });
  }
};

export const uploadReservation = multer({
  storage: storageReservation,
  fileFilter: pdfFilter,
});
