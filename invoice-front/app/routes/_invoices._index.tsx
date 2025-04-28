import { LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
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
  { label: "status", key: "status" },
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
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);
  const [invoices, setInvoices] = useState(() =>
    loadedInvoices.reduce(
      (acc, cur) => {
        acc[cur.id] = cur;
        return acc;
      },
      {} as Record<string, Invoice>,
    ),
  );

  useEffect(() => {
    if (!supabase) return;

    const updateInvoices = (
      p:
        | RealtimePostgresInsertPayload<Invoice>
        | RealtimePostgresUpdatePayload<Invoice>,
    ) => {
      setInvoices((invoices) => ({
        ...invoices,
        [p.new.id]: p.new as Invoice,
      }));
    };
    supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "invoice" },
        updateInvoices,
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "invoice" },
        updateInvoices,
      )
      .subscribe();
  }, []);

  const filename = `export_factures_${new Date().toISOString()}.csv`;
  return (
    <div
      className="flex flex-col items-center justify-between w-full gap-2 px-4"
      style={{ height: "calc(100% - 144px)" }}
    >
      <Button className="self-end">
        <CSVLink
          data={selectedInvoices}
          headers={CSV_HEADERS}
          filename={filename}
          suppressHydrationWarning={true}
        >
          Exporter en fichier csv
        </CSVLink>
      </Button>
      <DataTable
        className="w-full mx-4 mb-2 h-full"
        style={{ height: "calc(100% - 44px)" }}
        columns={columns}
        data={Object.values(invoices)}
        onSelectionChange={setSelectedInvoices}
      />
    </div>
  );
}
