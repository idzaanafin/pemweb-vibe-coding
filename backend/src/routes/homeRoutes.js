import { Router } from "express";
import { home, getEvents } from "../controllers/homeController.js";

const router = Router();

// home (ping)
router.get("/", home);

// events (public)
router.get("/events", getEvents);

export default router;
