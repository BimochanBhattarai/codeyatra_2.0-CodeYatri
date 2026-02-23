import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";
import { handle_submit_ambulance_driver_application } from "../controllers/ambulance_driver.controller.js";

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
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const randomName = `${nanoid(32)}`;
      cb(null, randomName + ext);
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
  handle_submit_ambulance_driver_application,
);

export default ambulance_driver_router;
