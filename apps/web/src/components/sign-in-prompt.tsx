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
        "flex flex-col items-center rounded-card bg-surface px-6 py-10 text-center",
        className,
      )}
    >
      <LogIn className="size-6 text-ink-2" strokeWidth={1.5} aria-hidden />
      <h2 className="t-h3 mt-3">{title}</h2>
      {status === "signed-out" ? (
        <>
          <p className="mt-1 max-w-sm text-[0.875rem] font-light text-ink-2">
            {description}
          </p>
          {/* Plain <a>: /auth/login is an Auth0 route handler, not a page. */}
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/auth/login?returnTo=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${returnTo}`)}`}
            className={cn(
              buttonVariants({ variant: "brand", size: "lg" }),
              "mt-5",
            )}
          >
            Sign in
          </a>
        </>
      ) : (
        <p className="mt-1 max-w-sm text-[0.875rem] font-light text-ink-2">
          Sign-in isn&apos;t configured for this deployment yet, so this
          isn&apos;t available.
        </p>
      )}
    </div>
  );
}
