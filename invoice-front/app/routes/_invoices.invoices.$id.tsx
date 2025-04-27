import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, redirect, UIMatch, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getSupabaseServerClient } from "~/lib/supabase-server";
import type { Invoice } from "~/types/invoice";

export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs): Promise<{ invoice: Invoice }> => {
  const { supabase } = getSupabaseServerClient(
    request.headers.get("Cookie") ?? "",
  );
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Response("Not Authorized", { status: 401 });
  }
  const { id } = params;
  const getInvoiceRes = await fetch(`http://localhost:3000/invoice/${id}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!getInvoiceRes.ok) throw new Response("Not Found", { status: 404 });

  const invoice = (await getInvoiceRes.json()) as Invoice;

  return { invoice };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { id } = params;
  const body = await request.formData();

  const { supabase } = getSupabaseServerClient(
    request.headers.get("Cookie") ?? "",
  );
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Response("Not Authorized", { status: 401 });
  }

  const payload = Object.fromEntries(body);
  Object.keys(payload).forEach((k) => {
    if (payload[k] === "") {
      delete payload[k];
    }
  });
  await fetch(`http://localhost:3000/invoice/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  return redirect("/");
};

export const handle = {
  breadcrumb: (match: UIMatch<{ invoice: Invoice }>) => (
    <Link to={match.pathname}>{match.data.invoice.description}</Link>
  ),
};

export default function Invoice() {
  const { invoice } = useLoaderData<typeof loader>();
  const formRef = useRef(null);

  const resetForm = () => {
    if (!formRef.current) {
      return;
    }
    formRef.current.elements.supplier.value = invoice.supplier;
    formRef.current.elements.description.value = invoice.description;
  };

  return (
    <div className="flex h-full w-full justify-around gap-4 p-4">
      <div className="w-2/3 max-w-5xl justify-start">
        <object
          data={invoice.signedUrl}
          type="application/pdf"
          width="100%"
          height="100%"
        >
          <p>PDF could not be loaded.</p>
        </object>
      </div>
      <div className="w-1/3 max-w-md">
        <Form
          className="flex flex-col items-center h-full gap-4 px-8 py-4 border"
          method="patch"
          ref={formRef}
        >
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="supplier">Fournisseur</Label>
            <Input
              className="text-right"
              type="text"
              id="supplier"
              name="supplier"
              value={invoice.supplier}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="description">Nature de la dépense</Label>
            <Input
              className="text-right"
              type="text"
              id="description"
              name="description"
              value={invoice.description}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="description">Date de la facture</Label>
            <Input
              className="text-right"
              type="date"
              id="invoiceDate"
              name="invoiceDate"
              value={invoice.invoiceDate}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="amountExclTax">Montant HT</Label>
            <Input
              className="text-right"
              type="number"
              id="amountExclTax"
              name="amountExclTax"
              value={invoice.amountExclTax}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="amountTax">Montant TVA</Label>
            <Input
              className="text-right"
              type="number"
              id="amountTax"
              name="amountTax"
              value={invoice.amountTax}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="amountTotal">Montant TTC</Label>
            <Input
              className="text-right"
              type="number"
              id="amountTotal"
              name="amountTotal"
              value={invoice.amountTotal}
            />
          </div>
          <div className="flex self-end gap-2">
            <Button onClick={resetForm} variant="secondary" type="reset">
              Reset
            </Button>
            <Button type="submit">Update</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
