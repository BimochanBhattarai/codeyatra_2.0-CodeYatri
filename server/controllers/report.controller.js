import fs from "fs";
import path from "path";
import report_model from "../models/report.model.js";

/*
  * This route allows users to submit a report of an Incident.
  * The report includes location, estimated number of casualties, incident type, description, and phone number.
  * Users can also upload photos related to the incident.
*/

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

export const handle_get_reports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reports = await report_model.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

    return res.status(200).json({
      status: "success",
      message: "Reports retrieved successfully.",
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