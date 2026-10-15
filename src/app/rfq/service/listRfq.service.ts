// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import rfqRepo from "../repos/rfq.repo";

// Import Helpers
import rfqHelper from "../helper/rfq.helper";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : List RFQ Service (Personal View for Buyers, Open RFQs for Vendors, All for Admin)
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const listRfq = async (container: any) => {
  try {
    const {
      input: { query, logged_in_user },
    } = container;

    const user = logged_in_user;
    if (!user || !user.id) {
      const err: any = new Error(
        i18n.__("auth.unauthorized") || "Authentication required to view RFQs"
      );
      err.statusCode = StatusCodes.UNAUTHORIZED;
      throw err;
    }

    // Role checks
    const isAdmin = rfqHelper.isAdmin(user);
    const isVendor = rfqHelper.isVendor(user);

    const { status, search, category, page, limit, filterScope, openOnly } = query || {};

    // Determine target user scoping:
    // - Admin: sees all RFQs (or filtered by query.userId if provided)
    // - Vendor: sees all published RFQs published by buyers and admins (never scoped to userId)
    // - Buyer / Other: personal view, sees only their created RFQs
    const filterUserId = (isAdmin || isVendor)
      ? (isAdmin && query?.userId ? Number(query.userId) : undefined)
      : user.id;

    // Fetch RFQs - returns Request only, no quotations
    const result = await rfqRepo.getRfqs({
      userId: filterUserId,
      isAdmin,
      isVendor,
      filterScope: filterScope as "my" | "all",
      status: status as string,
      search: search as string,
      category: category as string,
      openOnly: openOnly === "true" || openOnly === true,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    container.derived.isAdmin = isAdmin;
    container.derived.isVendor = isVendor;
    container.output.result = result.rfqs;
    container.output.meta = result.meta;
  } catch (error) {
    throw error;
  }
};

export default listRfq;
