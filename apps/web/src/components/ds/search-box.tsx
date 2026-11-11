import { ArrowUp, MapPin, Search } from "lucide-react";

import { type Mode, spots } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * The Krea-style frosted search: a text field with two inline frosted pills
 * (course code, pickup spot) and a round orange submit. Submits to Browse.
 */
export function SearchBox({
  id,
  mode,
  className,
}: {
  id: string;
  mode: Mode;
  className?: string;
}) {
  return (
    <form
      action={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/marketplace/browse`}
      className={cn(
        "frost flex flex-col gap-3 rounded-tile p-3 shadow-float focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink",
        className,
      )}
    >
      <input type="hidden" name="mode" value={mode} />
      <div className="flex items-center gap-2 px-2 pt-1">
        <Search className="size-4 shrink-0 text-ink-2" aria-hidden />
        <label htmlFor={id} className="visually-hidden">
          Search items
        </label>
        <input
          id={id}
          name="q"
          placeholder="Lamp for my dorm, a tent for Saturday…"
          className="h-10 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="frost flex h-9 min-w-0 items-center gap-1.5 rounded-pill pr-1 pl-3.5">
          <span className="t-label shrink-0 text-ink-2 max-[400px]:sr-only">
            Course
          </span>
          <input
            name="course"
            placeholder="CPSC 110"
            className="t-label h-full w-[4.5rem] min-w-0 bg-transparent md:w-[5.5rem] text-ink outline-none placeholder:text-ink-3"
          />
        </label>
        <label className="frost relative flex h-9 min-w-0 items-center gap-1.5 rounded-pill pr-3.5 pl-3">
          <MapPin className="size-3.5 shrink-0 text-ink-2" aria-hidden />
          <span className="visually-hidden">Pickup spot</span>
          <select
            name="spot"
            defaultValue=""
            className="t-label h-full min-w-0 appearance-none bg-transparent pr-1 text-ink outline-none"
          >
            <option value="">Any spot</option>
            {spots.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          aria-label="Search"
          className="press ml-auto flex size-10 shrink-0 items-center justify-center rounded-full bg-roo text-ink transition-colors duration-200 hover:bg-roo-deep hover:text-white"
        >
          <ArrowUp className="size-5" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </form>
  );
}
