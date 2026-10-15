// Import Config
import prisma from "../../../library/prisma.library";

export interface CreateFileInput {
  fileName: string;
  storageKey: string;
  mimeType: string;
  uploadedBy: number;
  rfqId?: number;
  quotationId?: number;
}

class FileRepo {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : List files by RFQ or Quotation
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getFiles(filters: { rfqId?: number; quotationId?: number; uploadedBy?: number }) {
    try {
      const where: any = {};
      if (filters.rfqId) where.rfqId = Number(filters.rfqId);
      if (filters.quotationId) where.quotationId = Number(filters.quotationId);
      if (filters.uploadedBy) where.uploadedBy = Number(filters.uploadedBy);

      return await prisma.file.findMany({
        where,
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

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get file by ID with relations
  👑: @created : 16/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getFileById(id: number) {
    try {
      return await prisma.file.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          rfq: {
            select: {
              id: true,
              createdById: true,
              title: true,
            },
          },
          quotation: {
            select: {
              id: true,
              vendorId: true,
              rfqId: true,
              quoteNo: true,
              rfq: {
                select: {
                  createdById: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Record file attachment metadata
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async createFile(data: CreateFileInput) {
    try {
      return await prisma.file.create({
        data: {
          fileName: data.fileName,
          storageKey: data.storageKey,
          mimeType: data.mimeType,
          uploadedBy: data.uploadedBy,
          rfqId: data.rfqId,
          quotationId: data.quotationId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Delete file metadata
  👑: @created : 16/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async deleteFile(id: number) {
    try {
      return await prisma.file.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new FileRepo();
