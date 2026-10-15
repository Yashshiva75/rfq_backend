import dotenv from "dotenv";
dotenv.config();

export default {
  app: {
    PORT: Number(process.env.PORT) || 5000,
    ENVIRONMENT: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL,
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5000",
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "default_jwt_secret",
    TOKEN_EXPIRE: process.env.TOKEN_EXPIRE || "24h",
    PER_PAGE: Number(process.env.PER_PAGE) || 10,
    TOKEN_TYPE: {
      access_token: "access_token",
      refresh_token: "refresh_token",
    },
  },
  cloudinary: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
    API_KEY: process.env.CLOUDINARY_API_KEY || "",
    API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  },
  system_roles: {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    BUYER: "buyer",
    VENDOR: "vendor",
    USER: "user",
  },
  status_type: {
    ACTIVE: "ACTIVE",
    DEACTIVE: "DEACTIVE",
  },
};
