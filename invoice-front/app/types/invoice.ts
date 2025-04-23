export type Invoice = {
  id: string;
  filename: string;
  signedUrl: string;
  createdAt: string;

  invoiceDate: string;
  supplier: string;
  description: string;
  amountExclTax: number;
  amountTotal: number;
  amountTax: number;
};
