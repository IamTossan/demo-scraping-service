import { z } from 'zod';

export const invoiceExtract = z.object({
  invoiceDate: z.string(),
  supplier: z.string(),
  description: z.string(),
  amountExclTax: z.number(),
  amountTotal: z.number(),
  amountTax: z.number(),
});
export type InvoiceExtract = z.infer<typeof invoiceExtract>;
