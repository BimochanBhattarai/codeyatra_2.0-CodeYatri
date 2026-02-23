import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import AdminJS from "adminjs";
import { default as MongoDBSession } from "connect-mongodb-session";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import ambulance_driver_model from "../models/ambulance_driver.model.js";
import user_model from "../models/user.model.js";
import user_verification_model from "../models/user_verification.model.js";
import componentLoader from "./ComponentLoader.js";

dotenv.config();

const MongoStore = MongoDBSession(session);

const Router = express.Router();

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const startAdminPanel = async () => {
  const authenticate = async (email, password) => {
    try {
      const defaultAdminEmail = "admin@uddhar.com";
      const defaultAdminPassword = "admin123";

      if (email === defaultAdminEmail && password === defaultAdminPassword) {
        return Promise.resolve({
          email: defaultAdminEmail,
          password: defaultAdminPassword,
        });
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  const adminOptions = {
    resources: [ambulance_driver_model, user_verification_model, user_model],
    rootPath: "/admin",
    componentLoader,
  };

  const admin = new AdminJS(adminOptions);

  const sessionStore = new MongoStore({
    uri: process.env.MONGODB_URI,
    databaseName: process.env.MONGODB_DBNAME,
    collectionName: "session",
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: "adminjs",
      cookiePassword: "sessionsecret",
    },
    null,
    {
      store: sessionStore,
      resave: true,
      saveUninitialized: true,
      secret: "sessionsecret",
      cookie: {
        httpOnly: false,
        secure: false,
      },
      name: "adminjs",
    },
  );

  Router.use(admin.options.rootPath, adminRouter);
};

startAdminPanel();

export { Router as admin_router };
