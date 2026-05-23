import ambulance_driver_model from "../models/ambulance_driver.model.js";
import global_model from "../models/global.model.js";
import BaseController from "./base.controller.js";

class AdminController extends BaseController {
  constructor() {
    super();
    this.global_model = global_model;
    this.ambulance_driver_model = ambulance_driver_model;
  }

  async get_pending_driver_applications(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!user || user.user_type !== "admin")
        return this.send_error(res, 403, "Access denied.");

      const applications = await this.ambulance_driver_model.find({
        status: "pending",
      });
      return res.status(200).json({ status: "success", data: applications });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async get_all_driver_applications(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!user || user.user_type !== "admin")
        return this.send_error(res, 403, "Access denied.");

      const applications = await this.ambulance_driver_model.find().sort({
        createdAt: -1,
      });
      return res.status(200).json({ status: "success", data: applications });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async get_driver_application_details(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!user || user.user_type !== "admin")
        return this.send_error(res, 403, "Access denied.");

      const driver = await this.ambulance_driver_model.findById(
        req.params.driver_id,
      );
      if (!driver) return this.send_error(res, 404, "Driver not found.");

      return res.status(200).json({ status: "success", data: driver });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async approve_driver_application(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!user || user.user_type !== "admin")
        return this.send_error(res, 403, "Access denied.");

      const driver = await this.ambulance_driver_model.findByIdAndUpdate(
        req.params.driver_id,
        { status: "verified" },
        { new: true },
      );
      if (!driver) return this.send_error(res, 404, "Driver not found.");

      return res
        .status(200)
        .json({ status: "success", message: "Driver approved.", data: driver });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }

  async reject_driver_application(req, res) {
    try {
      const user = await this.get_authenticated_user(req);
      if (!user || user.user_type !== "admin")
        return this.send_error(res, 403, "Access denied.");

      const driver = await this.ambulance_driver_model.findByIdAndUpdate(
        req.params.driver_id,
        { status: "rejected" },
        { new: true },
      );
      if (!driver) return this.send_error(res, 404, "Driver not found.");

      user.type_conversion_lock = false;
      await user.save();

      return res.status(200).json({
        status: "success",
        message: "Driver application rejected.",
        data: driver,
      });
    } catch (err) {
      return this.send_error(res, 500, "Internal server error.", err.message);
    }
  }
}

export default new AdminController();
