import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { ListingCard, WantedCard } from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, KINDS, type Listing } from "@/lib/listings";

const schema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  kind: z.enum(["sell", "rent", "wanted"]).optional(),
});

export const Route = createFileRoute("/browse")({
  validateSearch: schema,
  head: () => ({
    meta: [
      { title: "Browse listings — Stuffaroo" },
      {
        name: "description",
        content: "Filter second-hand items from UBC students by category.",
      },
      { property: "og:title", content: "Browse listings — Stuffaroo" },
      {
        property: "og:description",
        content: "Filter second-hand items from UBC students by category.",
      },
    ],
  }),
  component: Browse,
});

function Browse() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/browse" });
  const [q, setQ] = useState(search.q ?? "");
  const { data = [], isLoading } = useQuery({
    queryKey: ["listings", search],
    queryFn: async () => {
      let query = supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (search.category) query = query.eq("category", search.category);
      if (search.kind) query = query.eq("kind", search.kind);
      if (search.q)
        query = query.or(
          `title.ilike.%${search.q.replace(/[%,()]/g, "")}%,description.ilike.%${search.q.replace(/[%,()]/g, "")}%`,
        );
      const { data, error } = await query;
      if (error) throw error;
      return data as Listing[];
    },
  });
  const chip = (active: boolean) =>
    `chunky-sm press rounded-full px-3 py-1 text-sm font-semibold ${active ? "bg-primary" : "bg-card"}`;

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold">Browse the pouch</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ search: (s) => ({ ...s, q: q || undefined }) });
        }}
        className="chunky-sm flex items-center gap-2 rounded-2xl bg-card p-1.5 pl-4"
      >
        <Search className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search items or course code"
          className="flex-1 bg-transparent py-2 outline-none"
        />
        <button className="chunky-sm rounded-xl bg-primary px-4 py-1.5 font-bold">
          Find
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/browse"
          search={(s) => ({ ...s, kind: undefined })}
          className={chip(!search.kind)}
        >
          All types
        </Link>
        {KINDS.map((k) => (
          <Link
            key={k.value}
            to="/browse"
            search={(s) => ({ ...s, kind: k.value })}
            className={chip(search.kind === k.value)}
          >
            {k.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/browse"
          search={(s) => ({ ...s, category: undefined })}
          className={chip(!search.category)}
        >
          All categories
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            to="/browse"
            search={(s) => ({ ...s, category: c })}
            className={chip(search.category === c)}
          >
            {c}
          </Link>
        ))}
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">
          Roo is digging through the pouch…
        </p>
      ) : data.length === 0 ? (
        <p className="rounded-2xl bg-muted p-8 text-center text-muted-foreground">
          Nothing here yet. Try another filter, or post a request!
        </p>
      ) : search.kind === "wanted" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {data.map((l) => (
            <WantedCard key={l.id} l={l} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data.map((l) =>
            l.kind === "wanted" ? (
              <WantedCard key={l.id} l={l} />
            ) : (
              <ListingCard key={l.id} l={l} />
            ),
          )}
        </div>
      )}
    </div>
  );
}
