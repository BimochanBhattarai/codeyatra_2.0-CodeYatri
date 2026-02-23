import jwt from "jsonwebtoken";
import global_model from "../models/global.model.js";
import user_model from "../models/user.model.js";

export const handle_get_global_settings = async (req, res) => {
  try {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await user_model.findById(decoded.user_id);

    if (
      !user ||
      (user.user_type !== "admin" && user.user_type !== "police_officer")
    ) {
      return res.status(401).json({
        status: "error",
        message:
          "Unauthorized. Only admin and police officers can access global settings.",
      });
    }

    let global_settings = await global_model.findOne();

    if (!global_settings) {
      await global_model.create({
        police_mobile_alerts: [],
      });

      global_settings = await global_model.findOne();
    }

    return res.status(200).json({
      status: "success",
      data: global_settings,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_update_global_settings = async (req, res) => {
  try {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await user_model.findById(decoded.user_id);

    if (
      !user ||
      (user.user_type !== "admin" && user.user_type !== "police_officer")
    ) {
      return res.status(401).json({
        status: "error",
        message:
          "Unauthorized. Only admin and police officers can update global settings.",
      });
    }

    const { police_mobile_alerts } = req.body;

    let global_settings = await global_model.findOne();

    if (!global_settings) {
      global_settings = await global_model.create({
        police_mobile_alerts: police_mobile_alerts || [],
      });
    } else {
      global_settings.police_mobile_alerts = police_mobile_alerts || [];
      await global_settings.save();
    }

    return res.status(200).json({
      status: "success",
      message: "Global settings updated successfully.",
      data: global_settings,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};
