import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import ambulance_driver_model from "../models/ambulance_driver.model.js";
import global_model from "../models/global.model.js";
import report_model from "../models/report.model.js";
import user_model from "../models/user.model.js";
import { handle_send_sms } from "../utils/sms_sender.js";

export const handle_add_report = async (req, res) => {
  try {
    const {
      location,
      estimated_number_of_casualties,
      incident_type,
      description,
      phone_number,
    } = req.body;

    const parsed_location = location ? JSON.parse(location) : null;

    const files = req.files || [];

    const report_id = `RE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const report = await report_model.create({
      report_id,
      location: {
        latitude: parsed_location?.latitude || null,
        longitude: parsed_location?.longitude || null,
      },
      estimated_number_of_casualties: estimated_number_of_casualties || null,
      incident_type: incident_type || "",
      description: description || "",
      phone_number: phone_number || "",
      photos: [],
      timeline: [
        {
          action: "Report created and pending verification",
          date: new Date(),
          performed_by: null,
        },
      ],
    });

    if (files.length > 0) {
      const reportDir = path.join(
        process.cwd(),
        "uploads/report",
        report._id.toString(),
      );

      fs.mkdirSync(reportDir, { recursive: true });

      const filePaths = [];

      for (const file of files) {
        const newPath = path.join(reportDir, file.filename);
        fs.renameSync(file.path, newPath);

        filePaths.push(`/uploads/report/${report._id}/${file.filename}`);
      }

      report.photos = filePaths;
      await report.save();
    }

    const globals = await global_model.findOne();

    globals?.police_mobile_alerts?.forEach((mobile_number) => {
      handle_send_sms(
        mobile_number,
        `Police Alert\n\nNew incident reported: ${report.incident_type} with estimated ${report.estimated_number_of_casualties} casualties. Check ${process.env.FRONTEND_BASE_URL}/track_report?report_id=${report.report_id} for details.`,
      );
    });

    return res.status(201).json({
      status: "success",
      message: "Report created successfully.",
      data: report,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_get_user_reports = async (req, res) => {
  try {
    const { token } = req.cookies;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const user = await user_model.findById(user_id);

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized.",
      });
    }

    const reports = await report_model
      .find({ phone_number: user.phone_number })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      message: "User reports retrieved successfully.",
      data: reports,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_get_all_reports = async (req, res) => {
  try {
    const { token } = req.cookies;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const user = await user_model.findById(user_id);

    if (
      !user ||
      (user.user_type !== "admin" && user.user_type !== "police_officer")
    ) {
      return res.status(401).json({
        status: "error",
        message: "You are not authorized to access this resource.",
      });
    }

    const reports = await report_model.find().sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      message: "All reports retrieved successfully.",
      data: reports,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_get_active_reports = async (req, res) => {
  try {
    const { token } = req.cookies;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const user = await user_model.findById(user_id);

    if (
      !user ||
      (user.user_type !== "admin" && user.user_type !== "police_officer")
    ) {
      return res.status(401).json({
        status: "error",
        message: "You are not authorized to access this resource.",
      });
    }

    const active_reports = await report_model
      .find({ status: { $in: ["pending", "verified", "in_progress"] } })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      message: "Active reports retrieved successfully.",
      data: active_reports,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_get_offered_reports_for_ambulance_driver = async (
  req,
  res,
) => {
  try {
    const { token } = req.cookies;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const user = await user_model.findById(user_id);

    if (!user || user.user_type !== "ambulance_driver") {
      return res.status(401).json({
        status: "error",
        message: "You are not authorized to access this resource.",
      });
    }

    const ambulance_driver = await ambulance_driver_model.findOne({
      user_id: user._id,
    });

    if (!ambulance_driver) {
      return res.status(404).json({
        status: "error",
        message: "Ambulance driver profile not found.",
      });
    }

    const offered_reports = await report_model
      .find({
        status: "verified",
        "offered_to_ambulance_drivers.driver": ambulance_driver._id,
        "offered_to_ambulance_drivers.status": "pending",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      message: "Offered reports retrieved successfully.",
      data: offered_reports,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_get_report_by_id = async (req, res) => {
  try {
    const { report_id } = req.params;

    const report = await report_model
      .findOne({ report_id })
      .populate({
        path: "timeline.performed_by",
        select: "full_name phone_number",
      })
      .populate({
        path: "offered_to_ambulance_drivers.driver",
        select: "full_name phone_number",
      });

    if (!report) {
      return res.status(404).json({
        status: "error",
        message: "Report not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Report retrieved successfully.",
      data: report,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_reject_report = async (req, res) => {
  try {
    const { report_id } = req.params;
    const { token } = req.cookies;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const user = await user_model.findById(user_id);

    if (
      !user ||
      (user.user_type !== "admin" && user.user_type !== "police_officer")
    ) {
      return res.status(401).json({
        status: "error",
        message: "You are not authorized to perform this action.",
      });
    }

    const report = await report_model.findOne({ _id: report_id });

    if (!report) {
      return res.status(404).json({
        status: "error",
        message: "Report not found.",
      });
    }

    if (report.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "Only pending reports can be rejected.",
      });
    }

    report.status = "rejected";
    report.timeline.push({
      action: "Report rejected",
      date: new Date(),
      performed_by: user._id,
    });

    await report.save();

    return res.status(200).json({
      status: "success",
      message: "Report rejected successfully.",
      data: report,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_cancel_report = async (req, res) => {
  try {
    const { report_id } = req.params;
    console.log("Cancel report request received for report_id:", report_id);
    const { token } = req.cookies;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const user = await user_model.findById(user_id);

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "You are not authorized to perform this action.",
      });
    }

    const report = await report_model.findOne({ _id: report_id });

    if (!report) {
      return res.status(404).json({
        status: "error",
        message: "Report not found.",
      });
    }

    console.log("Report found:", report);

    if (
      report.reporter_user?.toString() !== user._id.toString() &&
      report.phone_number !== user.phone_number
    ) {
      return res.status(403).json({
        status: "error",
        message: "You can only cancel your own reports.",
      });
    }

    if (report.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "Only pending reports can be cancelled.",
      });
    }

    report.status = "cancelled";
    report.timeline.push({
      action: "Report cancelled",
      date: new Date(),
      performed_by: user._id,
    });

    await report.save();

    return res.status(200).json({
      status: "success",
      message: "Report cancelled successfully.",
      data: report,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_verify_report = async (req, res) => {
  try {
    const { report_id } = req.params;
    const { token } = req.cookies;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const user = await user_model.findById(user_id);

    if (
      !user ||
      (user.user_type !== "admin" && user.user_type !== "police_officer")
    ) {
      return res.status(401).json({
        status: "error",
        message: "You are not authorized to perform this action.",
      });
    }

    const report = await report_model.findOne({ _id: report_id });

    if (!report) {
      return res.status(404).json({
        status: "error",
        message: "Report not found.",
      });
    }

    if (report.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "Only pending reports can be verified.",
      });
    }

    // ── Haversine ────────────────────────────────────────────────────────────
    const get_distance_km = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // ── Find nearby ambulances ───────────────────────────────────────────────
    const { latitude, longitude } = report.location;

    const verified_drivers = await ambulance_driver_model
      .find({ status: "verified" })
      .lean();

    const nearby_drivers = verified_drivers
      .map((driver) => {
        const distance_km = get_distance_km(
          latitude,
          longitude,
          driver.working_area.latitude,
          driver.working_area.longitude,
        );
        return { ...driver, distance_km };
      })
      .filter(
        (driver) => driver.distance_km <= driver.working_area.working_radius_km,
      )
      .sort((a, b) => a.distance_km - b.distance_km);

    console.log(
      `Found ${nearby_drivers.length} nearby ambulance(s) for report ${report.report_id}`,
    );
    console.log("Nearby drivers:", nearby_drivers);

    nearby_drivers.forEach((driver) => {
      handle_send_sms(
        driver.phone_number,
        `Ambulance Dispatch\n\nEmergency verified: ${report.incident_type} with ~${report.estimated_number_of_casualties} casualties. Check ${process.env.FRONTEND_BASE_URL}/track_report?report_id=${report.report_id} for details and dispatch instructions.`,
      );
      report.offered_to_ambulance_drivers.push({
        driver: driver._id,
        status: "pending",
      });
    });

    report.status = "verified";
    report.timeline.push({
      action: "Report verified",
      date: new Date(),
      performed_by: user._id,
    });

    await report.save();

    return res.status(200).json({
      status: "success",
      message: `Report verified. ${nearby_drivers.length} ambulance(s) notified.`,
      data: report,
      nearby_ambulances: nearby_drivers,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_accept_ambulance_offer = async (req, res) => {
  try {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const user = await user_model.findById(user_id);

    if (!user || user.user_type !== "ambulance_driver") {
      return res.status(401).json({
        status: "error",
        message: "You are not authorized to perform this action.",
      });
    }

    const ambulance_driver = await ambulance_driver_model.findOne({
      user_id: user._id,
    });

    if (!ambulance_driver) {
      return res.status(404).json({
        status: "error",
        message: "Ambulance driver profile not found.",
      });
    }

    const { report_id } = req.params;

    const { response_location } = req.body;

    const report = await report_model.findById(report_id);

    if (!report) {
      return res.status(404).json({
        status: "error",
        message: "Report not found.",
      });
    }

    if (report.status !== "verified") {
      return res.status(400).json({
        status: "error",
        message: "Only verified reports can be accepted.",
      });
    }

    report.offered_to_ambulance_drivers =
      report.offered_to_ambulance_drivers.map((offer) => {
        if (offer.driver.toString() === ambulance_driver._id.toString()) {
          return {
            ...offer,
            status: "accepted",
            response_date: new Date(),
            response_location: JSON.parse(response_location),
          };
        }
        return offer;
      });

    report.status = "in_progress";

    report.timeline.push({
      action: `Ambulance offer accepted`,
      date: new Date(),
      performed_by: user._id,
    });

    await report.save();

    return res.status(200).json({
      status: "success",
      message: "Ambulance offer accepted successfully.",
      data: report,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_reject_ambulance_offer = async (req, res) => {
  try {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const user = await user_model.findById(user_id);

    if (!user || user.user_type !== "ambulance_driver") {
      return res.status(401).json({
        status: "error",
        message: "You are not authorized to perform this action.",
      });
    }

    const ambulance_driver = await ambulance_driver_model.findOne({
      user_id: user._id,
    });

    if (!ambulance_driver) {
      return res.status(404).json({
        status: "error",
        message: "Ambulance driver profile not found.",
      });
    }

    const { report_id } = req.params;

    const report = await report_model.findById(report_id);

    if (!report) {
      return res.status(404).json({
        status: "error",
        message: "Report not found.",
      });
    }

    report.offered_to_ambulance_drivers =
      report.offered_to_ambulance_drivers.map((offer) => {
        if (offer.driver.toString() === ambulance_driver._id.toString()) {
          return { ...offer, status: "rejected", response_date: new Date() };
        }
        return offer;
      });

    if (
      report.offered_to_ambulance_drivers.every(
        (offer) => offer.status === "rejected",
      )
    ) {
      report.status = "halted";
      report.timeline.push({
        action: "All ambulance offers rejected, report halted",
        date: new Date(),
        performed_by: null,
      });
    }

    await report.save();

    return res.status(200).json({
      status: "success",
      message: "Ambulance offer rejected successfully.",
      data: report,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};
