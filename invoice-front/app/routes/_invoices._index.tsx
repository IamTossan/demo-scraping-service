import { LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { DataTable } from "~/components/InvoiceTable";
import { columns } from "~/components/InvoiceTable/columns";
import { Button } from "~/components/ui/button";
import { getSupabaseServerClient } from "~/lib/supabase-server";
import { useSupabase } from "~/supabase.context";
import { Invoice } from "~/types/invoice";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<Invoice[]> => {
  const { supabase } = getSupabaseServerClient(
    request.headers.get("Cookie") ?? "",
  );
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) {
    return [];
  }
  const res = await fetch("http://localhost:3000/invoice", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
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
  const [invoices, setInvoices] = useState(() => loadedInvoices);

  useEffect(() => {
    if (!supabase) return;

    supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "invoice" },
        (p) => {
          setInvoices((invoices) => [...invoices, { ...(p.new as Invoice) }]);
        },
      )
      .subscribe();
  }, []);

  const filename = `export_factures_${new Date().toISOString()}.csv`;
  return (
    <div className="flex flex-col items-center justify-between h-auto w-full gap-2 px-4">
      <Button className="self-end">
        <CSVLink
          data={invoices}
          headers={CSV_HEADERS}
          filename={filename}
          suppressHydrationWarning={true}
        >
          Exporter en fichier csv
        </CSVLink>
      </Button>
      <DataTable className="w-full mx-4" columns={columns} data={invoices} />
    </div>
  );
}
