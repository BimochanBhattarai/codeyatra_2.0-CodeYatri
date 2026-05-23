import express from "express";
import AuthController from "../controllers_class/auth.controller.js";
import AmbulanceController from "../controllers_class/ambulance.controller.js";

const user_router = express.Router();

user_router.post("/register", (req, res) => AuthController.register(req, res));

user_router.post("/verify_phone", (req, res) =>
  AuthController.verify_phone(req, res),
);

user_router.post("/resend_otp", (req, res) =>
  AuthController.resend_otp(req, res),
);

user_router.post("/login", (req, res) => AuthController.login(req, res));

user_router.post("/logout", (req, res) => AuthController.logout(req, res));

user_router.post("/verify_user_token", (req, res) =>
  AuthController.verify_token(req, res),
);

user_router.get("/user_type_change_applications", (req, res) =>
  AmbulanceController.get_user_type_change_applications(req, res),
);

export default user_router;
