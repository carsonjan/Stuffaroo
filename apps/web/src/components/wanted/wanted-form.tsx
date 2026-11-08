"use client";

import { LoaderCircle, Megaphone, Search } from "lucide-react";
import { startTransition, useActionState, useState } from "react";

import {
  controlClass,
  Field,
  MoneyInput,
  NativeSelect,
} from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MatchList, MatchMethodNote } from "@/components/wanted/match-list";
import { categories } from "@/lib/categories";
import type { Viewer } from "@/lib/viewer";
import {
  type FindMatchesState,
  findMatchesAction,
  type PostWantedState,
  postWantedAction,
} from "./actions";

const initialState: FindMatchesState = { status: "idle" };
const initialPostState: PostWantedState = { status: "idle" };

/**
 * Describe a need and see which real listings fit it right now (no account
 * needed), or post it as a wanted request (signed in).
 */
export function WantedForm({
  viewerStatus,
}: {
  viewerStatus: Viewer["status"];
}) {
  const [state, formAction, isPending] = useActionState(
    findMatchesAction,
    initialState,
  );
  const [postState, postAction, isPosting] = useActionState(
    postWantedAction,
    initialPostState,
  );
  const [lastIntent, setLastIntent] = useState<"find" | "post">("find");
  const canPost = viewerStatus === "signed-in";
  const busy = isPending || isPosting;
  const errorMessage =
    lastIntent === "post"
      ? postState.status === "error"
        ? postState.message
        : null
      : state.status === "error"
        ? state.message
        : null;

  return (
    <div className="mt-8 flex flex-col gap-8">
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          // Submit manually: two buttons share the form, and React would
          // otherwise reset the fields after each action.
          event.preventDefault();
          const submitter = (event.nativeEvent as SubmitEvent).submitter;
          const intent =
            submitter instanceof HTMLButtonElement && submitter.value === "post"
              ? "post"
              : "find";
          if (intent === "post" && !canPost) return;
          const formData = new FormData(event.currentTarget);
          setLastIntent(intent);
          startTransition(() =>
            intent === "post" ? postAction(formData) : formAction(formData),
          );
        }}
      >
        <Field
          label="Title"
          htmlFor="w-title"
          hint="Needed to post. Not needed to find matches."
        >
          <input
            id="w-title"
            name="title"
            maxLength={120}
            className={controlClass}
            placeholder="e.g. Camera for a weekend trip"
          />
        </Field>
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
          <Field
            label="Category"
            htmlFor="w-category"
            hint="Needed to post. Optional for matches."
          >
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
          <Field
            label="From"
            htmlFor="w-start"
            hint="Needed to post. Optional for matches."
          >
            <input
              id="w-start"
              name="startDate"
              type="date"
              className={controlClass}
            />
          </Field>
          <Field
            label="Until"
            htmlFor="w-end"
            hint="Needed to post. Optional for matches."
          >
            <input
              id="w-end"
              name="endDate"
              type="date"
              className={controlClass}
            />
          </Field>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {errorMessage !== null && (
            <p role="alert" className="mr-auto text-sm text-destructive">
              {errorMessage}
            </p>
          )}
          {/* Find matches comes first so Enter in a field never posts. */}
          <Button
            type="submit"
            name="intent"
            value="find"
            variant="outline"
            size="lg"
            className="px-4"
            disabled={busy}
            aria-busy={isPending || undefined}
          >
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
          <Button
            type="submit"
            name="intent"
            value="post"
            size="lg"
            className="px-4"
            disabled={busy || !canPost}
            aria-busy={isPosting || undefined}
            aria-describedby={canPost ? undefined : "post-wanted-note"}
          >
            {isPosting ? (
              <LoaderCircle
                className="animate-spin motion-reduce:animate-none"
                data-icon="inline-start"
              />
            ) : (
              <Megaphone data-icon="inline-start" />
            )}
            {isPosting ? "Posting…" : "Post wanted"}
          </Button>
        </div>
        {!canPost && (
          <p
            id="post-wanted-note"
            className="-mt-2 text-right text-sm text-muted-foreground"
          >
            {viewerStatus === "signed-out" ? (
              <>
                {/* Plain <a>: /auth/login is an Auth0 route handler, not a page. */}
                <a
                  href="/auth/login?returnTo=/marketplace/wanted/new"
                  className="font-medium text-ink-2 underline underline-offset-4"
                >
                  Sign in to post
                </a>{" "}
                so classmates can see your request.
              </>
            ) : (
              "Posting needs sign-in, which isn't configured for this deployment yet."
            )}
          </p>
        )}
      </form>

      {state.status === "done" && (
        <section aria-live="polite">
          <div className="mb-1 flex items-center justify-between gap-4">
            <h2 className="text-lg font-medium">Available now</h2>
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
