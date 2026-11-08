import { LogIn } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shown in place of something that needs an account. `unconfigured` means the
 * app has no Auth0 credentials, so nobody can sign in yet.
 */
export function SignInPrompt({
  status,
  returnTo,
  title,
  description,
  className,
}: {
  status: "unconfigured" | "signed-out";
  returnTo: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-card border border-dashed px-6 py-10 text-center",
        className,
      )}
    >
      <LogIn className="size-7 text-muted-foreground" aria-hidden />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      {status === "signed-out" ? (
        <>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
          {/* Plain <a>: /auth/login is an Auth0 route handler, not a page. */}
          <a
            href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
            className={cn(buttonVariants({ size: "lg" }), "mt-5 px-4")}
          >
            Sign in
          </a>
        </>
      ) : (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Sign-in isn&apos;t configured for this deployment yet, so this
          isn&apos;t available.
        </p>
      )}
    </div>
  );
}
