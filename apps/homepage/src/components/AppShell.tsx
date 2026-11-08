import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Check, MessageCircle, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isLanding = useRouterState({
    select: (state) => state.location.pathname === "/",
  });
  const name = (user?.user_metadata?.["display_name"] ||
    user?.user_metadata?.["full_name"] ||
    user?.email ||
    "") as string;
  const initials = name
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  if (isLanding) return <>{children}</>;
  return (
    <div className="mx-auto max-w-5xl px-3 py-6 md:py-10">
      <div className="chunky min-h-[80vh] rounded-[2rem] bg-paper px-4 pb-16 pt-5 md:px-7">
        <header className="mb-6 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="font-display text-3xl font-extrabold tracking-tight"
          >
            Stuff<span className="text-brick">aroo</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/browse"
              className="hidden rounded-full px-3 py-1 text-sm font-bold hover:bg-muted sm:block"
            >
              Browse
            </Link>
            {user ? (
              <>
                <Link
                  to="/messages"
                  aria-label="Messages"
                  className="chunky-sm press rounded-full bg-card p-2"
                >
                  <MessageCircle className="size-4" />
                </Link>
                <span className="hidden items-center gap-1 rounded-full border-2 border-forest bg-mint px-3 py-1 text-xs font-bold text-forest sm:flex">
                  <Check className="size-3" />
                  UBC · Verified
                </span>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate({ to: "/" });
                  }}
                  title="Sign out"
                  className="chunky-sm flex size-10 items-center justify-center rounded-full bg-butter text-sm font-extrabold"
                >
                  {initials || "ME"}
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="chunky-sm press rounded-xl bg-primary px-4 py-1.5 text-sm font-bold"
              >
                Sign in
              </Link>
            )}
          </nav>
        </header>
        {children}
      </div>
      <Link
        to="/post"
        className="chunky press fixed bottom-6 right-6 z-40 flex items-center gap-1 rounded-2xl bg-primary px-5 py-3 font-display text-lg font-bold"
      >
        <Plus className="size-5" /> Post
      </Link>
    </div>
  );
}
