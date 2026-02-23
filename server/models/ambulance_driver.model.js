import mongoose from "mongoose";

const ambulance_driver_schema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    driver_photo: { type: String, required: true },
    full_name: { type: String, required: true },
    phone_number: { type: String, required: true },
    nid_number: { type: String, required: true },
    experience_years: { type: Number, required: true },
    working_area: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      working_radius_km: { type: Number, required: true },
    },
    ambulance_type: {
      type: String,
      required: true,
    },
    vehicle_number: { type: String, required: true },
    vehicle_model: { type: String, required: true },
    vehicle_year: { type: Number, required: true },
    hospital_name: { type: String, required: true },
    hospital_phone: { type: String, required: true },
    license_number: { type: String, required: true },
    license_expiry: { type: Date, required: true },
    license_front: { type: String, required: true },
    license_back: { type: String, required: true },
    bluebook_number: { type: String, required: true },
    bluebook_expiry: { type: Date, required: true },
    bluebook_photo: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const ambulance_driver_model = mongoose.model(
  "ambulance_driver",
  ambulance_driver_schema,
);

export default ambulance_driver_model;