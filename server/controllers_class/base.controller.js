import jwt from "jsonwebtoken";
import user_model from "../models/user.model.js";

class BaseController {
  static PRIVILEGED_ROLES = ["admin", "police_officer"];

  constructor() {
    this.user_model = user_model;
    this.jwt_secret = process.env.JWT_SECRET;
  }

  send_error(res, status, message, error = null) {
    const payload = { status: "error", message };
    if (error) payload.error = error;
    return res.status(status).json(payload);
  }

  async get_authenticated_user(req) {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, this.jwt_secret);
    return await this.user_model.findById(decoded.user_id);
  }

  is_privileged(user) {
    return user && BaseController.PRIVILEGED_ROLES.includes(user.user_type);
  }

  push_timeline(report, action, performed_by = null) {
    report.timeline.push({ action, date: new Date(), performed_by });
  }
}

export default BaseController;