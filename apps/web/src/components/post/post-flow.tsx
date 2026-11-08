"use client";

import {
  ArrowLeft,
  Check,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { RooStickerStatic } from "@/components/ds/roo-sticker-static";
import { Sticker } from "@/components/ds/sticker";
import {
  type CreateListingState,
  createListingAction,
} from "@/components/listings/actions";
import { buttonVariants } from "@/components/ui/button";
import { spots } from "@/lib/catalog";
import {
  type CategorySlug,
  type Condition,
  categories,
} from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import { cropToPortrait } from "./crop";

const MAX_PHOTOS = 8;
const conditions: Condition[] = ["New", "Like new", "Good", "Fair"];
const windows = ["Mornings", "12–2PM", "3–6PM", "Evenings"] as const;
const steps = ["Photos", "Details", "Price", "Pickup"] as const;

type Draft = {
  photos: string[];
  title: string;
  category: CategorySlug | "";
  condition: Condition | "";
  description: string;
  mode: "sell" | "rent";
  price: string;
  free: boolean;
  deposit: string;
  spot: string;
  from: string;
  window: (typeof windows)[number] | "";
};

/** Canned stand-in for the Gemini listing assistant (mockup). */
const aiSample: Partial<Draft> = {
  title: "Nintendo Switch OLED with 2 Joy-Cons",
  description:
    "Switch OLED in great shape with dock, two Joy-Cons, charger and a protective case. Perfect for a games night or a long weekend. Games not included.",
  category: "electronics",
  condition: "Like new",
};

const field =
  "w-full min-w-0 rounded-pill bg-surface px-5 text-[1rem] text-ink outline-none placeholder:text-ink-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/**
 * Posting an item in four steps inside one centred card: photos (1–8, cropped
 * to 4:5) → details → mode and price → pickup spot and availability → review.
 * Rentals publish through the API; sale listings aren't in the API yet, so
 * they end on a demo success screen.
 */
export function PostFlow({
  signedIn,
  signInHref,
  today,
}: {
  signedIn: boolean;
  signInHref: string | null;
  today: string;
}) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({
    photos: [],
    title: "",
    category: "",
    condition: "",
    description: "",
    mode: "rent",
    price: "",
    free: false,
    deposit: "",
    spot: "",
    from: today,
    window: "",
  });
  const [demoPosted, setDemoPosted] = useState(false);
  const [state, formAction, isPending] = useActionState<
    CreateListingState,
    FormData
  >(createListingAction, { status: "idle" });
  const headingRef = useRef<HTMLHeadingElement>(null);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  // Move focus to the step heading when the step changes (not on first render)
  const first = useRef(true);
  useEffect(() => {
    // Runs on every step change; `step` is read so the dependency is explicit.
    if (step < 0) return;
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const problem = (s: number): string | null => {
    if (s === 0 && draft.photos.length === 0) return "Add at least one photo.";
    if (s === 1) {
      if (draft.title.trim().length < 3)
        return "Give it a title of 3 or more characters.";
      if (!draft.category) return "Pick a category.";
      if (!draft.condition) return "Pick a condition.";
      if (!draft.description.trim()) return "Add a short description.";
    }
    if (s === 2) {
      const price = Number(draft.price);
      if (
        draft.mode === "sell" &&
        !(Number.isInteger(price) && price >= 0 && price <= 10_000)
      )
        return "Set a price in whole dollars (0 for free).";
      if (
        draft.mode === "rent" &&
        !draft.free &&
        !(Number.isInteger(price) && price >= 1 && price <= 1000)
      )
        return "Set a daily rate between $1 and $1,000, or lend it for free.";
      if (
        draft.deposit &&
        !(Number.isInteger(Number(draft.deposit)) && Number(draft.deposit) >= 0)
      )
        return "The deposit must be whole dollars.";
    }
    if (s === 3) {
      if (!draft.spot) return "Pick a pickup spot.";
      if (!draft.from) return "Pick the first day it's available.";
      if (!draft.window) return "Pick a pickup time.";
    }
    return null;
  };

  const next = () => {
    const p = problem(step);
    setError(p);
    if (!p) setStep((s) => s + 1);
  };

  const publish = () => {
    if (draft.mode === "sell") {
      setDemoPosted(true);
      return;
    }
    const fd = new FormData();
    fd.set("title", draft.title.trim());
    fd.set(
      "description",
      `${draft.description.trim()}\n\nPickup: ${draft.spot}, from ${formatDate(draft.from)}, ${draft.window}.`,
    );
    fd.set("category", draft.category);
    fd.set("condition", draft.condition);
    fd.set("pricing", draft.free ? "free" : "paid");
    fd.set("pricePerDay", draft.price);
    fd.set("deposit", draft.deposit);
    fd.set("location", draft.spot);
    startTransition(() => formAction(fd));
  };

  if (demoPosted) return <Posted draft={draft} />;

  const review = step === steps.length;

  return (
    <div className="mx-auto w-full max-w-[680px]">
      {!signedIn && signInHref && (
        <p className="mb-6 rounded-card bg-surface px-5 py-4 text-center text-[0.875rem] font-light text-ink-2">
          Rentals publish to your account.{" "}
          <a
            href={signInHref}
            className="text-ink underline underline-offset-4"
          >
            Sign in first
          </a>{" "}
          so your draft isn&apos;t lost.
        </p>
      )}
      {/* Progress: frosted pills */}
      <ol className="flex flex-wrap justify-center gap-2" aria-label="Steps">
        {steps.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={i > step}
                onClick={() => {
                  setError(null);
                  setStep(i);
                }}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "t-label flex h-9 items-center gap-1.5 rounded-pill px-3.5 transition-colors duration-200 disabled:cursor-default",
                  current ? "bg-ink text-white" : "frost",
                  done && "text-ink",
                  !current && !done && "text-ink-3",
                )}
              >
                {done ? (
                  <Check className="size-3.5" strokeWidth={2} aria-hidden />
                ) : (
                  <span className="num" aria-hidden>
                    {i + 1}
                  </span>
                )}
                {label}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-tile border border-line bg-white p-5 md:p-10">
        <h2 ref={headingRef} tabIndex={-1} className="t-h2 outline-none">
          {review
            ? "Check and publish"
            : ["Add photos", "Describe it", "Set the price", "Pickup"][step]}
        </h2>

        <div className="mt-6 md:mt-8">
          {step === 0 && (
            <PhotosStep
              photos={draft.photos}
              onChange={(photos) => update("photos", photos)}
            />
          )}
          {step === 1 && <DetailsStep draft={draft} update={update} />}
          {step === 2 && <PriceStep draft={draft} update={update} />}
          {step === 3 && (
            <PickupStep draft={draft} update={update} today={today} />
          )}
          {review && <Review draft={draft} />}
        </div>

        {(error || state.status === "error") && (
          <p role="alert" className="mt-6 text-[0.875rem] text-deal">
            {error ?? (state.status === "error" ? state.message : null)}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep((s) => s - 1);
              }}
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "px-4",
              )}
            >
              <ArrowLeft className="size-4" aria-hidden /> Back
            </button>
          ) : (
            <span />
          )}
          {!review ? (
            <button
              type="button"
              onClick={next}
              className={buttonVariants({ size: "lg" })}
            >
              {step === steps.length - 1 ? "Review" : "Next"}
            </button>
          ) : draft.mode === "rent" && !signedIn ? (
            signInHref ? (
              <a
                href={signInHref}
                className={buttonVariants({ variant: "brand", size: "lg" })}
              >
                Sign in to publish
              </a>
            ) : (
              <span className="t-meta max-w-[24ch] text-right text-ink-2">
                Sign-in is off in this demo, so rentals can&apos;t be published
              </span>
            )
          ) : (
            <button
              type="button"
              onClick={publish}
              disabled={isPending}
              aria-busy={isPending || undefined}
              className={buttonVariants({ variant: "brand", size: "lg" })}
            >
              {isPending && (
                <LoaderCircle
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden
                />
              )}
              {isPending ? "Publishing…" : "Post item"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PhotosStep({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_PHOTOS - photos.length;
    const picked = [...files]
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, room);
    setNote(
      files.length > room
        ? `Only ${MAX_PHOTOS} photos fit; the rest were left out.`
        : null,
    );
    setBusy(true);
    try {
      const cropped = await Promise.all(picked.map(cropToPortrait));
      onChange([...photos, ...cropped]);
    } catch {
      setNote("One of those photos couldn't be read. Try a JPEG or PNG.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="t-body text-ink-2">
        1 to 8 photos. Each is cropped to 4:5 so it fills the tile. The first
        one is the cover.
      </p>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {photos.map((src, i) => (
          <li key={src} className="relative">
            {/* biome-ignore lint/performance/noImgElement: local object URLs */}
            <img
              src={src}
              alt={`${i === 0 ? "Cover" : `Upload ${i + 1}`}`}
              className="aspect-[4/5] w-full rounded-img bg-surface object-cover"
            />
            {i === 0 ? (
              <span className="frost t-label absolute bottom-2 left-2 rounded-pill px-2 py-1 text-ink">
                Cover
              </span>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onChange([src, ...photos.filter((p) => p !== src)])
                }
                className="frost t-label absolute bottom-2 left-2 rounded-pill px-2 py-1 text-ink"
              >
                Make cover
              </button>
            )}
            <button
              type="button"
              aria-label={`Remove photo ${i + 1}`}
              onClick={() => {
                URL.revokeObjectURL(src);
                onChange(photos.filter((p) => p !== src));
              }}
              className="frost absolute top-2 right-2 flex size-7 items-center justify-center rounded-full text-ink"
            >
              <X className="size-3.5" strokeWidth={2} aria-hidden />
            </button>
          </li>
        ))}
        {photos.length < MAX_PHOTOS && (
          <li>
            <label
              htmlFor={inputId}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void add(e.dataTransfer.files);
              }}
              className="flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-img border border-dashed border-ink/25 bg-surface text-ink-2 transition-colors duration-200 hover:bg-surface-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink"
            >
              {busy ? (
                <LoaderCircle
                  className="size-5 animate-spin motion-reduce:animate-none"
                  aria-hidden
                />
              ) : (
                <ImagePlus className="size-5" strokeWidth={1.5} aria-hidden />
              )}
              <span className="t-label">
                {photos.length ? "Add more" : "Add photos"}
              </span>
              <span className="t-meta text-ink-3">
                {photos.length}/{MAX_PHOTOS}
              </span>
              <input
                id={inputId}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  void add(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </li>
        )}
      </ul>
      {note && <p className="text-[0.8125rem] text-ink-2">{note}</p>}
    </div>
  );
}

type StepProps = {
  draft: Draft;
  update: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
};

function Label({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="t-label mb-2.5 block text-ink">
      {children}
    </label>
  );
}

function Pills<T extends string>({
  legend,
  options,
  value,
  onChange,
  name,
}: {
  legend: string;
  options: readonly T[];
  value: T | "";
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <fieldset>
      <legend className="t-label mb-2.5 text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o}
            className={cn(
              "t-label flex h-10 cursor-pointer items-center rounded-pill px-4 transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
              value === o
                ? "bg-ink text-white"
                : "bg-surface text-ink hover:bg-surface-2",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o}
              checked={value === o}
              onChange={() => onChange(o)}
              className="sr-only"
            />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function DetailsStep({ draft, update }: StepProps) {
  const [ai, setAi] = useState("");
  const [drafting, setDrafting] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card bg-surface p-4">
        <label
          htmlFor="ai"
          className="t-label flex items-center gap-1.5 text-ink"
        >
          <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden /> Draft
          it for me
          <span className="t-meta ml-1 text-ink-3">Mockup</span>
        </label>
        <div className="mt-3 flex gap-2">
          <input
            id="ai"
            value={ai}
            onChange={(e) => setAi(e.target.value)}
            placeholder="my switch oled, 2 controllers, has a case"
            className={cn(field, "h-11 bg-white")}
          />
          <button
            type="button"
            disabled={drafting || !ai.trim()}
            onClick={() => {
              setDrafting(true);
              setTimeout(() => {
                for (const [k, v] of Object.entries(aiSample))
                  update(k as keyof Draft, v as never);
                setDrafting(false);
              }, 700);
            }}
            className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
          >
            {drafting ? "Drafting…" : "Draft"}
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <input
          id="title"
          value={draft.title}
          maxLength={120}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Desk lamp, warm LED"
          className={cn(field, "h-12")}
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={draft.category}
          onChange={(e) => update("category", e.target.value as CategorySlug)}
          className={cn(field, "h-12 appearance-none")}
        >
          <option value="" disabled>
            Choose a category
          </option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <Pills
        legend="Condition"
        name="condition"
        options={conditions}
        value={draft.condition}
        onChange={(v) => update("condition", v)}
      />
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={draft.description}
          maxLength={2000}
          rows={5}
          onChange={(e) => update("description", e.target.value)}
          placeholder="What's included, any quirks, how you'd like it back."
          className={cn(field, "rounded-card px-5 py-4 leading-relaxed")}
        />
      </div>
    </div>
  );
}

function PriceStep({ draft, update }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="t-label mb-2.5 text-ink">I want to</legend>
        <div className="inline-flex rounded-pill bg-surface p-1">
          {(
            [
              ["rent", "Rent it out"],
              ["sell", "Sell it"],
            ] as const
          ).map(([m, label]) => (
            <label
              key={m}
              className={cn(
                "t-label flex h-10 cursor-pointer items-center rounded-pill px-5 transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                draft.mode === m
                  ? "bg-roo text-ink"
                  : "text-ink hover:bg-surface-2",
              )}
            >
              <input
                type="radio"
                name="mode"
                value={m}
                checked={draft.mode === m}
                onChange={() => update("mode", m)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {draft.mode === "sell" ? (
        <div>
          <Label htmlFor="price">Price</Label>
          <Money
            id="price"
            value={draft.price}
            onChange={(v) => update("price", v)}
          />
          <p className="mt-2 text-[0.8125rem] font-light text-ink-2">
            Enter 0 to give it away. Sale listings are a demo for now and
            aren&apos;t published.
          </p>
        </div>
      ) : (
        <>
          <label className="flex cursor-pointer items-center gap-3 text-[0.9375rem]">
            <input
              type="checkbox"
              checked={draft.free}
              onChange={(e) => update("free", e.target.checked)}
              className="size-4 accent-ink"
            />
            Lend it for free
          </label>
          {!draft.free && (
            <div>
              <Label htmlFor="price">Daily rate</Label>
              <Money
                id="price"
                value={draft.price}
                unit="/day"
                onChange={(v) => update("price", v)}
              />
            </div>
          )}
          <div>
            <Label htmlFor="deposit">Deposit (optional)</Label>
            <Money
              id="deposit"
              value={draft.deposit}
              onChange={(v) => update("deposit", v)}
            />
            <p className="mt-2 text-[0.8125rem] font-light text-ink-2">
              Held at pickup and returned when the item comes back.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Money({
  id,
  value,
  unit,
  onChange,
}: {
  id: string;
  value: string;
  unit?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative max-w-[240px]">
      <span className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-ink-2">
        $
      </span>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(field, "num h-12 pl-9", unit && "pr-14")}
      />
      {unit && (
        <span className="t-unit pointer-events-none absolute top-1/2 right-5 -translate-y-1/2">
          {unit}
        </span>
      )}
    </div>
  );
}

function PickupStep({ draft, update, today }: StepProps & { today: string }) {
  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="t-label mb-2.5 text-ink">Pickup spot</legend>
        <div className="grid grid-cols-2 gap-2">
          {spots.map((s) => (
            <label
              key={s.slug}
              className={cn(
                "flex h-12 cursor-pointer items-center gap-2 rounded-pill px-4 text-[0.9375rem] transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                draft.spot === s.name
                  ? "bg-ink text-white"
                  : "bg-surface text-ink hover:bg-surface-2",
              )}
            >
              <input
                type="radio"
                name="spot"
                value={s.name}
                checked={draft.spot === s.name}
                onChange={() => update("spot", s.name)}
                className="sr-only"
              />
              <MapPin
                className="size-4 shrink-0"
                strokeWidth={1.5}
                aria-hidden
              />
              {s.name}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <Label htmlFor="from">Available from</Label>
        <input
          id="from"
          type="date"
          min={today}
          value={draft.from}
          onChange={(e) => update("from", e.target.value)}
          className={cn(field, "h-12 max-w-[240px]")}
        />
      </div>
      <Pills
        legend="Pickup time"
        name="window"
        options={windows}
        value={draft.window}
        onChange={(v) => update("window", v)}
      />
    </div>
  );
}

function priceLine(draft: Draft): string {
  if (draft.mode === "sell")
    return Number(draft.price) === 0 ? "Free" : `$${draft.price}`;
  return draft.free ? "Free to borrow" : `$${draft.price}/day`;
}

function Review({ draft }: { draft: Draft }) {
  const category = categories.find((c) => c.slug === draft.category)?.name;
  return (
    <div className="grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)]">
      {/* biome-ignore lint/performance/noImgElement: local object URL */}
      <img
        src={draft.photos[0]}
        alt="Cover"
        className="aspect-[4/5] w-full max-w-[200px] rounded-thumb bg-surface object-cover"
      />
      <dl className="flex flex-col gap-3">
        <Row label="Title" value={draft.title} />
        <Row label="Category" value={`${category} · ${draft.condition}`} />
        <Row
          label={draft.mode === "sell" ? "Selling for" : "Renting for"}
          value={`${priceLine(draft)}${draft.deposit && draft.mode === "rent" ? ` + $${draft.deposit} deposit` : ""}`}
        />
        <Row
          label="Pickup"
          value={`${draft.spot} · from ${formatDate(draft.from)} · ${draft.window}`}
        />
        <Row label="Photos" value={`${draft.photos.length}`} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="t-meta font-normal text-ink-2">{label}</dt>
      <dd className="text-[0.9375rem]">{value}</dd>
    </div>
  );
}

/** Success screen for a sale listing (demo only: not published). Stickers allowed here. */
function Posted({ draft }: { draft: Draft }) {
  return (
    <div className="relative mx-auto w-full max-w-[680px] rounded-tile bg-surface px-6 pt-20 pb-10 text-center md:px-12">
      <RooStickerStatic
        size={88}
        rotate={-8}
        className="absolute -top-10 left-1/2 -translate-x-[130%]"
      />
      <Sticker
        variant="burst"
        fill="lime"
        rotate={10}
        className="absolute -top-8 left-1/2 size-[104px] translate-x-[20%]"
      >
        Posted!
      </Sticker>
      {/* biome-ignore lint/performance/noImgElement: local object URL */}
      <img
        src={draft.photos[0]}
        alt=""
        className="mx-auto aspect-[4/5] w-40 rounded-thumb object-cover"
      />
      <p className="t-statement mx-auto mt-8 text-center">Your item is up.</p>
      <p className="t-body mx-auto mt-4 text-ink-2">
        {draft.title}, {priceLine(draft)}, pickup at {draft.spot}. Classmates
        message you to pick a time.
      </p>
      <p className="t-meta mt-4 text-ink-3">
        Demo · sale listings aren&apos;t published yet
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link
          href="/marketplace/browse"
          className={buttonVariants({ size: "lg" })}
        >
          Browse campus
        </Link>
        {/* A full reload starts a fresh draft */}
        <a
          href="/marketplace/listings/new"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Post another
        </a>
      </div>
    </div>
  );
}
