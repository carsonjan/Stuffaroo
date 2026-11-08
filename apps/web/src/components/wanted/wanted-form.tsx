"use client";

import { LoaderCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  controlClass,
  Field,
  MoneyInput,
  NativeSelect,
} from "@/components/forms/fields";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MatchList } from "@/components/wanted/match-list";
import { categories, mockMatches } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Mockup: "Find matches" reveals canned AI output for the keyboard example. */
export function WantedForm() {
  const [text, setText] = useState(
    "I need a mechanical keyboard for three days next week, nothing too loud",
  );
  const [stage, setStage] = useState<"idle" | "loading" | "parsed">("idle");

  const analyze = () => {
    setStage("loading");
    setTimeout(() => setStage("parsed"), 900);
  };

  return (
    <div className="mt-8 flex flex-col gap-8">
      <div className="rounded-card border bg-card p-2 focus-within:ring-3 focus-within:ring-ring/30">
        <label htmlFor="need" className="sr-only">
          Describe what you need
        </label>
        <Textarea
          id="need"
          rows={3}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setStage("idle");
          }}
          className="resize-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
          placeholder="e.g. I need a camera for a weekend trip"
        />
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-xs text-muted-foreground">
            AI reads dates, budget and category from your words
          </span>
          <Button
            type="button"
            size="lg"
            className="px-4"
            onClick={analyze}
            disabled={stage === "loading" || !text.trim()}
          >
            {stage === "loading" ? (
              <LoaderCircle
                className="animate-spin motion-reduce:animate-none"
                data-icon="inline-start"
              />
            ) : (
              <Sparkles data-icon="inline-start" />
            )}
            Find matches
          </Button>
        </div>
      </div>

      {stage === "parsed" && (
        <>
          <section className="rounded-card border p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Check the details</h2>
              <span className="text-xs text-muted-foreground italic">
                Mockup: sample AI extraction
              </span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="w-title" className="sm:col-span-2">
                <input
                  id="w-title"
                  defaultValue="Mechanical keyboard for three days"
                  className={controlClass}
                />
              </Field>
              <Field label="Category" htmlFor="w-category">
                <NativeSelect id="w-category" defaultValue="electronics">
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Budget per day" htmlFor="w-budget" hint="Optional">
                <MoneyInput id="w-budget" placeholder="Flexible" />
              </Field>
              <Field label="From" htmlFor="w-start">
                <input
                  id="w-start"
                  type="date"
                  defaultValue="2026-11-10"
                  className={controlClass}
                />
              </Field>
              <Field label="Until" htmlFor="w-end">
                <input
                  id="w-end"
                  type="date"
                  defaultValue="2026-11-12"
                  className={controlClass}
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="mb-1 text-lg font-semibold">Available now</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Items already listed that fit. Request one directly, or post your
              wanted so new listings can find you.
            </p>
            <MatchList matches={mockMatches["w-2"]} />
          </section>

          <div className="flex justify-end gap-2 border-t pt-6">
            <Link
              href="/wanted"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "px-4",
              )}
            >
              Cancel
            </Link>
            <Link
              href="/wanted/w-2"
              className={cn(buttonVariants({ size: "lg" }), "px-5")}
            >
              Post wanted
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
