"use client";

import { LoaderCircle, Search } from "lucide-react";
import { useActionState } from "react";

import {
  controlClass,
  Field,
  MoneyInput,
  NativeSelect,
} from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MatchList, MatchMethodNote } from "@/components/wanted/match-list";
import { categories } from "@/lib/mock-data";
import { type FindMatchesState, findMatchesAction } from "./actions";

const initialState: FindMatchesState = { status: "idle" };

/** Describe a need and see which real listings fit it right now. */
export function WantedForm() {
  const [state, formAction, isPending] = useActionState(
    findMatchesAction,
    initialState,
  );

  return (
    <div className="mt-8 flex flex-col gap-8">
      <form action={formAction} className="flex flex-col gap-5">
        <Field label="What do you need?" htmlFor="need">
          <Textarea
            id="need"
            name="text"
            rows={3}
            required
            minLength={3}
            maxLength={1000}
            className="resize-none text-base"
            placeholder="e.g. A camera for a weekend trip, something light"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" htmlFor="w-category" hint="Optional">
            <NativeSelect id="w-category" name="category" defaultValue="">
              <option value="">Any category</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Budget per day" htmlFor="w-budget" hint="Optional">
            <MoneyInput id="w-budget" name="budget" placeholder="Flexible" />
          </Field>
          <Field label="From" htmlFor="w-start" hint="Optional">
            <input
              id="w-start"
              name="startDate"
              type="date"
              className={controlClass}
            />
          </Field>
          <Field label="Until" htmlFor="w-end" hint="Optional">
            <input
              id="w-end"
              name="endDate"
              type="date"
              className={controlClass}
            />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-3">
          {state.status === "error" && (
            <p role="alert" className="text-sm text-destructive">
              {state.message}
            </p>
          )}
          <Button type="submit" size="lg" className="px-4" disabled={isPending}>
            {isPending ? (
              <LoaderCircle
                className="animate-spin motion-reduce:animate-none"
                data-icon="inline-start"
              />
            ) : (
              <Search data-icon="inline-start" />
            )}
            Find matches
          </Button>
        </div>
      </form>

      {state.status === "done" && (
        <section aria-live="polite">
          <div className="mb-1 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Available now</h2>
            <MatchMethodNote method={state.result.method} />
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Listed items that are available and fit your category, budget and
            dates.
          </p>
          {state.result.matches.length > 0 ? (
            <MatchList matches={state.result.matches} />
          ) : (
            <p className="rounded-card border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
              Nothing listed fits yet. Try a broader description or budget.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
