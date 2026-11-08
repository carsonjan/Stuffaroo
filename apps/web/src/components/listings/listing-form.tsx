"use client";

import { CircleCheck, ImagePlus, LoaderCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  controlClass,
  Field,
  MoneyInput,
  NativeSelect,
} from "@/components/forms/fields";
import { ListingThumb } from "@/components/marketplace/listing-thumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney, formatPrice } from "@/lib/format";
import { type CategorySlug, type Condition, categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Draft = {
  title: string;
  description: string;
  category: CategorySlug;
  condition: Condition;
  pricing: "free" | "paid";
  pricePerDay: string;
  deposit: string;
  location: string;
};

const emptyDraft: Draft = {
  title: "",
  description: "",
  category: "electronics",
  condition: "Good",
  pricing: "paid",
  pricePerDay: "",
  deposit: "",
  location: "North Campus",
};

/** Canned stand-in for the Gemini listing assistant in this mockup. */
const sampleSuggestion: Partial<Draft> = {
  title: "Nintendo Switch OLED with 2 Joy-Cons",
  description:
    "Switch OLED in great shape with dock, two Joy-Cons, charger and a protective case. Perfect for a games night or a long weekend. Games not included. Please keep it in the case when travelling.",
  category: "electronics",
  condition: "Like new",
  pricePerDay: "6",
  deposit: "60",
};

export function ListingForm() {
  const [prompt, setPrompt] = useState(
    "my switch oled, 2 controllers, has a case",
  );
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [generating, setGenerating] = useState(false);
  const [aiFilled, setAiFilled] = useState(false);
  const [published, setPublished] = useState(false);
  // Mockup: only the file names are kept, to show what was picked. Nothing is uploaded.
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const pickPhotos = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => f.name);
    // Names double as list keys, so drop duplicates.
    setPhotoNames([...new Set(names)].slice(0, 5));
  };

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setDraft((d) => ({ ...d, ...sampleSuggestion }));
      setGenerating(false);
      setAiFilled(true);
    }, 900);
  };

  if (published) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-card border bg-card px-6 py-14 text-center">
        <CircleCheck className="size-10 text-accent" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">Your listing is live</h2>
        <p className="mt-1 text-muted-foreground">
          We&apos;ll let you know when someone requests it.
        </p>
        <p className="mt-2 text-xs text-muted-foreground italic">
          Mockup: nothing was saved.
        </p>
        <div className="mt-6 flex gap-2">
          <Link
            href="/marketplace/dashboard"
            className={cn(buttonVariants({ size: "lg" }), "px-4")}
          >
            Go to dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              setPublished(false);
              setDraft(emptyDraft);
              setAiFilled(false);
            }}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "px-4",
            )}
          >
            List another
          </button>
        </div>
      </div>
    );
  }

  const price =
    draft.pricing === "free" || !draft.pricePerDay
      ? null
      : Number(draft.pricePerDay);
  const deposit = draft.deposit ? Number(draft.deposit) : null;

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
      <form
        className="flex flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault();
          setPublished(true);
        }}
      >
        {/* AI assist */}
        <section className="rounded-card border border-rule-2 bg-paper-2 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-accent">
            <Sparkles className="size-4" aria-hidden /> Draft with AI
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe the item however you like. We&apos;ll suggest a title,
            description, category and fair price.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="ai-prompt" className="sr-only">
              Describe your item
            </label>
            <input
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={controlClass}
              placeholder="e.g. my old canon camera, works great, has a charger"
            />
            <Button
              type="button"
              size="lg"
              onClick={generate}
              disabled={generating || !prompt.trim()}
            >
              {generating ? (
                <LoaderCircle
                  className="animate-spin motion-reduce:animate-none"
                  data-icon="inline-start"
                />
              ) : (
                <Sparkles data-icon="inline-start" />
              )}
              {generating ? "Drafting…" : "Generate"}
            </Button>
          </div>
          {aiFilled && (
            <p className="mt-3 text-xs text-muted-foreground">
              Draft filled in below. Review and edit before publishing.{" "}
              <span className="italic">(Mockup: sample AI response.)</span>
            </p>
          )}
        </section>

        {/* Details */}
        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-semibold">Details</h2>
          <Field label="Title" htmlFor="title">
            <input
              id="title"
              required
              maxLength={80}
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              className={cn(controlClass, aiFilled && "bg-accent/30")}
            />
          </Field>
          <Field
            label="Description"
            htmlFor="description"
            hint="What's included, any quirks, and how you'd like it returned."
          >
            <Textarea
              id="description"
              required
              rows={5}
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              className={cn("bg-card", aiFilled && "bg-accent/30")}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor="category">
              <NativeSelect
                id="category"
                value={draft.category}
                onChange={(e) =>
                  update("category", e.target.value as CategorySlug)
                }
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Condition" htmlFor="condition">
              <NativeSelect
                id="condition"
                value={draft.condition}
                onChange={(e) =>
                  update("condition", e.target.value as Condition)
                }
              >
                {(["New", "Like new", "Good", "Fair"] as const).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <Field
            label="Photos"
            htmlFor="photos"
            hint="Up to 5 images. JPG or PNG."
            asText
          >
            <label
              htmlFor="photos"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickPhotos(e.dataTransfer.files);
              }}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-card border border-dashed bg-card px-6 py-8 text-center text-sm text-muted-foreground hover:border-rule-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"
            >
              <ImagePlus className="size-6" aria-hidden />
              <span>
                <span className="font-medium text-foreground">
                  Click to upload
                </span>{" "}
                or drag photos here
              </span>
              <input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => pickPhotos(e.target.files)}
              />
            </label>
            {photoNames.length > 0 && (
              <div className="mt-2 text-sm" aria-live="polite">
                <ul className="flex flex-col gap-0.5">
                  {photoNames.map((name) => (
                    <li key={name} className="truncate">
                      {name}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-muted-foreground italic">
                  Mockup: photos are not uploaded or saved.
                </p>
              </div>
            )}
          </Field>
        </section>

        {/* Pricing */}
        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-semibold">Pricing & pickup</h2>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Pricing type"
          >
            {(["paid", "free"] as const).map((option) => (
              // biome-ignore lint/a11y/useSemanticElements: styled toggle inside an ARIA radiogroup
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={draft.pricing === option}
                onClick={() => update("pricing", option)}
                className={cn(
                  "rounded-pill border px-4 py-2 text-sm transition-colors",
                  draft.pricing === option
                    ? "border-ink bg-signal font-medium text-ink"
                    : "border-paper-3 bg-paper text-ink-2 hover:bg-paper-3",
                )}
              >
                {option === "paid" ? "Rent it out" : "Lend for free"}
              </button>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {draft.pricing === "paid" && (
              <Field label="Price per day" htmlFor="price">
                <MoneyInput
                  id="price"
                  required
                  value={draft.pricePerDay}
                  onChange={(e) => update("pricePerDay", e.target.value)}
                />
              </Field>
            )}
            <Field
              label="Refundable deposit"
              htmlFor="deposit"
              hint="Optional. Returned when the item comes back OK."
            >
              <MoneyInput
                id="deposit"
                value={draft.deposit}
                onChange={(e) => update("deposit", e.target.value)}
              />
            </Field>
            <Field label="Pickup area" htmlFor="location">
              <NativeSelect
                id="location"
                value={draft.location}
                onChange={(e) => update("location", e.target.value)}
              >
                {[
                  "North Campus",
                  "Main Quad",
                  "Engineering Hall",
                  "South Residences",
                  "Library District",
                  "Arts Building",
                ].map((loc) => (
                  <option key={loc}>{loc}</option>
                ))}
              </NativeSelect>
            </Field>
          </div>
        </section>

        <div className="flex justify-end gap-2 border-t pt-6">
          <Link
            href="/marketplace/browse"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "px-4",
            )}
          >
            Cancel
          </Link>
          <Button type="submit" size="lg" className="px-5">
            Publish listing
          </Button>
        </div>
      </form>

      {/* Live preview */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 text-sm font-medium text-ink-2">Preview</p>
        <div className="overflow-hidden rounded-card border bg-card">
          <ListingThumb category={draft.category} />
          <div className="flex flex-col gap-2 p-4">
            <p
              className={cn(
                "line-clamp-2 font-medium",
                !draft.title && "text-muted-foreground",
              )}
            >
              {draft.title || "Your item title"}
            </p>
            <p className="text-xs text-muted-foreground">
              {draft.location}, {draft.condition}
            </p>
            <div className="flex items-baseline justify-between pt-2">
              <span className="font-semibold">{formatPrice(price)}</span>
              <span className="text-xs text-muted-foreground">
                Deposit {formatMoney(deposit)}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
