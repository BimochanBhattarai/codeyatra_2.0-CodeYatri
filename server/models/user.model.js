import mongoose from "mongoose";

const user_schema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    phone_number: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    phone_verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const user_model = mongoose.model("user", user_schema);

export default user_model;
