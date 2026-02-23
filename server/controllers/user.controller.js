import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ambulance_driver_model from "../models/ambulance_driver.model.js";
import user_model from "../models/user.model.js";
import user_verification_model from "../models/user_verification.model.js";
import { handle_send_sms } from "../utils/sms_sender.js";

export const handle_register_user = async (req, res) => {
  try {
    const { full_name, phone_number, password } = req.body;

    if (!full_name || !phone_number || !password) {
      return res.status(400).json({
        status: "error",
        message: "Full name, phone number, and password are required.",
      });
    }

    const existing_user = await user_model.findOne({
      phone_number: phone_number,
      phone_verified: true,
    });

    if (existing_user) {
      return res.status(400).json({
        status: "error",
        message: "Phone number is already registered and verified.",
      });
    }

    await user_model.deleteMany({
      phone_number: phone_number,
      phone_verified: false,
    });

    const password_hash = bcrypt.hashSync(password, 10);
    const OTP = Math.floor(100000 + Math.random() * 900000).toString();

    const new_user = await user_model.create({
      full_name,
      phone_number,
      password_hash: password_hash,
    });

    await user_verification_model.create({
      user_id: new_user._id,
      verification_code: OTP,
    });

    await handle_send_sms(
      phone_number,
      `Your verification code for Uddhar is: ${OTP}`,
    );

    return res.status(201).json({
      status: "success",
      message: "User registered successfully. Please verify your phone number.",
      data: {
        user_id: new_user._id,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_verify_phone = async (req, res) => {
  try {
    const { user_id, verification_code } = req.body;

    if (!user_id || !verification_code) {
      return res.status(400).json({
        status: "error",
        message: "User ID and verification code are required.",
      });
    }

    const verification_record = await user_verification_model.findOne({
      user_id,
      verification_code,
    });

    if (!verification_record) {
      return res.status(400).json({
        status: "error",
        message: "Invalid verification code.",
      });
    }

    await user_model.findByIdAndUpdate(user_id, { phone_verified: true });
    await user_verification_model.deleteMany({ user_id });

    return res.status(200).json({
      status: "success",
      message: "Phone number verified successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_resend_otp = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required.",
      });
    }

    const user = await user_model.findById(user_id);

    if (!user || user.phone_verified) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user or phone number already verified.",
      });
    }

    const existing_verification = await user_verification_model.findOne({
      user_id,
    });

    if (
      existing_verification &&
      Date.now() - existing_verification.createdAt.getTime() < 60000
    ) {
      return res.status(400).json({
        status: "error",
        message: "Please wait before requesting a new OTP.",
      });
    }

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();

    if (existing_verification) {
      existing_verification.verification_code = OTP;
      existing_verification.createdAt = new Date();
      await existing_verification.save();
    } else {
      await user_verification_model.create({
        user_id,
        verification_code: OTP,
      });
    }

    await handle_send_sms(
      user.phone_number,
      `Your new verification code for Uddhar is: ${OTP}`,
    );

    return res.status(200).json({
      status: "success",
      message: "OTP resent successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_login_user = async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
      return res.status(400).json({
        status: "error",
        message: "Phone number and password are required.",
      });
    }

    const user = await user_model.findOne({
      phone_number,
      phone_verified: true,
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid phone number or phone number not verified.",
      });
    }

    const password_match = bcrypt.compareSync(password, user.password_hash);

    if (!password_match) {
      return res.status(400).json({
        status: "error",
        message: "Incorrect password.",
      });
    }

    const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      message: "Login successful.",
      data: {
        user_id: user._id,
        full_name: user.full_name,
        phone_number: user.phone_number,
        user_type: user.user_type,
        type_conversion_lock: user.type_conversion_lock,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_logout_user = async (req, res) => {
  try {
    res.clearCookie("token");

    return res.status(200).json({
      status: "success",
      message: "Logout successful.",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_verify_user_token = async (req, res) => {
  try {
    const { token } = req.cookies;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user_id = decoded.user_id;

    const user = await user_model.findById(user_id);

    if (!user) {
      res.clearCookie("token");
      return res.status(401).json({
        status: "error",
        message: "Invalid token.",
      });
    }

    const new_token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", new_token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      message: "Token is valid.",
      data: {
        user_id: user._id,
        full_name: user.full_name,
        phone_number: user.phone_number,
        user_type: user.user_type,
        type_conversion_lock: user.type_conversion_lock,
      },
    });
  } catch (err) {
    res.clearCookie("token");
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handle_get_user_type_change_applications = async (req, res) => {
  try {
    const { token } = req.cookies;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user_id = decoded.user_id;

    const user = await user_model.findById(user_id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    const ambulance_applications = await ambulance_driver_model.find({
      user_id: user._id,
      status: "pending",
    });

    return res.status(200).json({
      status: "success",
      data: ambulance_applications,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: err.message,
    });
  }
};
