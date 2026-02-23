import express from "express";
import {
  handle_login_user,
  handle_logout_user,
  handle_register_user,
  handle_resend_otp,
  handle_verify_phone,
  handle_verify_user_token,
} from "../controllers/user.controller.js";

const user_router = express.Router();

user_router.post("/register", handle_register_user);

user_router.post("/verify_phone", handle_verify_phone);

user_router.post("/resend_otp", handle_resend_otp);

user_router.post("/login", handle_login_user);

user_router.post("/logout", handle_logout_user);

user_router.post("/verify_user_token", handle_verify_user_token);

export default user_router;
