import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  redirect,
  UIMatch,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { getSupabaseServerClient } from "~/lib/supabase-server";
import { cn } from "~/lib/utils";
import type { Invoice } from "~/types/invoice";

export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs): Promise<{
  invoice: Extract<Invoice, { status: "COMPLETED" }>;
}> => {
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
  if (invoice.status !== "COMPLETED") {
    throw redirect("/invoices", { status: 302 });
  }

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
  const res = await fetch(`http://localhost:3000/invoice/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  if (res.status !== 200) {
    const err = await res.json();
    throw new Response(`${err.error}: ${err.message}`, {
      status: err.statusCode,
    });
  }
  return redirect("/");
};

export const handle = {
  breadcrumb: (match: UIMatch<{ invoice: Invoice }>) => (
    <Link to={match.pathname}>{match.data.invoice.description}</Link>
  ),
};

const schema = z.object({
  invoiceDate: z.coerce.date(),
  supplier: z.string().min(2).max(100),
  description: z.string().min(2).max(100),
  amountExclTax: z.coerce.number().min(0),
  amountTax: z.coerce.number().min(0),
  amountTotal: z.coerce.number().min(0),
});

export default function Invoice() {
  const { invoice } = useLoaderData<typeof loader>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const submit = useSubmit();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      invoiceDate: invoice.invoiceDate || new Date(),
      supplier: invoice.supplier || "",
      description: invoice.description || "",
      amountExclTax: invoice.amountExclTax || 0,
      amountTotal: invoice.amountTotal || 0,
      amountTax: invoice.amountTax || 0,
    },
  });

  const onReset = () => {
    form.reset(invoice);
  };

  const onSubmit = (values: z.infer<typeof schema>) => {
    submit(
      { ...values, invoiceDate: format(values.invoiceDate, "yyyy-MM-dd") },
      { method: "post" },
    );
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="supplier"
              render={({ field: { ref, ...field } }) => (
                <FormItem>
                  <FormLabel>Fournisseur</FormLabel>
                  <FormControl>
                    <Input placeholder="fournisseur" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field: { ref, ...field } }) => (
                <FormItem>
                  <FormLabel>Nature de la dépense</FormLabel>
                  <FormControl>
                    <Input placeholder="nature de la dépense" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invoiceDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de la facture</FormLabel>
                  <Popover
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
                  >
                    <PopoverTrigger
                      onClick={(e) => {
                        e.preventDefault();
                        setIsDatePickerOpen(!isDatePickerOpen);
                      }}
                    >
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            form.setValue("invoiceDate", date);
                          }
                          setIsDatePickerOpen(false);
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amountExclTax"
              render={({ field: { ref, ...field } }) => (
                <FormItem>
                  <FormLabel>Montant hors taxe</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="montant hors taxe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amountTax"
              render={({ field: { ref, ...field } }) => (
                <FormItem>
                  <FormLabel>Montant taxe</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="montant taxe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amountTotal"
              render={({ field: { ref, ...field } }) => (
                <FormItem>
                  <FormLabel>Montant total</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="montant total"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex self-end gap-2">
              <Button onClick={onReset} variant="secondary" type="reset">
                Reset
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
