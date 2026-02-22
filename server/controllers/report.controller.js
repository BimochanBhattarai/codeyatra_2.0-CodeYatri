import report_model from "../models/report.model.js";

export const handle_add_report = async (req, res) => {
  try {
    const {
      location,
      estimated_number_of_casualties,
      incident_type,
      description,
      phone_number,
    } = req.body;

    const files = req.files || [];

    const report = await report_model.create({
      location: {
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
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
