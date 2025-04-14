import { type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";
import { DataTable } from "~/components/InvoiceTable";
import { columns } from "~/components/InvoiceTable/columns";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type Invoice = { filename: string; signedUrl: string };

export const loader = async (): Promise<Invoice[]> => {
  const res = await fetch("http://localhost:3000/invoice");
  return res.json();
};

export default function Index() {
  const invoices = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen flex-col items-center justify-start  gap-4">
      <Header />
      <div className="flex flex-col items-center justify-between h-auto w-full gap-16 px-4">
        <DataTable className="w-full mx-4" columns={columns} data={invoices} />
      </div>
    </div>
  );
}
