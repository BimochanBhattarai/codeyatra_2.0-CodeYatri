import express from "express";
import {
  handle_get_global_settings,
  handle_update_global_settings,
} from "../controllers/global.controller.js";

const global_router = express.Router();

global_router.get("/", handle_get_global_settings);

global_router.post("/update", handle_update_global_settings);

export default global_router;
