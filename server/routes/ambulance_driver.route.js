import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";
import AmbulanceController from "../controllers_class/ambulance.controller.js";

const ambulanceDriverPhotoUpload = multer({
  limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Only image files are allowed !"), false);
    }
    cb(null, true);
  },
  storage: multer.diskStorage({
    destination: "./private/uploads/ambulance_driver/",
    filename: (req, file, cb) => {
      cb(null, `${nanoid(32)}${path.extname(file.originalname)}`);
    },
  }),
});

const ambulanceDriverPhotoSizeErrorHandler = (err, req, res, next) => {
  if (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "File size limit of 10MB exceeded !" });
    } else {
      res.status(400).json({ message: err.message });
    }
  } else {
    next();
  }
};

const ambulance_driver_router = express.Router();

ambulance_driver_router.post(
  "/submit_application",
  ambulanceDriverPhotoUpload.fields([
    { name: "driver_photo", maxCount: 1 },
    { name: "license_front", maxCount: 1 },
    { name: "license_back", maxCount: 1 },
    { name: "bluebook_photo", maxCount: 1 },
  ]),
  ambulanceDriverPhotoSizeErrorHandler,
  (req, res) => AmbulanceController.submit_application(req, res),
);

ambulance_driver_router.get("/offered_reports", (req, res) =>
  AmbulanceController.get_offered_reports(req, res),
);

ambulance_driver_router.get("/accepted_reports", (req, res) =>
  AmbulanceController.get_accepted_reports(req, res),
);

ambulance_driver_router.post("/accept_offer/:report_id", (req, res) =>
  AmbulanceController.accept_offer(req, res),
);

ambulance_driver_router.post("/reject_offer/:report_id", (req, res) =>
  AmbulanceController.reject_offer(req, res),
);

ambulance_driver_router.post("/picked_up_patient/:report_id", (req, res) =>
  AmbulanceController.picked_up_patient(req, res),
);

ambulance_driver_router.post("/resolve_report/:report_id", (req, res) =>
  AmbulanceController.resolve_report(req, res),
);

export default ambulance_driver_router;