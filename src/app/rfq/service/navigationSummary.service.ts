/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Navigation Summary Service for Sidebar Badges & Filters
👑: @created : 16/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

// Import Repos
import rfqRepo from "../repos/rfq.repo";

const navigationSummary = async (container: any) => {
  try {
    const {
      input: { logged_in_user },
    } = container;

    const stats = await rfqRepo.getNavigationStats(logged_in_user);

    container.output.result = stats;
  } catch (error) {
    throw error;
  }
};

export default navigationSummary;
