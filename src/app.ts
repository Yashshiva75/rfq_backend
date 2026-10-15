import express, { NextFunction, Request, Response, Application } from "express";
import path from "path";
import fs from "fs";
import router from "./routes";
import config from "./config/constant";

class App {
  public express: Application;

  constructor() {
    this.express = express();
    this.defaults();
  }

  private async defaults(): Promise<void> {
    const imageDir = path.join(__dirname, "/../assets");
    const uploadsDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    this.express
      .use((req: Request, res: Response, next: NextFunction) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, OPTIONS, PUT, PATCH, DELETE"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Origin,X-Requested-With,content-type,Authorization,authentication-token"
        );
        next();
      })
      .use(express.urlencoded({ extended: false, limit: "150mb" }))
      .use(express.json({ limit: "150mb" }))
      .use(express.raw())
      .use(router)
      .use("/assets", express.static(imageDir))
      .use("/uploads", express.static(uploadsDir));
  }
}

export default new App().express;
