import mongoose from "mongoose";

const global_schema = new mongoose.Schema(
  {
    police_mobile_alerts: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
);

const global_model = mongoose.model("global", global_schema);

export default global_model;