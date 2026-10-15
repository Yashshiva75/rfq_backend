import { Router } from "express";
import quotationController from "../controllers/quotation.controller";
import { passportAuth, authorization } from "../../../middleware";

const router = Router();

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: Quotation Routes for Vendors, Buyers & Admins
👑: Schema: backend/prisma/schema.prisma
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

// Create / Submit Quotation - Vendor & Admin
router.post(
  "/",
  passportAuth.authenticate,
  authorization.hasRole("vendor", "admin"),
  quotationController.create
);

// List quotations (Vendor sees theirs, Buyer sees received quotes for their RFQs, Admin sees all)
router.get("/", passportAuth.authenticate, quotationController.list);

// Get quotation details by ID
router.get("/:id", passportAuth.authenticate, quotationController.getById);

// Revise quotation (Prices, Delivery Time) before deadline - Vendor & Admin
router.put(
  "/:id",
  passportAuth.authenticate,
  authorization.hasRole("vendor", "admin"),
  quotationController.revise
);

// Update quotation status (Shortlist, Accept, Reject)
router.patch("/:id/status", passportAuth.authenticate, quotationController.updateStatus);

export default router;
