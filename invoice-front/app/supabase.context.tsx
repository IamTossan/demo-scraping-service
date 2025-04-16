import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type ProviderProps = {
  supabase: SupabaseClient | undefined;
  children: ReactNode;
};

const context = createContext<SupabaseClient | undefined>(undefined);

export function useSupabase() {
  return useContext(context);
}

export function SupabaseProvider({ supabase, children }: ProviderProps) {
  return <context.Provider value={supabase}>{children}</context.Provider>;
}
