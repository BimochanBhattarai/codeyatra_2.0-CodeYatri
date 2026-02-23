import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";
import { handle_add_report, handle_get_reports } from "../controllers/report.controller.js";

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
report_router.get("/all", handle_get_reports);

export default report_router;
