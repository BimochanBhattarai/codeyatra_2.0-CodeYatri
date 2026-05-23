import global_model from "../models/global.model.js";
import BaseController from "./base.controller.js";

class GlobalController extends BaseController {
  // ── Constructor ───────────────────────────────────────────────────────
  constructor() {
    super();
    this.global_model = global_model;
  }

  // ── Route handlers ────────────────────────────────────────────────────
  async get_settings(req, res) {
    try {
      const user = await this.get_authenticated_user(req);

      if (!this.is_privileged(user)) {
        return this.send_error(
          res,
          401,
          "Unauthorized. Only admin and police officers can access global settings.",
        );
      }

      let global_settings = await this.global_model.findOne();

      if (!global_settings) {
        await this.global_model.create({ police_mobile_alerts: [] });
        global_settings = await this.global_model.findOne();
      }

      return res.status(200).json({ status: "success", data: global_settings });
    } catch (error) {
      return this.send_error(res, 500, "Internal server error.", error.message);
    }
  }

  async update_settings(req, res) {
    try {
      const user = await this.get_authenticated_user(req);

      if (!this.is_privileged(user)) {
        return this.send_error(
          res,
          401,
          "Unauthorized. Only admin and police officers can update global settings.",
        );
      }

      const { police_mobile_alerts } = req.body;
      let global_settings = await this.global_model.findOne();

      if (!global_settings) {
        global_settings = await this.global_model.create({
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
      return this.send_error(res, 500, "Internal server error.", error.message);
    }
  }
}

export default new GlobalController();
