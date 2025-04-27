import { z } from 'zod';

export const invoiceExtract = z.object({
  invoiceDate: z.string().transform((d) => {
    console.log(d);
    return new Date(d)?.toISOString().slice(0, 10);
  }),
  supplier: z.string(),
  description: z.string(),
  amountExclTax: z.number(),
  amountTotal: z.number(),
  amountTax: z.number(),
});
export type InvoiceExtract = z.infer<typeof invoiceExtract>;
