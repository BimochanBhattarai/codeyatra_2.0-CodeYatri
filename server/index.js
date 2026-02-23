import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { admin_router } from "./admin/Admin.js";
import ambulance_driver_routes from "./routes/ambulance_driver.route.js";
import report_routes from "./routes/report.route.js";
import user_routes from "./routes/user.route.js";
import { connect_to_db } from "./utils/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: "1gb" }));

app.use(express.static("uploads"));

app.use(express.urlencoded({ limit: "1gb", extended: true }));

app.use(admin_router);

app.use(cookieParser());

app.use("/api/report", report_routes);

app.use("/api/user", user_routes);

app.use("/api/ambulance_driver", ambulance_driver_routes);

app.get("/api/status", (req, res) => {
  res.json({ servicesActive: true });
});

app.listen(PORT, () => {
  connect_to_db();
  console.log(`Server is running on port ${PORT}`);
});
