import { useNavigate } from "@remix-run/react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useSupabase } from "~/supabase.context";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

export const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export default function Login() {
  const supabase = useSupabase();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      console.error("login error", error);
      toast.error(error.message);
    } else {
      toast.success("Connection réussie");
      return navigate("/");
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col justify-between items-center h-96 w-xl p-8 border rounded-md"
        >
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold mb-4">Connection</h1>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-sm h-20">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="text-right"
                      type="text"
                      placeholder="user@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-sm h-20">
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="text-right"
                      type="password"
                      placeholder="password"
                    />
                  </FormControl>
                  <FormMessage className="relative" />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="self-end">
            Login
          </Button>
        </form>
      </Form>
    </div>
  );
}
