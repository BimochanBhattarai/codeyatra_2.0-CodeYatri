import mongoose from "mongoose";

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
);git remote remove origin
git remote add origin https://github.com/BimochanBhattarai/codeyatra_2.0-CodeYatri.git
git remote -v

const report_model = mongoose.model("report", report_schema);

export default report_model;
