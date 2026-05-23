import express from "express";
import GlobalController from "../controllers_class/global.controller.js";

const global_router = express.Router();

global_router.get("/", (req, res) => GlobalController.get_settings(req, res));

global_router.post("/update", (req, res) =>
  GlobalController.update_settings(req, res),
);

export default global_router;
