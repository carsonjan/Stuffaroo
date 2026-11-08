"use client";

import { ImagePlus, LoaderCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";

import {
  controlClass,
  Field,
  MoneyInput,
  NativeSelect,
} from "@/components/forms/fields";
import { ListingThumb } from "@/components/marketplace/listing-thumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  type CategorySlug,
  type Condition,
  categories,
} from "@/lib/categories";
import { formatMoney, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { type CreateListingState, createListingAction } from "./actions";

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

const initialState: CreateListingState = { status: "idle" };

const pickupAreas = [
  "North Campus",
  "Main Quad",
  "Engineering Hall",
  "South Residences",
  "Library District",
  "Arts Building",
];

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
  const [state, formAction, isPending] = useActionState(
    createListingAction,
    initialState,
  );

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

  const price =
    draft.pricing === "free" || !draft.pricePerDay
      ? null
      : Number(draft.pricePerDay);
  const deposit = draft.deposit ? Number(draft.deposit) : null;

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
      <form
        className="flex flex-col gap-8"
        onSubmit={(event) => {
          // Submit manually so React doesn't reset the form after the action.
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          startTransition(() => formAction(formData));
        }}
      >
        {/* AI assist */}
        <section className="rounded-card border border-rule-2 bg-paper-2 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-accent">
            <Sparkles className="size-4" aria-hidden /> Draft with AI
            <span className="rounded-pill border border-rule px-2 py-0.5 text-xs font-normal text-ink-3">
              Mockup
            </span>
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
              name="title"
              required
              minLength={3}
              maxLength={120}
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
              name="description"
              required
              maxLength={2000}
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
                name="category"
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
                name="condition"
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
            hint="Photo upload isn't available yet. Listings show a category image for now."
            asText
          >
            <label
              htmlFor="photos"
              className="flex cursor-not-allowed flex-col items-center gap-2 rounded-card border border-dashed bg-muted/40 px-6 py-8 text-center text-sm text-muted-foreground"
            >
              <ImagePlus className="size-6 opacity-60" aria-hidden />
              <span>Photo upload coming soon</span>
              <input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                disabled
                aria-describedby="photos-title"
                className="sr-only"
              />
            </label>
          </Field>
        </section>

        {/* Pricing */}
        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-semibold">Pricing & pickup</h2>
          <input type="hidden" name="pricing" value={draft.pricing} />
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
                  name="pricePerDay"
                  required
                  min={1}
                  max={1000}
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
                name="deposit"
                max={10000}
                value={draft.deposit}
                onChange={(e) => update("deposit", e.target.value)}
              />
            </Field>
            <Field label="Pickup area" htmlFor="location">
              <NativeSelect
                id="location"
                name="location"
                value={draft.location}
                onChange={(e) => update("location", e.target.value)}
              >
                {pickupAreas.map((loc) => (
                  <option key={loc}>{loc}</option>
                ))}
              </NativeSelect>
            </Field>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-6">
          {state.status === "error" && (
            <p role="alert" className="mr-auto text-sm text-destructive">
              {state.message}
            </p>
          )}
          <Link
            href="/marketplace/browse"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "px-4",
            )}
          >
            Cancel
          </Link>
          <Button
            type="submit"
            size="lg"
            className="px-5"
            disabled={isPending}
            aria-busy={isPending || undefined}
          >
            {isPending && (
              <LoaderCircle
                className="animate-spin motion-reduce:animate-none"
                data-icon="inline-start"
              />
            )}
            {isPending ? "Publishing…" : "Publish listing"}
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
