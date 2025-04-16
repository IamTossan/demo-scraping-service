import { type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import Header from "~/components/Header";
import { DataTable } from "~/components/InvoiceTable";
import { columns } from "~/components/InvoiceTable/columns";
import { Button } from "~/components/ui/button";
import { useSupabase } from "~/supabase.context";
import { Invoice } from "~/types/invoice";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async (): Promise<Invoice[]> => {
  const res = await fetch("http://localhost:3000/invoice");
  return res.json();
};

const CSV_HEADERS = [
  { label: "id", key: "id" },
  { label: "date_enregistrement", key: "createdAt" },
  { label: "nom_fichier", key: "fileName" },
  { label: "date_facture", key: "invoiceDate" },
  { label: "fournisseur", key: "supplier" },
  { label: "nature_dépense", key: "description" },
  { label: "prix_ht", key: "amountExclTax" },
  { label: "taxes", key: "amountTax" },
  { label: "prix_ttc", key: "amountTotal" },
];

export default function Index() {
  const loadedInvoices = useLoaderData<typeof loader>();
  const supabase = useSupabase();
  const [invoices, setInvoices] = useState(() =>
    loadedInvoices.map(({ fileContent, ...rest }) => ({
      ...rest,
    })),
  );

  useEffect(() => {
    if (!supabase) return;

    supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "invoice" },
        (p) => {
          const { fileContent, ...rest } = p.new as Invoice;
          setInvoices((invoices) => [...invoices, { ...rest }]);
        },
      )
      .subscribe();
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-start  gap-4">
      <Header />
      <div className="flex flex-col items-center justify-between h-auto w-full gap-2 px-4">
        <Button className="self-end">
          <CSVLink
            data={invoices}
            headers={CSV_HEADERS}
            filename={`export_factures_${new Date().toISOString()}`}
          >
            Exporter en fichier csv
          </CSVLink>
        </Button>
        <DataTable className="w-full mx-4" columns={columns} data={invoices} />
      </div>
    </div>
  );
}
