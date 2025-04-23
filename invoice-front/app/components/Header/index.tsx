import { useFetcher, useMatches } from "@remix-run/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { ProfileIcon, UploadIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { timeout } from "~/lib/utils";
import { useSupabase } from "~/supabase.context";

export default function Header() {
  const fetcher = useFetcher();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const matches = useMatches();
  const supabase = useSupabase();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fileInput = e.currentTarget.elements[0] as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    await timeout(750);
    setIsDialogOpen(false);

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      toast.error("Erreur lors de l'envoi de la facture");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("http://localhost:3000/invoice/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      toast.error("Erreur lors de l'envoi de la facture");
      return;
    }

    toast.success("Facture envoyée");
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <header className="w-screen flex flex-row justify-between gap-9 p-4">
        <Breadcrumb className="pl-4 flex items-center">
          <BreadcrumbList>
            {matches
              .filter((match) => match.handle && match.handle.breadcrumb)
              .flatMap((match, index) => [
                <BreadcrumbItem key={index} className="h-auto">
                  <BreadcrumbLink asChild className="text-3xl">
                    {match.handle.breadcrumb(match)}
                  </BreadcrumbLink>
                </BreadcrumbItem>,
                <BreadcrumbSeparator key={`${index}-sep`} />,
              ])
              .slice(0, -1)}
          </BreadcrumbList>
        </Breadcrumb>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem
              className={navigationMenuTriggerStyle({
                className: ["h-20", "w-42", "flex", "flex-col", "gap-1"],
              })}
              onClick={() => setIsDialogOpen(true)}
            >
              <UploadIcon />
              <div>Envoyer une facture</div>
            </NavigationMenuItem>
            <NavigationMenuItem
              className={navigationMenuTriggerStyle({
                className: ["h-20", "w-42", "flex", "flex-col", "gap-1"],
              })}
            >
              <ProfileIcon />
              <div>Profil</div>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer une facture</DialogTitle>
            <DialogDescription>
              Selectionnez votre facture ci-dessous pour l&apos;envoyer
            </DialogDescription>
          </DialogHeader>
          <fetcher.Form
            method="post"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
          >
            <Input id="file" name="file" type="file" />
            <DialogFooter className="mt-4">
              <Button type="submit">Envoyer</Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </header>
    </Dialog>
  );
}
