import express from "express";
import AdminController from "../controllers_class/admin.controller.js";

const admin_router = express.Router();

admin_router.get("/driver_applications/pending", (req, res) =>
  AdminController.get_pending_driver_applications(req, res),
);

admin_router.get("/driver_applications", (req, res) =>
  AdminController.get_all_driver_applications(req, res),
);

admin_router.get("/driver_applications/:driver_id", (req, res) =>
  AdminController.get_driver_application_details(req, res),
);

admin_router.post("/driver_applications/:driver_id/approve", (req, res) =>
  AdminController.approve_driver_application(req, res),
);

admin_router.post("/driver_applications/:driver_id/reject", (req, res) =>
  AdminController.reject_driver_application(req, res),
);

export default admin_router;