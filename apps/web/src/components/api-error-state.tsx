import { CloudOff } from "lucide-react";

/** Shown in place of data when the Stuffaroo API call fails. */
export function ApiErrorState({ detail }: { detail: string }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-card border border-dashed px-6 py-16 text-center"
    >
      <CloudOff className="size-8 text-muted-foreground" aria-hidden />
      <h2 className="mt-4 text-lg font-medium">Couldn&apos;t load this</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {detail} If you&apos;re running locally, check that the API is up (
        <code>pnpm dev:api</code>).
      </p>
    </div>
  );
}
