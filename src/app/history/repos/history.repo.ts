// Import Config
import prisma from "../../../library/prisma.library";

class HistoryRepo {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get audit history trail
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getHistory(filters: { rfqId?: number; quotationId?: number; limit?: number }) {
    try {
      const where: any = {};
      if (filters.rfqId) where.rfqId = Number(filters.rfqId);
      if (filters.quotationId) where.quotationId = Number(filters.quotationId);

      return await prisma.history.findMany({
        where,
        take: filters.limit ? Math.min(100, Number(filters.limit)) : 50,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new HistoryRepo();
