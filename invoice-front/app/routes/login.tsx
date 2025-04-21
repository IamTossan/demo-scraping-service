import { Form, useNavigate } from "@remix-run/react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useSupabase } from "~/supabase.context";

export default function Login() {
  const supabase = useSupabase();
  const navigate = useNavigate();

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: e.target.elements.email.value,
      password: e.target.elements.password.value,
    });
    console.log("data", data);
    if (error) {
      console.error("login error", error);
      toast.error(error.message);
    } else {
      return navigate("/");
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <Form
        onSubmit={login}
        className="flex flex-col justify-between items-center h-80 p-8 border rounded-md"
      >
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold mb-4">Connection</h1>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              className="text-right"
              type="text"
              id="email"
              name="email"
              placeholder="user@example.com"
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              className="text-right"
              type="password"
              id="password"
              name="password"
              placeholder="password"
            />
          </div>
        </div>
        <Button type="submit" className="self-end">
          Login
        </Button>
      </Form>
    </div>
  );
}
