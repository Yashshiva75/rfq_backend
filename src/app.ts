import express, { NextFunction, Request, Response, Application } from "express";
import path from "path";
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
      .use("/assets", express.static(imageDir));
  }
}

export default new App().express;
