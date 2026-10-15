import { Router } from "express";
import rfqController from "../controllers/rfq.controller";
import { passportAuth, authorization } from "../../../middleware";

const router = Router();

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : RFQ Routes (Personal & Admin Views)
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

// Create RFQ (Draft or Published) - Buyer & Admin
router.post(
  "/",
  passportAuth.authenticate,
  authorization.hasRole("buyer", "admin"),
  rfqController.create
);

// Global search across RFQs, Line Items, and Categories (for Search Bar)
router.get("/search", passportAuth.authenticate, rfqController.search);

// Navigation summary (badge counters, role stats, active category breakdown)
router.get(
  "/navigation/summary",
  passportAuth.authenticate,
  rfqController.navigationSummary
);

// List RFQs (Personal view by user ID, Admin view shows all, Request only)
router.get("/", passportAuth.authenticate, rfqController.list);

// Get RFQ details by ID
router.get("/:id", passportAuth.authenticate, rfqController.getById);

// Compare all quotations for an RFQ side by side - Buyer & Admin
router.get(
  "/:id/compare",
  passportAuth.authenticate,
  authorization.hasRole("buyer", "admin"),
  rfqController.compareQuotes
);

// Update RFQ (title, description, line items, categories, etc.) - Buyer & Admin
router.put(
  "/:id",
  passportAuth.authenticate,
  authorization.hasRole("buyer", "admin"),
  rfqController.update
);

// Publish RFQ - Buyer & Admin
router.patch(
  "/:id/publish",
  passportAuth.authenticate,
  authorization.hasRole("buyer", "admin"),
  rfqController.publish
);

// Delete or cancel RFQ - Buyer & Admin
router.delete(
  "/:id",
  passportAuth.authenticate,
  authorization.hasRole("buyer", "admin"),
  rfqController.delete
);

export default router;
