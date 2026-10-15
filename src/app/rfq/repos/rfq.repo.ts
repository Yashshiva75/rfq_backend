// Import Config
import config from "../../../config/constant";
import prisma from "../../../library/prisma.library";

// Import Thirdparty
import { RfqStatus } from "../../../generated/prisma/enums";

export interface CreateRfqLineItemInput {
  name: string;
  description?: string;
  quantity: number | string;
  unit: string;
  specifications?: string;
}

export interface CreateRfqRepoInput {
  title: string;
  description: string;
  location: string;
  currency?: string;
  optionalBudget?: number | string | null;
  totalPriceRfq?: number | string | null;
  deadline: Date | string;
  status?: RfqStatus;
  createdById: number;
  categoryNames?: string[];
  categoryIds?: number[];
  lineItems: CreateRfqLineItemInput[];
}

export interface UpdateRfqRepoInput {
  title?: string;
  description?: string;
  location?: string;
  currency?: string;
  optionalBudget?: number | string | null;
  totalPriceRfq?: number | string | null;
  deadline?: Date | string;
  status?: RfqStatus;
  categoryNames?: string[];
  categoryIds?: number[];
  lineItems?: CreateRfqLineItemInput[];
}

class RfqRepo {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Helper to resolve Category IDs from names and/or IDs
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  private async resolveCategoryIds(
    categoryNames?: string[],
    categoryIds?: number[]
  ): Promise<number[]> {
    try {
      const ids: number[] = [];

      if (categoryIds && Array.isArray(categoryIds)) {
        ids.push(...categoryIds.filter((id) => typeof id === "number" && !isNaN(id)));
      }

      if (categoryNames && Array.isArray(categoryNames)) {
        for (const rawName of categoryNames) {
          const name = typeof rawName === "string" ? rawName.trim() : "";
          if (!name) continue;

          const cat = await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
          });
          if (!ids.includes(cat.id)) {
            ids.push(cat.id);
          }
        }
      }

      return ids;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Create an RFQ with LineItems and Categories
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async createRfq(data: CreateRfqRepoInput) {
    try {
      const resolvedCategoryIds = await this.resolveCategoryIds(
        data.categoryNames,
        data.categoryIds
      );

      const deadlineDate = new Date(data.deadline);
      const budget = data.optionalBudget ? Number(data.optionalBudget) : null;
      const totalPrice = data.totalPriceRfq ? Number(data.totalPriceRfq) : budget;

      const rfq = await prisma.rFQ.create({
        data: {
          title: data.title.trim(),
          description: data.description.trim(),
          location: data.location.trim(),
          currency: (data.currency || "USD").toUpperCase().substring(0, 3),
          optionalBudget: budget,
          totalPriceRfq: totalPrice,
          deadline: deadlineDate,
          status: data.status || RfqStatus.DRAFT,
          createdById: data.createdById,
          lineItems: {
            create: (data.lineItems || []).map((item) => ({
              name: item.name.trim(),
              description: item.description?.trim() || null,
              quantity: Number(item.quantity) || 1,
              unit: item.unit?.trim() || "units",
              specifications: item.specifications?.trim() || null,
            })),
          },
          categories: {
            create: resolvedCategoryIds.map((catId) => ({
              categoryId: catId,
            })),
          },
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          lineItems: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Record audit history
      await prisma.history.create({
        data: {
          rfqId: rfq.id,
          updatedBy: data.createdById,
          action: rfq.status === RfqStatus.PUBLISHED ? "PUBLISHED" : "CREATED",
          details: {
            title: rfq.title,
            status: rfq.status,
            lineItemsCount: rfq.lineItems.length,
            optionalBudget: rfq.optionalBudget,
          },
        },
      });

      return rfq;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Find RFQ list (Personal for Buyers, Open/Published for Vendors, All for Admin)
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getRfqs(params: {
    userId?: number;
    isAdmin?: boolean;
    isVendor?: boolean;
    filterScope?: "my" | "all";
    status?: string;
    search?: string;
    category?: string;
    openOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    try {
      const page = Math.max(1, Number(params.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (params.isAdmin) {
        // Admin sees all RFQs across all buyers/users
        if (params.userId && params.filterScope === "my") {
          where.createdById = params.userId;
        }
      } else if (params.isVendor) {
        // Vendor view: All published RFQs from all buyers and admins are visible to all vendors
        where.status = RfqStatus.PUBLISHED;
      } else {
        // Buyer / standard personal view: strictly filtered by userId (createdById)
        if (params.userId) {
          where.createdById = params.userId;
        }
      }

      // Status filter (supports OPEN as alias for PUBLISHED)
      if (params.status && params.status !== "ALL") {
        const rawStatus = params.status.toUpperCase();
        const mappedStatus = rawStatus === "OPEN" ? RfqStatus.PUBLISHED : rawStatus;
        if (Object.values(RfqStatus).includes(mappedStatus as any)) {
          // If vendor, they view PUBLISHED RFQs across all buyers (never drafts of other users)
          if (!params.isVendor) {
            where.status = mappedStatus as RfqStatus;
          } else if (mappedStatus === RfqStatus.PUBLISHED) {
            where.status = RfqStatus.PUBLISHED;
          }
        }
      }

      // If openOnly is explicitly requested, filter deadline >= now as well
      if (params.openOnly) {
        where.status = RfqStatus.PUBLISHED;
        where.deadline = { gte: new Date() };
      }

      // Search query across title, description, location
      if (params.search && params.search.trim()) {
        const search = params.search.trim();
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ];
      }

      // Category filter
      if (params.category && params.category.trim()) {
        where.categories = {
          some: {
            category: {
              name: {
                equals: params.category.trim(),
                mode: "insensitive",
              },
            },
          },
        };
      }

      // Only query RFQ Requests (no quotations included)
      const [total, rfqs] = await Promise.all([
        prisma.rFQ.count({ where }),
        prisma.rFQ.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            lineItems: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        }),
      ]);

      return {
        rfqs,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Find single RFQ by ID with lineItems and categories
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getRfqById(id: number) {
    try {
      return await prisma.rFQ.findUnique({
        where: { id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          lineItems: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          history: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Update RFQ attributes, line items, and categories
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async updateRfq(id: number, data: UpdateRfqRepoInput, updatedByUserId: number) {
    try {
      const updatePayload: any = {};

      if (data.title !== undefined) updatePayload.title = data.title.trim();
      if (data.description !== undefined) updatePayload.description = data.description.trim();
      if (data.location !== undefined) updatePayload.location = data.location.trim();
      if (data.currency !== undefined)
        updatePayload.currency = data.currency.toUpperCase().substring(0, 3);
      if (data.optionalBudget !== undefined) {
        updatePayload.optionalBudget = data.optionalBudget ? Number(data.optionalBudget) : null;
      }
      if (data.totalPriceRfq !== undefined) {
        updatePayload.totalPriceRfq = data.totalPriceRfq ? Number(data.totalPriceRfq) : null;
      }
      if (data.deadline !== undefined) {
        updatePayload.deadline = new Date(data.deadline);
      }
      if (data.status !== undefined) {
        updatePayload.status = data.status;
      }

      return await prisma.$transaction(async (tx) => {
        // 1. Update basic fields
        await tx.rFQ.update({
          where: { id },
          data: updatePayload,
        });

        // 2. Update Categories if provided
        if (data.categoryNames || data.categoryIds) {
          const resolvedCategoryIds = await this.resolveCategoryIds(
            data.categoryNames,
            data.categoryIds
          );
          await tx.rFQCategory.deleteMany({
            where: { rfqId: id },
          });
          if (resolvedCategoryIds.length > 0) {
            await tx.rFQCategory.createMany({
              data: resolvedCategoryIds.map((catId) => ({
                rfqId: id,
                categoryId: catId,
              })),
            });
          }
        }

        // 3. Update Line Items if provided
        if (data.lineItems && Array.isArray(data.lineItems)) {
          await tx.rFQLineItem.deleteMany({
            where: { rfqId: id },
          });

          if (data.lineItems.length > 0) {
            await tx.rFQLineItem.createMany({
              data: data.lineItems.map((item) => ({
                rfqId: id,
                name: item.name.trim(),
                description: item.description?.trim() || null,
                quantity: Number(item.quantity) || 1,
                unit: item.unit?.trim() || "units",
                specifications: item.specifications?.trim() || null,
              })),
            });
          }
        }

        // 4. Record history
        await tx.history.create({
          data: {
            rfqId: id,
            updatedBy: updatedByUserId,
            action: "UPDATED",
            details: {
              updatedFields: Object.keys(updatePayload),
              hasUpdatedLineItems: !!data.lineItems,
              hasUpdatedCategories: !!(data.categoryNames || data.categoryIds),
            },
          },
        });

        // 5. Return updated entity (Request only)
        return await tx.rFQ.findUnique({
          where: { id },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            lineItems: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        });
      });
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Publish a draft RFQ
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async publishRfq(id: number, updatedByUserId: number) {
    try {
      const updated = await prisma.rFQ.update({
        where: { id },
        data: {
          status: RfqStatus.PUBLISHED,
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          lineItems: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      await prisma.history.create({
        data: {
          rfqId: id,
          updatedBy: updatedByUserId,
          action: "PUBLISHED",
          details: {
            title: updated.title,
            status: updated.status,
            publishedAt: new Date().toISOString(),
          },
        },
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Delete or Cancel RFQ
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async deleteRfq(id: number, updatedByUserId: number) {
    try {
      const rfq = await prisma.rFQ.findUnique({
        where: { id },
        include: { _count: { select: { quotations: true } } },
      });

      if (!rfq) return null;

      // If quotations already exist, close instead of hard deleting
      if (rfq._count.quotations > 0) {
        return await prisma.rFQ.update({
          where: { id },
          data: { status: RfqStatus.CLOSED },
        });
      }

      return await prisma.rFQ.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Compare all quotations for an RFQ side by side, sortable by price/delivery
  👑: @created : 16/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async compareRfqQuotes(
    rfqId: number,
    options?: { sortBy?: "totalPrice" | "deliveryTime" | "date"; sortOrder?: "asc" | "desc" }
  ) {
    try {
      const rfq = await prisma.rFQ.findUnique({
        where: { id: rfqId },
        include: {
          categories: { include: { category: true } },
          lineItems: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      if (!rfq) return null;

      const quotes = await prisma.quotation.findMany({
        where: { rfqId },
        include: {
          vendor: { select: { id: true, name: true, email: true } },
          lineItems: { include: { rfqLineItem: true } },
          revisions: { orderBy: { revisionNo: "desc" } },
        },
      });

      // Sort quotes according to requested options
      const sortBy = options?.sortBy || "totalPrice";
      const sortOrder = options?.sortOrder === "desc" ? "desc" : "asc";

      quotes.sort((a, b) => {
        if (sortBy === "totalPrice") {
          const priceA = Number(a.totalPriceQuote) || 0;
          const priceB = Number(b.totalPriceQuote) || 0;
          return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
        }

        if (sortBy === "deliveryTime") {
          const timeA = parseInt(a.deliveryTime || "99999", 10) || 99999;
          const timeB = parseInt(b.deliveryTime || "99999", 10) || 99999;
          return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
        }

        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });

      // Find lowest price and fastest delivery
      let lowestQuote: any = null;
      let fastestQuote: any = null;
      let awardedQuote: any = null;

      for (const q of quotes) {
        if (q.status === "ACCEPTED" as any) {
          awardedQuote = { id: q.id, quoteNo: q.quoteNo, vendor: q.vendor.name, price: q.totalPriceQuote };
        }
        if (!lowestQuote || Number(q.totalPriceQuote) < Number(lowestQuote.price)) {
          lowestQuote = { id: q.id, quoteNo: q.quoteNo, vendor: q.vendor.name, price: q.totalPriceQuote };
        }
        const days = parseInt(q.deliveryTime || "99999", 10);
        if (!isNaN(days) && (!fastestQuote || days < fastestQuote.days)) {
          fastestQuote = { id: q.id, quoteNo: q.quoteNo, vendor: q.vendor.name, deliveryTime: q.deliveryTime, days };
        }
      }

      // Matrix: line items with each vendor's unitPrice and lineTotal
      const lineItemsMatrix = rfq.lineItems.map((li) => {
        const vendorPrices: Record<number, { unitPrice: any; totalPrice: any; notes: any }> = {};
        for (const q of quotes) {
          const item = q.lineItems.find((qli) => qli.rfqLineItemId === li.id);
          if (item) {
            vendorPrices[q.vendorId] = {
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              notes: item.notes,
            };
          }
        }
        return {
          id: li.id,
          name: li.name,
          quantity: li.quantity,
          unit: li.unit,
          specifications: li.specifications,
          vendorPrices,
        };
      });

      return {
        rfq,
        metrics: {
          quotesCount: quotes.length,
          lowestPrice: lowestQuote,
          fastestDelivery: fastestQuote,
          awardedQuote,
        },
        quotations: quotes,
        lineItemsMatrix,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new RfqRepo();
