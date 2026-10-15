/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : User Role Routes
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
import { Router } from "express";
import userRoleController from "../controllers/userRole.controller";
import { passportAuth, authorization } from "../../../middleware";

const router = Router();

// List all roles (with permissions)
router.get("/", userRoleController.list);

// Update permissions for a role (Admin only)
router.put(
  "/:id/permissions",
  passportAuth.authenticate,
  authorization.hasRole("admin"),
  userRoleController.updatePermissions
);

export default router;
