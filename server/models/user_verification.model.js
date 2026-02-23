import mongoose from "mongoose";

const user_verification_schema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    verification_code: { type: String, required: true },
  },
  { timestamps: true },
);

const user_verification_model = mongoose.model(
  "user_verification",
  user_verification_schema,
);

export default user_verification_model;
