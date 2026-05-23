import bcrypt from "bcrypt";
import user_verification_model from "../models/user_verification.model.js";
import { handle_send_sms } from "../utils/sms_sender.js";
import AuthService from "./auth.service.js";
import BaseController from "./base.controller.js";

class AuthController extends BaseController {
  static SALT_ROUNDS = 10;
  static OTP_RESEND_COOLDOWN_MS = 60_000;
  static APP_NAME = "Uddhar";

  constructor() {
    super();
    this.auth_service = AuthService;
    this.user_verification_model = user_verification_model;
  }

  static generate_otp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static hash_password(password) {
    return bcrypt.hashSync(password, AuthController.SALT_ROUNDS);
  }

  static verify_password(plain, hash) {
    return bcrypt.compareSync(plain, hash);
  }

  async register(req, res) {
    try {
      const { full_name, phone_number, password } = req.body;

      if (!full_name || !phone_number || !password) {
        return this.send_error(
          res,
          400,
          "Full name, phone number, and password are required.",
        );
      }

      const existing_user = await this.user_model.findOne({
        phone_number,
        phone_verified: true,
      });
      if (existing_user)
        return this.send_error(
          res,
          400,
          "Phone number is already registered and verified.",
        );

      await this.user_model.deleteMany({ phone_number, phone_verified: false });

      const new_user = await this.user_model.create({
        full_name,
        phone_number,
        password_hash: AuthController.hash_password(password),
      });

      const OTP = AuthController.generate_otp();
      await this.user_verification_model.create({
        user_id: new_user._id,
        verification_code: OTP,
      });
      await handle_send_sms(
        phone_number,
        `Use ${OTP} for: ${AuthController.APP_NAME}.`,
      );

      return res.status(201).json({
        status: "success",
        message:
          "User registered successfully. Please verify your phone number.",
        data: { user_id: new_user._id },
      });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async verify_phone(req, res) {
    try {
      const { user_id, verification_code } = req.body;
      if (!user_id || !verification_code)
        return this.send_error(
          res,
          400,
          "User ID and verification code are required.",
        );

      const record = await this.user_verification_model.findOne({
        user_id,
        verification_code,
      });
      if (!record)
        return this.send_error(res, 400, "Invalid verification code.");

      await this.user_model.findByIdAndUpdate(user_id, {
        phone_verified: true,
      });
      await this.user_verification_model.deleteMany({ user_id });

      return res
        .status(200)
        .json({
          status: "success",
          message: "Phone number verified successfully.",
        });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async resend_otp(req, res) {
    try {
      const { user_id } = req.body;
      if (!user_id) return this.send_error(res, 400, "User ID is required.");

      const user = await this.user_model.findById(user_id);
      if (!user || user.phone_verified)
        return this.send_error(
          res,
          400,
          "Invalid user or phone already verified.",
        );

      const existing = await this.user_verification_model.findOne({ user_id });
      if (
        existing &&
        Date.now() - existing.createdAt.getTime() <
          AuthController.OTP_RESEND_COOLDOWN_MS
      ) {
        return this.send_error(
          res,
          400,
          "Please wait before requesting a new OTP.",
        );
      }

      const OTP = AuthController.generate_otp();
      if (existing) {
        existing.verification_code = OTP;
        existing.createdAt = new Date();
        await existing.save();
      } else {
        await this.user_verification_model.create({
          user_id,
          verification_code: OTP,
        });
      }

      await handle_send_sms(
        user.phone_number,
        `Use ${OTP} for: ${AuthController.APP_NAME}.`,
      );
      return res
        .status(200)
        .json({ status: "success", message: "OTP resent successfully." });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async login(req, res) {
    try {
      const { phone_number, password } = req.body;
      if (!phone_number || !password)
        return this.send_error(
          res,
          400,
          "Phone number and password are required.",
        );

      const user = await this.user_model.findOne({
        phone_number,
        phone_verified: true,
      });
      if (!user)
        return this.send_error(
          res,
          400,
          "Invalid phone number or phone number not verified.",
        );
      if (!AuthController.verify_password(password, user.password_hash))
        return this.send_error(res, 400, "Incorrect password.");

      this.auth_service.set_token_cookie(res, user._id);

      return res.status(200).json({
        status: "success",
        message: "Login successful.",
        data: this.auth_service.format_user_public_data(user),
      });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async logout(req, res) {
    try {
      this.auth_service.clear_token_cookie(res);
      return res
        .status(200)
        .json({ status: "success", message: "Logout successful." });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async verify_token(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!user) {
        this.auth_service.clear_token_cookie(res);
        return this.send_error(res, 401, "Invalid token.");
      }

      this.auth_service.set_token_cookie(res, user._id);
      return res.status(200).json({
        status: "success",
        message: "Token is valid.",
        data: AuthService.format_user_public_data(user),
      });
    } catch (err) {
      this.auth_service.clear_token_cookie(res);
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }
}

export default new AuthController();
