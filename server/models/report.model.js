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
    photos: { type: [String], default: [] },
    description: { type: String },
    phone_number: { type: String, required: true },
    reporter_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "verified",
        "in_progress",
        "halted",
        "resolved",
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },
    timeline: [
      {
        date: { type: Date, default: Date.now },
        action: { type: String, required: true },
        performed_by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],
    offered_to_ambulance_drivers: [
      {
        driver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ambulance_driver",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        response_date: { type: Date },
        response_location: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
      },
    ],
  },
  { timestamps: true },
);

const report_model = mongoose.model("report", report_schema);

export default report_model;
