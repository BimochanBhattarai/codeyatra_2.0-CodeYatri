import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";
import {
  handle_accept_ambulance_offer,
  handle_add_report,
  handle_cancel_report,
  handle_download_evidence_photo,
  handle_get_active_reports,
  handle_get_all_reports,
  handle_get_offered_reports_for_ambulance_driver,
  handle_get_report_by_id,
  handle_get_user_reports,
  handle_reject_ambulance_offer,
  handle_reject_report,
  handle_verify_report,
} from "../controllers/report.controller.js";

const reportFileUpload = multer({
  limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Only image files are allowed !"), false);
    }
    cb(null, true);
  },
  storage: multer.diskStorage({
    destination: "./uploads/report/",
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const randomName = `${nanoid(32)}`;
      cb(null, randomName + ext);
    },
  }),
});

const reportFileSizeErrorHandler = (err, req, res, next) => {
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

const report_router = express.Router();

report_router.post(
  "/add",
  reportFileUpload.array("photos", 5),
  reportFileSizeErrorHandler,
  handle_add_report,
);
report_router.get("/user", handle_get_user_reports);

report_router.get("/all", handle_get_all_reports);

report_router.get("/active", handle_get_active_reports);

report_router.get(
  "/ambulance_offered_reports",
  handle_get_offered_reports_for_ambulance_driver,
);

report_router.get("/track/:report_id", handle_get_report_by_id);

report_router.post("/reject/:report_id", handle_reject_report);

report_router.post("/cancel/:report_id", handle_cancel_report);

report_router.post("/verify/:report_id", handle_verify_report);

report_router.post(
  "/accept_ambulance_offer/:report_id",
  handle_accept_ambulance_offer,
);

report_router.post(
  "/reject_ambulance_offer/:report_id",
  handle_reject_ambulance_offer,
);

report_router.get(
  "/download_evidence/:report_id/:filename",
  handle_download_evidence_photo,
);

export default report_router;