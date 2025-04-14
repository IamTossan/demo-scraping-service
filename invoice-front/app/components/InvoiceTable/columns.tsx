"use client";

import { Link } from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { Invoice } from "~/types/invoice";
import { Button } from "../ui/button";

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "fileName",
    header: "Nom du fichier",
  },
  {
    accessorKey: "createdAt",
    header: "Date de création",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return (
        <>
          {new Date(createdAt).toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
          })}
        </>
      );
    },
  },
  {
    accessorKey: "supplier",
    header: "Fournisseur",
  },
  {
    accessorKey: "invoiceDate",
    header: "Date de facturation",
    cell: ({ row }) => {
      const invoiceDate = row.original.invoiceDate;
      return (
        <>
          {new Date(invoiceDate).toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
          })}
        </>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Nature de la dépense",
  },
  {
    accessorKey: "amountExclTax",
    header: "Montant HT",
    cell: ({ row }) => {
      const amountExclTax = row.original.amountExclTax;
      return <>{amountExclTax.toFixed(2)} €</>;
    },
  },
  {
    accessorKey: "amountTax",
    header: "Montant TVA",
    cell: ({ row }) => {
      const amountTax = row.original.amountTax;
      return <>{amountTax.toFixed(2)} €</>;
    },
  },
  {
    accessorKey: "amountTotal",
    header: "Montant TTC",
    cell: ({ row }) => {
      const amountTotal = row.original.amountTotal;
      return <>{amountTotal.toFixed(2)} €</>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <>
          <Button asChild variant="secondary">
            <Link
              className="btn btn-primary btn-sm"
              to={`/invoices/${invoice.id}`}
            >
              Détails
            </Link>
          </Button>
        </>
      );
    },
  },
];
