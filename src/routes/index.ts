// Import Config
import config from "../config/constant";

// Import Routes
import auth from "../app/auth/routes/auth.route";
import user from "../app/user/routes/user.route";
import userRole from "../app/user_role/routes/userRole.route";
import permission from "../app/user_permission/routes/userPermission.route";
import rfq from "../app/rfq/routes/rfq.route";
import category from "../app/category/routes/category.route";
import quotation from "../app/quotation/routes/quotation.route";
import files from "../app/files/routes/file.route";
import history from "../app/history/routes/history.route";
import notification from "../app/notification/routes/notification.route";
import rfqController from "../app/rfq/controllers/rfq.controller";
import { passportAuth } from "../middleware";

// Import Thirdparty
import express from "express";

import prisma from "../library/prisma.library";

const app = express.Router();

app.get("/v1/ping", async function (req, res, next) {
  res.status(200).json({
    status: "success",
    message: "Welcome to RFQ Backend",
    timestamp: new Date().toISOString(),
  });
});

app.get(["/health", "/v1/health"], async function (req, res, next) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
      environment: config.app.ENVIRONMENT || "development",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error.message,
    });
  }
});

const path = "/v1";

// Global Convenience Routes for Top Search Bar & Navigation Sidebar
app.get(path + "/search", passportAuth.authenticate, rfqController.search);
app.get(path + "/navigation/summary", passportAuth.authenticate, rfqController.navigationSummary);

app.use(path + "/auth", auth);
app.use(path + "/user", user);
app.use(path + "/role", userRole);
app.use(path + "/permission", permission);
app.use(path + "/rfq", rfq);
app.use(path + "/category", category);
app.use(path + "/quotation", quotation);
app.use(path + "/files", files);
app.use(path + "/history", history);
app.use(path + "/notification", notification);

export = app;
