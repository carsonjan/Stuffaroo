import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import roo from "@/assets/roo.png.asset.json";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Stuffaroo" },
      {
        name: "description",
        content: "Sign in to Stuffaroo to post items and message sellers.",
      },
      { property: "og:title", content: "Sign in — Stuffaroo" },
      {
        property: "og:description",
        content: "Sign in to Stuffaroo to post items and message sellers.",
      },
    ],
  }),
  component: AuthPage,
});

const field =
  "w-full rounded-xl border-2 border-ink bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring";

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    setBusy(true);
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: String(f.get("name")).trim() },
        },
      });
      setBusy(false);
      if (error) return void toast.error(error.message);
      if (!data.session)
        toast.success("Check your email to confirm your account!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setBusy(false);
      if (error) return void toast.error(error.message);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (r.error) toast.error(String(r.error.message ?? r.error));
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 text-center">
      <img src={roo.url} alt="" className="mx-auto h-32" />
      <h1 className="text-3xl font-extrabold">
        {mode === "in" ? "Welcome back, mate" : "Join the mob"}
      </h1>
      <button
        onClick={google}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#747775] bg-[#FFFFFF] px-3 py-2.5 text-sm font-medium text-[#1F1F1F]"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
          />
        </svg>
        Continue with Google
      </button>
      <div className="text-xs text-muted-foreground">or with email</div>
      <form onSubmit={submit} className="space-y-3 text-left">
        {mode === "up" && (
          <input
            name="name"
            required
            maxLength={60}
            placeholder="Your name"
            className={field}
          />
        )}
        <input
          name="email"
          type="email"
          required
          placeholder="you@student.ubc.ca"
          className={field}
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Password"
          className={field}
        />
        <button
          disabled={busy}
          className="chunky press w-full rounded-xl bg-primary py-2.5 font-bold disabled:opacity-50"
        >
          {mode === "in" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === "in" ? "up" : "in")}
        className="text-sm font-bold text-brick"
      >
        {mode === "in"
          ? "New here? Create an account"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
