import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";
import ReportController from "../controllers_class/report.controller.js";
import PoliceController from "../controllers_class/police.controller.js";

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
    filename: (req, file, cb) => {
      cb(null, `${nanoid(32)}${path.extname(file.originalname)}`);
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
  (req, res) => ReportController.add_report(req, res),
);

report_router.get("/user", (req, res) =>
  ReportController.get_user_reports(req, res),
);

report_router.get("/all", (req, res) =>
  PoliceController.get_all_reports(req, res),
);

report_router.get("/active", (req, res) =>
  PoliceController.get_active_reports(req, res),
);

report_router.get("/track/:report_id", (req, res) =>
  ReportController.get_report_by_id(req, res),
);

report_router.post("/reject/:report_id", (req, res) =>
  PoliceController.reject_report(req, res),
);

report_router.post("/cancel/:report_id", (req, res) =>
  ReportController.cancel_report(req, res),
);

report_router.post("/verify/:report_id", (req, res) =>
  PoliceController.verify_report(req, res),
);

report_router.get("/download_evidence/:report_id/:filename", (req, res) =>
  PoliceController.download_evidence_photo(req, res),
);

export default report_router;
