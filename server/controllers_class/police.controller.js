import fs from "fs";
import path from "path";
import ambulance_driver_model from "../models/ambulance_driver.model.js";
import report_model from "../models/report.model.js";
import { handle_send_sms } from "../utils/sms_sender.js";
import BaseController from "./base.controller.js";

class PoliceController extends BaseController {
  static ACTIVE_STATUSES = ["pending", "verified", "in_progress"];
  static UPLOAD_BASE_DIR = "uploads/report";
  static EARTH_RADIUS_KM = 6371;

  constructor() {
    super();
    this.report_model = report_model;
    this.ambulance_driver_model = ambulance_driver_model;
    this.frontend_base_url = process.env.FRONTEND_BASE_URL;
  }

  static get_distance_km(lat1, lon1, lat2, lon2) {
    const R = PoliceController.EARTH_RADIUS_KM;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async get_all_reports(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!this.is_privileged(user)) return this.send_error(res, 403, "Access denied.");

      const reports = await this.report_model.find().sort({ createdAt: -1 });
      return res.status(200).json({ status: "success", data: reports });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async get_active_reports(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!this.is_privileged(user)) return this.send_error(res, 403, "Access denied.");

      const reports = await this.report_model
        .find({ status: { $in: PoliceController.ACTIVE_STATUSES } })
        .sort({ createdAt: -1 });
      return res.status(200).json({ status: "success", data: reports });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async verify_report(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!this.is_privileged(user)) return this.send_error(res, 403, "Access denied.");

      const report = await this.report_model.findOne({ _id: req.params.report_id });
      if (!report) return this.send_error(res, 404, "Report not found.");
      if (report.status !== "pending") return this.send_error(res, 400, "Only pending reports can be verified.");

      const { latitude, longitude } = report.location;
      const verified_drivers = await this.ambulance_driver_model.find({ status: "verified" }).lean();

      const nearby_drivers = verified_drivers
        .map((driver) => ({
          ...driver,
          distance_km: PoliceController.get_distance_km(latitude, longitude, driver.working_area.latitude, driver.working_area.longitude),
        }))
        .filter((d) => d.distance_km <= d.working_area.working_radius_km)
        .sort((a, b) => a.distance_km - b.distance_km);

      nearby_drivers.forEach((driver) => {
        handle_send_sms(driver.phone_number, `Ambulance Dispatch\n\nEmergency: ${report.incident_type} ~${report.estimated_number_of_casualties} casualties. ${this.frontend_base_url}/track_report?report_id=${report.report_id}`);
        report.offered_to_ambulance_drivers.push({ driver: driver._id, status: "pending" });
      });

      report.status = "verified";
      this.push_timeline(report, "Report verified by police/admin", user._id);
      await report.save();

      return res.status(200).json({
        status: "success",
        message: `Report verified. ${nearby_drivers.length} ambulance(s) notified.`,
        data: report,
      });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async reject_report(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!this.is_privileged(user)) return this.send_error(res, 403, "Access denied.");

      const report = await this.report_model.findOne({ _id: req.params.report_id });
      if (!report) return this.send_error(res, 404, "Report not found.");
      if (report.status !== "pending") return this.send_error(res, 400, "Only pending reports can be rejected.");

      report.status = "rejected";
      this.push_timeline(report, "Report rejected by police/admin", user._id);
      await report.save();

      return res.status(200).json({ status: "success", message: "Report rejected.", data: report });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async download_evidence_photo(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!this.is_privileged(user)) return this.send_error(res, 403, "Access denied.");

      const { report_id, filename } = req.params;
      const report = await this.report_model.findOne({ _id: report_id });
      if (!report) return this.send_error(res, 404, "Report not found.");

      const photo_path = path.join(process.cwd(), PoliceController.UPLOAD_BASE_DIR, report._id.toString(), filename);
      if (!fs.existsSync(photo_path)) return this.send_error(res, 404, "Photo not found.");

      res.download(photo_path, filename);
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }
}

export default new PoliceController();