import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, Link, UIMatch, useLoaderData } from "@remix-run/react";
import { Buffer } from "buffer";
import { useEffect, useState } from "react";
import Header from "~/components/Header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Invoice } from "~/types/invoice";

export const loader = async ({
  params,
}: LoaderFunctionArgs): Promise<{ invoice: Invoice }> => {
  const { id } = params;
  const getInvoiceRes = await fetch(`http://localhost:3000/invoice/${id}`);

  if (!getInvoiceRes.ok) throw new Response("Not Found", { status: 404 });

  const invoice = (await getInvoiceRes.json()) as Invoice;

  return { invoice };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const payload = await request.formData();
  // update invoice + redirect to home
  return json({ message: "ok" });
};

export const handle = {
  breadcrumb: (match: UIMatch<{ invoice: Invoice }>) => (
    <Link to={match.pathname}>{match.data.invoice.description}</Link>
  ),
};

export default function Invoice() {
  const { invoice } = useLoaderData<typeof loader>();
  const [file, setFile] = useState<string>();

  useEffect(() => {
    setFile(
      `data:application/pdf;base64,${Buffer.from(invoice.fileContent.data).toString("base64")}`,
    );
  }, [invoice]);

  return (
    <div className="flex h-screen flex-col items-center justify-start gap-4">
      <Header />
      <div className="flex h-full w-full justify-between gap-4 p-4">
        <div className="w-1/2">
          <object data={file} type="application/pdf" width="100%" height="100%">
            <p>PDF could not be loaded.</p>
          </object>
        </div>
        <div className="w-1/2">
          <Form method="patch">
            <Input
              type="text"
              name="description"
              placeholder={invoice.description}
            />

            <Button type="submit">Update</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
