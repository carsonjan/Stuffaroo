import { cn } from "@/lib/utils";

/** Section head: Inter 44/400, tight, with a quieter line under it. */
export function SectionHead({
  title,
  sub,
  className,
}: {
  title: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex max-w-[640px] flex-col", className)}>
      <h2 className="text-[2.25rem] leading-[1.05] text-ink sm:text-[3.25rem]">
        {title}
      </h2>
      {sub && <p className="mt-4 text-lg leading-[1.65] text-ink-3">{sub}</p>}
    </div>
  );
}
