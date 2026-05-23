import fs from "fs";
import path from "path";
import global_model from "../models/global.model.js";
import report_model from "../models/report.model.js";
import { handle_send_sms } from "../utils/sms_sender.js";
import BaseController from "./base.controller.js";

class ReportController extends BaseController {
  static UPLOAD_BASE_DIR = "uploads/report";

  constructor() {
    super();
    this.report_model = report_model;
    this.global_model = global_model;
    this.frontend_base_url = process.env.FRONTEND_BASE_URL;
  }

  static generate_report_id() {
    return `RE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  async add_report(req, res) {
    try {
      const { location, estimated_number_of_casualties, incident_type, description, phone_number } = req.body;
      const parsed_location = location ? JSON.parse(location) : null;
      const files = req.files || [];

      const report = await this.report_model.create({
        report_id: ReportController.generate_report_id(),
        location: { latitude: parsed_location?.latitude || null, longitude: parsed_location?.longitude || null },
        estimated_number_of_casualties: estimated_number_of_casualties || null,
        incident_type: incident_type || "",
        description: description || "",
        phone_number: phone_number || "",
        photos: [],
        timeline: [{ action: "Report created and pending verification", date: new Date(), performed_by: null }],
      });

      if (files.length > 0) {
        const report_dir = path.join(process.cwd(), ReportController.UPLOAD_BASE_DIR, report._id.toString());
        fs.mkdirSync(report_dir, { recursive: true });

        const file_paths = [];
        for (const file of files) {
          const new_path = path.join(report_dir, file.filename);
          fs.renameSync(file.path, new_path);
          file_paths.push(`/${ReportController.UPLOAD_BASE_DIR}/${report._id}/${file.filename}`);
        }
        report.photos = file_paths;
        await report.save();
      }

      const globals = await this.global_model.findOne();
      globals?.police_mobile_alerts?.forEach((mobile_number) => {
        handle_send_sms(mobile_number, `Police Alert\n\nNew incident: ${report.incident_type}, ~${report.estimated_number_of_casualties} casualties. ${this.frontend_base_url}/track_report?report_id=${report.report_id}`);
      });

      return res.status(201).json({ status: "success", message: "Report created successfully.", data: report });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async get_user_reports(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!user) return this.send_error(res, 401, "Unauthorized.");

      const reports = await this.report_model.find({ phone_number: user.phone_number }).sort({ createdAt: -1 });
      return res.status(200).json({ status: "success", message: "Reports retrieved.", data: reports });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async get_report_by_id(req, res) {
    try {
      const report = await this.report_model
        .findOne({ report_id: req.params.report_id })
        .populate({ path: "timeline.performed_by", select: "full_name phone_number" })
        .populate({ path: "offered_to_ambulance_drivers.driver", select: "full_name phone_number" });

      if (!report) return this.send_error(res, 404, "Report not found.");
      return res.status(200).json({ status: "success", message: "Report retrieved.", data: report });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async cancel_report(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!user) return this.send_error(res, 401, "Unauthorized.");

      const report = await this.report_model.findOne({ _id: req.params.report_id });
      if (!report) return this.send_error(res, 404, "Report not found.");

      if (report.reporter_user?.toString() !== user._id.toString() && report.phone_number !== user.phone_number) {
        return this.send_error(res, 403, "You can only cancel your own reports.");
      }
      if (report.status !== "pending") return this.send_error(res, 400, "Only pending reports can be cancelled.");

      report.status = "cancelled";
      this.push_timeline(report, "Report cancelled by user", user._id);
      await report.save();

      return res.status(200).json({ status: "success", message: "Report cancelled.", data: report });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }
}

export default new ReportController();