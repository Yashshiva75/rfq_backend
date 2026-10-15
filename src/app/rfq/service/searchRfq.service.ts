/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Global Search Service for Header Search Bar
👑: @created : 16/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

// Import Repos
import rfqRepo from "../repos/rfq.repo";

const searchRfq = async (container: any) => {
  try {
    const {
      input: { query, logged_in_user },
    } = container;

    const searchTerm = query?.q || query?.search || query?.query || "";
    const limit = query?.limit ? Number(query.limit) : 8;

    const results = await rfqRepo.searchGlobal(searchTerm, logged_in_user, limit);

    container.output.result = results;
  } catch (error) {
    throw error;
  }
};

export default searchRfq;
