export type Invoice = {
  id: string;
  filename: string;
  fileContent: Buffer;
  createdAt: string;

  invoiceDate: string;
  supplier: string;
  description: string;
  amountExclTax: number;
  amountTotal: number;
  amountTax: number;
};
