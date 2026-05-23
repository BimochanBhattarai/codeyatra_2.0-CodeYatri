import fs from "fs";
import path from "path";
import ambulance_driver_model from "../models/ambulance_driver.model.js";
import report_model from "../models/report.model.js";
import BaseController from "./base.controller.js";

class AmbulanceController extends BaseController {
  static REQUIRED_DRIVER_FIELDS = [
    "nid_number",
    "experience_years",
    "ambulance_type",
    "vehicle_number",
    "vehicle_model",
    "vehicle_year",
    "hospital_name",
    "hospital_phone",
    "license_number",
    "license_expiry",
    "bluebook_number",
    "bluebook_expiry",
  ];

  static REQUIRED_FILES = [
    "driver_photo",
    "license_front",
    "license_back",
    "bluebook_photo",
  ];

  static UPLOAD_BASE_DIR = "private/uploads/ambulance_driver";

  constructor() {
    super();
    this.ambulance_driver_model = ambulance_driver_model;
    this.report_model = report_model;
  }

  static move_uploaded_file(file_array, user_dir, user_id) {
    const file = file_array[0];
    fs.renameSync(file.path, path.join(user_dir, file.filename));
    return `/uploads/ambulance_driver/${user_id}/${file.filename}`;
  }

  static validate_required_fields(body, parsed_working_area) {
    return (
      AmbulanceController.REQUIRED_DRIVER_FIELDS.every((f) => !!body[f]) &&
      !!parsed_working_area
    );
  }

  static validate_required_files(files) {
    return AmbulanceController.REQUIRED_FILES.every((f) => !!files[f]);
  }

  async submit_application(req, res) {
    try {
      const user = await this.get_authenticated_user(req);

      if (!user) {
        res.clearCookie("token");
        return this.send_error(
          res,
          401,
          "You must be logged in to submit an ambulance driver application.",
        );
      }

      const {
        full_name,
        phone_number,
        working_area,
        nid_number,
        experience_years,
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

      const parsed_working_area = working_area
        ? JSON.parse(working_area)
        : null;

      const files = req.files || {};

      if (
        !AmbulanceController.validate_required_fields(
          req.body,
          parsed_working_area,
        )
      ) {
        return this.send_error(res, 400, "All fields are required.");
      }

      if (!AmbulanceController.validate_required_files(files)) {
        return this.send_error(res, 400, "All document uploads are required.");
      }

      const user_dir = path.join(
        process.cwd(),
        AmbulanceController.UPLOAD_BASE_DIR,
        user._id.toString(),
      );

      if (!fs.existsSync(user_dir)) {
        fs.mkdirSync(user_dir, { recursive: true });
      }

      const driver_photo = AmbulanceController.move_uploaded_file(
        files.driver_photo,
        user_dir,
        user._id,
      );
      const license_front = AmbulanceController.move_uploaded_file(
        files.license_front,
        user_dir,
        user._id,
      );
      const license_back = AmbulanceController.move_uploaded_file(
        files.license_back,
        user_dir,
        user._id,
      );
      const bluebook_photo = AmbulanceController.move_uploaded_file(
        files.bluebook_photo,
        user_dir,
        user._id,
      );

      const ambulance_driver = await this.ambulance_driver_model.create({
        user_id: user._id,
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

      await this.user_model.findByIdAndUpdate(user._id, {
        type_conversion_lock: true,
        type_change_requested: true,
      });

      return res.status(201).json({
        status: "success",
        message: "Ambulance driver application submitted successfully.",
        data: ambulance_driver,
      });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async get_user_type_change_applications(req, res) {
    try {
      const user = await this.get_authenticated_user(req);

      if (!user) {
        return this.send_error(res, 404, "User not found.");
      }

      const ambulance_applications = await this.ambulance_driver_model.find({
        user_id: user._id,
      });

      return res.status(200).json({
        status: "success",
        data: ambulance_applications,
      });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async get_offered_reports(req, res) {
    try {
      const user = await this.get_authenticated_user(req);

      if (!user || user.user_type !== "ambulance_driver") {
        return this.send_error(res, 403, "Access denied.");
      }

      const ambulance_driver = await this.ambulance_driver_model.findOne({
        user_id: user._id,
      });

      if (!ambulance_driver) {
        return this.send_error(res, 404, "Ambulance driver profile not found.");
      }

      const reports = await this.report_model
        .find({
          status: "verified",
          offered_to_ambulance_drivers: {
            $elemMatch: {
              driver: ambulance_driver._id,
              status: "pending",
            },
          },
        })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        status: "success",
        data: reports,
      });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async get_accepted_reports(req, res) {
    try {
      const user = await this.get_authenticated_user(req);

      if (!user || user.user_type !== "ambulance_driver") {
        return this.send_error(res, 403, "Access denied.");
      }

      const ambulance_driver = await this.ambulance_driver_model.findOne({
        user_id: user._id,
      });

      if (!ambulance_driver) {
        return this.send_error(res, 404, "Ambulance driver profile not found.");
      }

      const reports = await this.report_model
        .find({
          status: { $in: ["in_progress", "resolved"] },
          offered_to_ambulance_drivers: {
            $elemMatch: {
              driver: ambulance_driver._id,
              status: "accepted",
            },
          },
        })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        status: "success",
        data: reports,
      });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async accept_offer(req, res) {
    try {
      const user = await this.get_authenticated_user(req);

      if (!user || user.user_type !== "ambulance_driver") {
        return this.send_error(res, 403, "Access denied.");
      }

      const ambulance_driver = await this.ambulance_driver_model.findOne({
        user_id: user._id,
      });

      if (!ambulance_driver) {
        return this.send_error(res, 404, "Ambulance driver profile not found.");
      }

      const report = await this.report_model.findById(req.params.report_id);

      if (!report) {
        return this.send_error(res, 404, "Report not found.");
      }

      if (report.status !== "verified") {
        return this.send_error(
          res,
          400,
          "Only verified reports can be accepted.",
        );
      }

      let offer_found = false;
      let offer_already_handled = false;

      report.offered_to_ambulance_drivers =
        report.offered_to_ambulance_drivers.map((offer) => {
          if (offer.driver.toString() === ambulance_driver._id.toString()) {
            offer_found = true;

            if (offer.status !== "pending") {
              offer_already_handled = true;
              return offer;
            }

            return {
              ...offer.toObject(),
              status: "accepted",
              response_date: new Date(),
              response_location: JSON.parse(req.body.response_location),
            };
          }

          return offer;
        });

      if (!offer_found) {
        return this.send_error(
          res,
          403,
          "This report was not offered to this ambulance driver.",
        );
      }

      if (offer_already_handled) {
        return this.send_error(
          res,
          400,
          "This ambulance offer has already been responded to.",
        );
      }

      report.status = "in_progress";
      this.push_timeline(report, "Ambulance offer accepted", user._id);

      await report.save();

      return res.status(200).json({
        status: "success",
        message: "Ambulance offer accepted successfully.",
        data: report,
      });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async reject_offer(req, res) {
    try {
      const user = await this.get_authenticated_user(req);

      if (!user || user.user_type !== "ambulance_driver") {
        return this.send_error(res, 403, "Access denied.");
      }

      const ambulance_driver = await this.ambulance_driver_model.findOne({
        user_id: user._id,
      });

      if (!ambulance_driver) {
        return this.send_error(res, 404, "Ambulance driver profile not found.");
      }

      const report = await this.report_model.findById(req.params.report_id);

      if (!report) {
        return this.send_error(res, 404, "Report not found.");
      }

      let offer_found = false;
      let offer_already_handled = false;

      report.offered_to_ambulance_drivers =
        report.offered_to_ambulance_drivers.map((offer) => {
          if (offer.driver.toString() === ambulance_driver._id.toString()) {
            offer_found = true;

            if (offer.status !== "pending") {
              offer_already_handled = true;
              return offer;
            }

            return {
              ...offer.toObject(),
              status: "rejected",
              response_date: new Date(),
            };
          }

          return offer;
        });

      if (!offer_found) {
        return this.send_error(
          res,
          403,
          "This report was not offered to this ambulance driver.",
        );
      }

      if (offer_already_handled) {
        return this.send_error(
          res,
          400,
          "This ambulance offer has already been responded to.",
        );
      }

      if (
        report.offered_to_ambulance_drivers.length > 0 &&
        report.offered_to_ambulance_drivers.every(
          (o) => o.status === "rejected",
        )
      ) {
        report.status = "halted";
        this.push_timeline(
          report,
          "All ambulance offers rejected, report halted",
        );
      }

      await report.save();

      return res.status(200).json({
        status: "success",
        message: "Ambulance offer rejected successfully.",
        data: report,
      });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async picked_up_patient(req, res) {
    try {
      const user = await this.get_authenticated_user(req);

      if (!user || user.user_type !== "ambulance_driver") {
        return this.send_error(res, 403, "Access denied.");
      }

      const ambulance_driver = await this.ambulance_driver_model.findOne({
        user_id: user._id,
      });

      if (!ambulance_driver) {
        return this.send_error(res, 404, "Ambulance driver profile not found.");
      }

      const report = await this.report_model.findById(req.params.report_id);

      if (!report) {
        return this.send_error(res, 404, "Report not found.");
      }

      if (report.status !== "in_progress") {
        return this.send_error(
          res,
          400,
          "Only in-progress reports can be marked as picked up.",
        );
      }

      const offer = report.offered_to_ambulance_drivers.find(
        (o) => o.driver.toString() === ambulance_driver._id.toString(),
      );

      if (!offer || offer.status !== "accepted") {
        return this.send_error(
          res,
          403,
          "This ambulance driver is not assigned to this report.",
        );
      }

      report.status = "picked_up";
      this.push_timeline(report, "Patient picked up by ambulance", user._id);

      await report.save();

      return res.status(200).json({
        status: "success",
        message: "Report marked as picked up successfully.",
        data: report,
      });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async resolve_report(req, res) {
    try {
      const user = await this.get_authenticated_user(req);

      if (!user || user.user_type !== "ambulance_driver") {
        return this.send_error(res, 403, "Access denied.");
      }

      const ambulance_driver = await this.ambulance_driver_model.findOne({
        user_id: user._id,
      });

      if (!ambulance_driver) {
        return this.send_error(res, 404, "Ambulance driver profile not found.");
      }

      const report = await this.report_model.findById(req.params.report_id);

      if (!report) {
        return this.send_error(res, 404, "Report not found.");
      }

      if (report.status !== "picked_up") {
        return this.send_error(
          res,
          400,
          "Only reports with patient picked up can be marked as resolved.",
        );
      }

      const offer = report.offered_to_ambulance_drivers.find(
        (o) => o.driver.toString() === ambulance_driver._id.toString(),
      );

      if (!offer || offer.status !== "accepted") {
        return this.send_error(
          res,
          403,
          "This ambulance driver is not assigned to this report.",
        );
      }

      report.status = "resolved";
      this.push_timeline(
        report,
        "Report marked as resolved by ambulance",
        user._id,
      );

      await report.save();

      return res.status(200).json({
        status: "success",
        message: "Report marked as resolved successfully.",
        data: report,
      });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }
}

export default new AmbulanceController();
