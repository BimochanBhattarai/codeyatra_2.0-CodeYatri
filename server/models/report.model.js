import mongoose from "mongoose";

/*
* Defining the schema for the report model. 
* The report model is the main model used by users to report incidents.
* Model defines GPS variables, number of casualties, type of incident, description and user data.
* Defines status of the report for tracking.
*/

const report_schema = new mongoose.Schema(
  {
    report_id: { type: String, required: true, unique: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    estimated_number_of_casualties: { type: Number, required: true },
    incident_type: { type: String, required: true },
    photos: [{ type: String }],
    description: { type: String },
    phone_number: { type: String, required: true },
    reporter_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "in_progress", "resolved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const report_model = mongoose.model("report", report_schema);

export default report_model;
