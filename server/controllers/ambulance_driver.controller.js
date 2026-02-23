import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import ambulance_driver_model from "../models/ambulance_driver.model.js";
import user_model from "../models/user.model.js";

export const handle_submit_ambulance_driver_application = async (req, res) => {
  try {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const user = await user_model.findById(user_id);

    if (!user) {
      res.clearCookie("token");
      return res.status(401).json({
        status: "error",
        message:
          "You must be logged in to submit an ambulance driver application.",
      });
    }

    const {
      full_name,
      phone_number,
      nid_number,
      experience_years,
      working_area,
      ambulance_type,
      vehicle_number,
      vehicle_model,
      vehicle_year,
      hospital_name,
      hospital_phone,
      license_number,
      license_expiry,
      bluebook_number,
      bluebook_expiry,
    } = req.body;

    const parsed_working_area = working_area ? JSON.parse(working_area) : null;

    const files = req.files || {};

    if (
      !full_name ||
      !phone_number ||
      !nid_number ||
      !experience_years ||
      !parsed_working_area ||
      !ambulance_type ||
      !vehicle_number ||
      !vehicle_model ||
      !vehicle_year ||
      !hospital_name ||
      !hospital_phone ||
      !license_number ||
      !license_expiry ||
      !bluebook_number ||
      !bluebook_expiry
    ) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required.",
      });
    }

    if (
      !files.driver_photo ||
      !files.license_front ||
      !files.license_back ||
      !files.bluebook_photo
    ) {
      return res.status(400).json({
        status: "error",
        message: "All document uploads are required.",
      });
    }

    const user_dir = path.join(
      process.cwd(),
      "private/uploads/ambulance_driver",
      user_id.toString(),
    );

    if (!fs.existsSync(user_dir)) {
      fs.mkdirSync(user_dir, { recursive: true });
    }

    const move_file = (file_array) => {
      const file = file_array[0];
      const current_path = file.path;
      const final_path = path.join(user_dir, file.filename);
      fs.renameSync(current_path, final_path);
      return `/uploads/ambulance_driver/${user_id}/${file.filename}`;
    };

    const driver_photo = move_file(files.driver_photo);
    const license_front = move_file(files.license_front);
    const license_back = move_file(files.license_back);
    const bluebook_photo = move_file(files.bluebook_photo);

    const ambulance_driver = await ambulance_driver_model.create({
      user_id,
      driver_photo,
      full_name,
      phone_number,
      nid_number,
      experience_years,
      working_area: {
        latitude: parsed_working_area?.latitude ?? null,
        longitude: parsed_working_area?.longitude ?? null,
        working_radius_km: parsed_working_area?.working_radius_km ?? null,
      },
      ambulance_type,
      vehicle_number,
      vehicle_model,
      vehicle_year,
      hospital_name,
      hospital_phone,
      license_number,
      license_expiry: new Date(license_expiry),
      license_front,
      license_back,
      bluebook_number,
      bluebook_expiry: new Date(bluebook_expiry),
      bluebook_photo,
    });

    await user_model.findByIdAndUpdate(user_id, { type_conversion_lock: true });

    return res.status(201).json({
      status: "success",
      message: "Ambulance driver application submitted successfully.",
      data: ambulance_driver,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};
