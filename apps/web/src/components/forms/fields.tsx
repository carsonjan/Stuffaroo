import { cn } from "@/lib/utils";

export const controlClass =
  "h-11 w-full min-w-0 rounded-field border border-input bg-paper-2 px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
  asText = false,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  /** Render the title as text when the control inside carries its own label (a drop zone). */
  asText?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {asText ? (
        <p id={`${htmlFor}-title`} className="text-sm font-medium">
          {label}
        </p>
      ) : (
        <label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(controlClass, "appearance-auto pr-2", className)}
      {...props}
    />
  );
}

export function MoneyInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      <input
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        className={cn(controlClass, "pl-7")}
        {...props}
      />
    </div>
  );
}
