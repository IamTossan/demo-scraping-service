export type Invoice =
  | {
      id: string;
      status: "CREATED" | "STARTED" | "FAILED";
      filename: string;
      signedUrl: string;
      createdAt: string;

      invoiceDate: string | null;
      supplier: string | null;
      description: string | null;
      amountExclTax: number | null;
      amountTotal: number | null;
      amountTax: number | null;
    }
  | {
      id: string;
      status: "COMPLETED";
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
