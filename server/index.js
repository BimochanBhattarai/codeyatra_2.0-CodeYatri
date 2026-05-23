import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { admin_router } from "./admin/Admin.js";
import ambulance_driver_routes from "./routes/ambulance_driver.route.js";
import global_routes from "./routes/global.route.js";
import report_routes from "./routes/report.route.js";
import user_routes from "./routes/user.route.js";
import admin_routes from "./routes/admin.route.js";
import { connect_to_db } from "./utils/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.1.65:3000",
  "capacitor://localhost",
  "http://localhost",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(admin_router);

app.use(express.json({ limit: "1gb" }));

app.use(express.static("private"));

app.use(express.urlencoded({ limit: "1gb", extended: true }));

app.use(cookieParser());

app.use("/api/report", report_routes);

app.use("/api/user", user_routes);

app.use("/api/global", global_routes);

app.use("/api/ambulance_driver", ambulance_driver_routes);

app.use("/api/admin", admin_routes);

app.get("/api/status", (req, res) => {
  res.json({ servicesActive: true });
});

app.listen(PORT, "0.0.0.0", () => {
  connect_to_db();
  console.log(`Server is running on port ${PORT}`);
});