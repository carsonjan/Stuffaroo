import { Check } from "lucide-react";
import Link from "next/link";

import { type BrowseFilters, browseHref, conditions } from "@/lib/browse";
import { modes, spots } from "@/lib/catalog";
import { categories } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * The filter rail's contents: mode, category, price, condition, pickup spot and
 * available date. Choices are links (single select, a second click clears);
 * price range and date are one small GET form that keeps the other filters.
 * Rendered in the desktop rail and in the mobile sheet, so ids take a prefix.
 */
export function FilterPanel({
  filters: f,
  idPrefix,
}: {
  filters: BrowseFilters;
  idPrefix: string;
}) {
  return (
    <div className="flex flex-col">
      <Group title="Mode">
        <Option href={browseHref(f, { mode: null })} active={f.mode === null}>
          Buy &amp; rent
        </Option>
        {modes.map((m) => (
          <Option
            key={m.key}
            href={browseHref(f, { mode: f.mode === m.key ? null : m.key })}
            active={f.mode === m.key}
          >
            {m.label}
          </Option>
        ))}
      </Group>

      <Group title="Category">
        {categories.map((c) => (
          <Option
            key={c.slug}
            href={browseHref(f, {
              category: f.category === c.slug ? null : c.slug,
            })}
            active={f.category === c.slug}
          >
            {c.name}
          </Option>
        ))}
      </Group>

      <Group title="Price">
        <Option
          href={browseHref(f, { free: !f.free, min: null, max: null })}
          active={f.free}
        >
          Free only
        </Option>
        <RangeForm filters={f} idPrefix={idPrefix} />
      </Group>

      {f.mode !== "request" && (
        <Group title="Condition">
          {conditions.map((c) => (
            <Option
              key={c}
              href={browseHref(f, { condition: f.condition === c ? null : c })}
              active={f.condition === c}
            >
              {c}
            </Option>
          ))}
        </Group>
      )}

      {f.mode !== "request" && (
        <Group title="Pickup spot">
          {spots.map((s) => (
            <Option
              key={s.slug}
              href={browseHref(f, { spot: f.spot === s.slug ? null : s.slug })}
              active={f.spot === s.slug}
            >
              {s.name}
            </Option>
          ))}
        </Group>
      )}

      <Group title={f.mode === "request" ? "Needed by" : "Available by"}>
        <DateForm filters={f} idPrefix={idPrefix} />
      </Group>
    </div>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <h3 className="t-label mb-3 text-ink">{title}</h3>
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </section>
  );
}

function Option({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        aria-current={active ? "true" : undefined}
        className={cn(
          "flex h-8 items-center justify-between gap-2 rounded-badge text-[0.875rem] transition-colors duration-200",
          active ? "text-ink" : "font-light text-ink-2 hover:text-ink",
        )}
      >
        {children}
        {active && <Check className="size-4" strokeWidth={1.75} aria-hidden />}
      </Link>
    </li>
  );
}

/** Hidden copies of every filter except `skip`, so a form submit keeps them. */
function Keep({
  filters: f,
  skip,
}: {
  filters: BrowseFilters;
  skip: string[];
}) {
  const params = new URL(browseHref(f), "http://x").searchParams;
  return (
    <>
      {[...params.entries()]
        .filter(([key]) => !skip.includes(key))
        .map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
    </>
  );
}

const field =
  "h-10 w-full min-w-0 rounded-pill bg-surface px-4 text-[0.875rem] text-ink outline-none placeholder:text-ink-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

function RangeForm({
  filters: f,
  idPrefix,
}: {
  filters: BrowseFilters;
  idPrefix: string;
}) {
  return (
    <li className="mt-2">
      <form
        action={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/marketplace/browse`}
        className="flex items-end gap-2"
      >
        <Keep filters={f} skip={["min", "max", "price"]} />
        <label
          htmlFor={`${idPrefix}-min`}
          className="flex flex-1 flex-col gap-1.5"
        >
          <span className="t-meta text-ink-2">Min $</span>
          <input
            id={`${idPrefix}-min`}
            name="min"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={f.min ?? ""}
            placeholder="0"
            className={field}
          />
        </label>
        <label
          htmlFor={`${idPrefix}-max`}
          className="flex flex-1 flex-col gap-1.5"
        >
          <span className="t-meta text-ink-2">Max $</span>
          <input
            id={`${idPrefix}-max`}
            name="max"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={f.max ?? ""}
            placeholder="Any"
            className={field}
          />
        </label>
        <button
          type="submit"
          className="t-label h-10 shrink-0 rounded-pill bg-ink px-4 text-white transition-colors duration-200 hover:bg-ink/85"
        >
          Go
        </button>
      </form>
    </li>
  );
}

function DateForm({
  filters: f,
  idPrefix,
}: {
  filters: BrowseFilters;
  idPrefix: string;
}) {
  return (
    <li>
      <form
        action={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/marketplace/browse`}
        className="flex items-end gap-2"
      >
        <Keep filters={f} skip={["date"]} />
        <label htmlFor={`${idPrefix}-date`} className="visually-hidden">
          Date
        </label>
        <input
          id={`${idPrefix}-date`}
          name="date"
          type="date"
          defaultValue={f.date ?? ""}
          className={field}
        />
        <button
          type="submit"
          className="t-label h-10 shrink-0 rounded-pill bg-ink px-4 text-white transition-colors duration-200 hover:bg-ink/85"
        >
          Go
        </button>
      </form>
    </li>
  );
}
