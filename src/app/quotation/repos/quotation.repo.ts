// Import Config
import prisma from "../../../library/prisma.library";

// Import Thirdparty
import { QuotationStatus, RfqStatus } from "../../../generated/prisma/enums";

export interface CreateQuoteLineItemInput {
  rfqLineItemId: number;
  unitPrice: number | string;
  notes?: string;
}

export interface CreateQuotationInput {
  rfqId: number;
  vendorId: number;
  currency?: string;
  deliveryTime?: string;
  status?: QuotationStatus;
  lineItems: CreateQuoteLineItemInput[];
}

export interface ReviseQuotationInput {
  quotationId: number;
  vendorId: number;
  isAdmin?: boolean;
  currency?: string;
  deliveryTime?: string;
  lineItems?: CreateQuoteLineItemInput[];
}

class QuotationRepo {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Create Quotation with line items and revisions
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async createQuotation(data: CreateQuotationInput) {
    try {
      // 1. Verify RFQ exists and has line items
      const rfq = await prisma.rFQ.findUnique({
        where: { id: data.rfqId },
        include: { lineItems: true },
      });

      if (!rfq) {
        const err: any = new Error(`RFQ with ID ${data.rfqId} not found`);
        err.statusCode = 404;
        throw err;
      }

      if (rfq.status !== RfqStatus.PUBLISHED) {
        const err: any = new Error(
          `Quotations can only be submitted for PUBLISHED RFQs. Current status is ${rfq.status}`
        );
        err.statusCode = 400;
        throw err;
      }

      // Deadline check
      if (new Date(rfq.deadline).getTime() < Date.now()) {
        const err: any = new Error(
          `RFQ bidding deadline (${new Date(rfq.deadline).toISOString()}) has passed. Quotation submissions are closed.`
        );
        err.statusCode = 400;
        throw err;
      }

      // Check if vendor already has a quotation for this RFQ
      const existingQuote = await prisma.quotation.findUnique({
        where: {
          rfqId_vendorId: {
            rfqId: data.rfqId,
            vendorId: data.vendorId,
          },
        },
      });

      if (existingQuote) {
        const err: any = new Error(
          `A quotation already exists for this RFQ from your account (${existingQuote.quoteNo})`
        );
        err.statusCode = 409;
        throw err;
      }

      // 2. Compute itemized line item total prices
      const rfqLineItemsMap = new Map(rfq.lineItems.map((li) => [li.id, li]));
      let grandTotal = 0;

      const formattedQuoteLineItems = data.lineItems.map((item) => {
        const rfqItem = rfqLineItemsMap.get(item.rfqLineItemId);
        const unitPriceNum = Number(item.unitPrice) || 0;
        const quantityNum = rfqItem ? Number(rfqItem.quantity) : 1;
        const lineTotal = Number((unitPriceNum * quantityNum).toFixed(2));
        grandTotal += lineTotal;

        return {
          rfqLineItemId: item.rfqLineItemId,
          unitPrice: unitPriceNum,
          totalPrice: lineTotal,
          notes: item.notes?.trim() || null,
        };
      });

      const quoteStatus = data.status || QuotationStatus.SUBMITTED;
      const quoteNo = `QTE-${Date.now().toString().slice(-6)}-${data.rfqId}`;

      return await prisma.$transaction(async (tx) => {
        const quotation = await tx.quotation.create({
          data: {
            rfqId: data.rfqId,
            vendorId: data.vendorId,
            quoteNo,
            currency: (data.currency || rfq.currency || "USD").toUpperCase().substring(0, 3),
            deliveryTime: data.deliveryTime?.trim() || null,
            status: quoteStatus,
            totalPriceQuote: Number(grandTotal.toFixed(2)),
            lineItems: {
              create: formattedQuoteLineItems,
            },
            revisions: {
              create: {
                revisionNo: 1,
                totalPrice: Number(grandTotal.toFixed(2)),
                changedBy: data.vendorId,
                snapshot: {
                  quoteNo,
                  deliveryTime: data.deliveryTime,
                  lineItems: formattedQuoteLineItems,
                },
              },
            },
          },
          include: {
            rfq: {
              select: {
                id: true,
                title: true,
                currency: true,
                status: true,
              },
            },
            vendor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            lineItems: {
              include: {
                rfqLineItem: true,
              },
            },
            revisions: true,
          },
        });

        // Audit history
        await tx.history.create({
          data: {
            rfqId: data.rfqId,
            quotationId: quotation.id,
            updatedBy: data.vendorId,
            action: "QUOTE_SUBMITTED",
            details: {
              quoteNo: quotation.quoteNo,
              totalPriceQuote: quotation.totalPriceQuote,
              itemsCount: formattedQuoteLineItems.length,
            },
          },
        });

        return quotation;
      });
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get Quotations with role and status filtering
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getQuotations(params: {
    userId?: number;
    userRole?: string;
    rfqId?: number;
    status?: string;
  }) {
    try {
      const where: any = {};
      const role = (params.userRole || "").toLowerCase();

      if (params.rfqId) {
        where.rfqId = Number(params.rfqId);
      }

      if (role === "vendor" && params.userId) {
        where.vendorId = params.userId;
      } else if (role === "buyer" && params.userId) {
        where.rfq = { createdById: params.userId };
      }

      if (params.status && params.status !== "ALL") {
        const upperStatus = params.status.toUpperCase();
        if (Object.values(QuotationStatus).includes(upperStatus as any)) {
          where.status = upperStatus as QuotationStatus;
        }
      }

      return await prisma.quotation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          rfq: {
            select: {
              id: true,
              title: true,
              location: true,
              deadline: true,
              currency: true,
              status: true,
            },
          },
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lineItems: {
            include: {
              rfqLineItem: true,
            },
          },
          revisions: {
            orderBy: { revisionNo: "desc" },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get single Quotation by ID
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getQuotationById(id: number) {
    try {
      return await prisma.quotation.findUnique({
        where: { id },
        include: {
          rfq: {
            include: {
              lineItems: true,
              categories: { include: { category: true } },
              createdBy: { select: { id: true, name: true, email: true } },
            },
          },
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lineItems: {
            include: {
              rfqLineItem: true,
            },
          },
          revisions: {
            orderBy: { revisionNo: "desc" },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Update Quotation Status / Award Flow (PDF Flow: Accepted -> competing Rejected, RFQ Awarded)
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async updateQuotationStatus(
    id: number,
    status: QuotationStatus,
    updatedByUserId: number,
    isAdmin?: boolean
  ) {
    try {
      // 1. Verify quotation and RFQ exist
      const existingQuote = await prisma.quotation.findUnique({
        where: { id },
        include: {
          rfq: true,
          vendor: { select: { id: true, name: true, email: true } },
        },
      });

      if (!existingQuote) {
        const err: any = new Error(`Quotation with ID ${id} was not found`);
        err.statusCode = 404;
        throw err;
      }

      // 2. Permission check: Only RFQ creator (Buyer) or Admin can update quote status
      if (existingQuote.rfq.createdById !== updatedByUserId && !isAdmin) {
        const err: any = new Error(
          "Only the RFQ creator (buyer) or an administrator can update quotation status"
        );
        err.statusCode = 403;
        throw err;
      }

      // 3. Award flow (status === ACCEPTED)
      if (status === QuotationStatus.ACCEPTED) {
        if (existingQuote.rfq.status === RfqStatus.AWARDED) {
          const err: any = new Error(
            `This RFQ has already been awarded. You cannot award multiple quotations.`
          );
          err.statusCode = 400;
          throw err;
        }

        return await prisma.$transaction(async (tx) => {
          // A. Mark this winning quote as ACCEPTED
          const winningQuote = await tx.quotation.update({
            where: { id },
            data: { status: QuotationStatus.ACCEPTED },
            include: {
              rfq: true,
              vendor: { select: { id: true, name: true, email: true } },
              lineItems: true,
            },
          });

          // B. Automatically reject all other competing quotes for this RFQ
          await tx.quotation.updateMany({
            where: {
              rfqId: existingQuote.rfqId,
              id: { not: id },
            },
            data: {
              status: QuotationStatus.REJECTED,
            },
          });

          // C. Update RFQ status to AWARDED
          await tx.rFQ.update({
            where: { id: existingQuote.rfqId },
            data: { status: RfqStatus.AWARDED },
          });

          // D. Record History for winning quote
          await tx.history.create({
            data: {
              rfqId: existingQuote.rfqId,
              quotationId: winningQuote.id,
              updatedBy: updatedByUserId,
              action: "QUOTE_AWARDED",
              details: {
                status: QuotationStatus.ACCEPTED,
                quoteNo: winningQuote.quoteNo,
                totalPriceQuote: winningQuote.totalPriceQuote,
                vendorId: winningQuote.vendorId,
              },
            },
          });

          // E. Record History for competing rejected quotes
          await tx.history.create({
            data: {
              rfqId: existingQuote.rfqId,
              updatedBy: updatedByUserId,
              action: "COMPETING_QUOTES_REJECTED",
              details: {
                winningQuoteId: winningQuote.id,
                winningQuoteNo: winningQuote.quoteNo,
              },
            },
          });

          // F. Record History for RFQ Awarded
          await tx.history.create({
            data: {
              rfqId: existingQuote.rfqId,
              updatedBy: updatedByUserId,
              action: "RFQ_AWARDED",
              details: {
                status: RfqStatus.AWARDED,
                winningQuoteId: winningQuote.id,
                winningQuoteNo: winningQuote.quoteNo,
                winningVendorId: winningQuote.vendorId,
                totalAwardedPrice: winningQuote.totalPriceQuote,
              },
            },
          });

          return winningQuote;
        });
      }

      // 4. Non-award status transitions (e.g. SHORTLISTED, REJECTED)
      if (existingQuote.rfq.status === RfqStatus.AWARDED) {
        const err: any = new Error(
          "This RFQ is already AWARDED. Quotation statuses cannot be altered."
        );
        err.statusCode = 400;
        throw err;
      }

      return await prisma.$transaction(async (tx) => {
        const quote = await tx.quotation.update({
          where: { id },
          data: { status },
          include: {
            rfq: true,
            vendor: { select: { id: true, name: true, email: true } },
          },
        });

        await tx.history.create({
          data: {
            rfqId: quote.rfqId,
            quotationId: quote.id,
            updatedBy: updatedByUserId,
            action: `QUOTE_STATUS_${status}`,
            details: {
              status,
              quoteNo: quote.quoteNo,
            },
          },
        });

        return quote;
      });
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Revise an existing quotation with version tracking and deadline guard
  👑: @created : 16/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async reviseQuotation(data: ReviseQuotationInput) {
    try {
      // 1. Fetch quotation with current line items and RFQ
      const existingQuote = await prisma.quotation.findUnique({
        where: { id: data.quotationId },
        include: {
          rfq: {
            include: { lineItems: true },
          },
          lineItems: true,
          revisions: {
            orderBy: { revisionNo: "desc" },
            take: 1,
          },
        },
      });

      if (!existingQuote) {
        const err: any = new Error(`Quotation with ID ${data.quotationId} was not found`);
        err.statusCode = 404;
        throw err;
      }

      // 2. Authorization check: only quote owner (vendor) or Admin can revise
      if (existingQuote.vendorId !== data.vendorId && !data.isAdmin) {
        const err: any = new Error("You do not have permission to revise this quotation");
        err.statusCode = 403;
        throw err;
      }

      // 3. Status checks: terminal quotes cannot be revised
      if (existingQuote.status === QuotationStatus.ACCEPTED) {
        const err: any = new Error("Accepted/awarded quotations cannot be revised");
        err.statusCode = 400;
        throw err;
      }
      if (existingQuote.status === QuotationStatus.REJECTED) {
        const err: any = new Error("Rejected quotations cannot be revised");
        err.statusCode = 400;
        throw err;
      }

      // 4. RFQ status & deadline check
      const rfq = existingQuote.rfq;
      if (rfq.status !== RfqStatus.PUBLISHED) {
        const err: any = new Error(
          `Quotations can only be revised for PUBLISHED RFQs. Current RFQ status is ${rfq.status}`
        );
        err.statusCode = 400;
        throw err;
      }

      if (new Date(rfq.deadline).getTime() < Date.now()) {
        const err: any = new Error(
          `RFQ bidding deadline (${new Date(rfq.deadline).toISOString()}) has passed. Quotation revisions are closed.`
        );
        err.statusCode = 400;
        throw err;
      }

      // 5. Compute new pricing from line items
      const rfqLineItemsMap = new Map(rfq.lineItems.map((li) => [li.id, li]));
      
      let formattedQuoteLineItems: any[] = [];
      let grandTotal = 0;

      if (data.lineItems && data.lineItems.length > 0) {
        formattedQuoteLineItems = data.lineItems.map((item) => {
          const rfqItem = rfqLineItemsMap.get(item.rfqLineItemId);
          const unitPriceNum = Number(item.unitPrice) || 0;
          const quantityNum = rfqItem ? Number(rfqItem.quantity) : 1;
          const lineTotal = Number((unitPriceNum * quantityNum).toFixed(2));
          grandTotal += lineTotal;

          return {
            rfqLineItemId: item.rfqLineItemId,
            unitPrice: unitPriceNum,
            totalPrice: lineTotal,
            notes: item.notes?.trim() || null,
          };
        });
      } else {
        formattedQuoteLineItems = existingQuote.lineItems.map((item) => {
          grandTotal += Number(item.totalPrice) || 0;
          return {
            rfqLineItemId: item.rfqLineItemId,
            unitPrice: Number(item.unitPrice) || 0,
            totalPrice: Number(item.totalPrice) || 0,
            notes: item.notes || null,
          };
        });
      }

      const nextRevisionNo = (existingQuote.revisions[0]?.revisionNo || 1) + 1;
      const newCurrency = (data.currency || existingQuote.currency || "USD").toUpperCase().substring(0, 3);
      const newDeliveryTime = data.deliveryTime !== undefined ? data.deliveryTime?.trim() || null : existingQuote.deliveryTime;

      return await prisma.$transaction(async (tx) => {
        // Save snapshot of revision in QuotationRevision table
        await tx.quotationRevision.create({
          data: {
            quotationId: existingQuote.id,
            revisionNo: nextRevisionNo,
            totalPrice: Number(grandTotal.toFixed(2)),
            changedBy: data.vendorId,
            snapshot: {
              previousTotalPrice: existingQuote.totalPriceQuote,
              newTotalPrice: Number(grandTotal.toFixed(2)),
              previousDeliveryTime: existingQuote.deliveryTime,
              newDeliveryTime,
              currency: newCurrency,
              lineItems: formattedQuoteLineItems,
              revisedAt: new Date(),
            },
          },
        });

        // Recreate line items if updated
        if (data.lineItems && data.lineItems.length > 0) {
          await tx.quotationLineItem.deleteMany({
            where: { quotationId: existingQuote.id },
          });

          await tx.quotationLineItem.createMany({
            data: formattedQuoteLineItems.map((item) => ({
              quotationId: existingQuote.id,
              rfqLineItemId: item.rfqLineItemId,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              notes: item.notes,
            })),
          });
        }

        // Update main quotation
        const updatedQuotation = await tx.quotation.update({
          where: { id: existingQuote.id },
          data: {
            currency: newCurrency,
            deliveryTime: newDeliveryTime,
            totalPriceQuote: Number(grandTotal.toFixed(2)),
          },
          include: {
            lineItems: {
              include: {
                rfqLineItem: true,
              },
            },
            revisions: {
              orderBy: { revisionNo: "desc" },
            },
            rfq: {
              select: {
                id: true,
                title: true,
                deadline: true,
                status: true,
              },
            },
            vendor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Audit History
        await tx.history.create({
          data: {
            rfqId: existingQuote.rfqId,
            quotationId: existingQuote.id,
            updatedBy: data.vendorId,
            action: "QUOTE_REVISED",
            details: {
              quoteNo: existingQuote.quoteNo,
              revisionNo: nextRevisionNo,
              previousTotalPrice: existingQuote.totalPriceQuote,
              newTotalPrice: Number(grandTotal.toFixed(2)),
              revisedFields: [
                ...(data.lineItems ? ["lineItems", "totalPriceQuote"] : []),
                ...(data.deliveryTime ? ["deliveryTime"] : []),
                ...(data.currency ? ["currency"] : []),
              ],
            },
          },
        });

        return updatedQuotation;
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new QuotationRepo();
