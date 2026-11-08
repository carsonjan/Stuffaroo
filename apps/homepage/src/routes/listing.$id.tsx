import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { discount, type Listing, money, tintFor } from "@/lib/listings";

export const Route = createFileRoute("/listing/$id")({
  head: () => ({
    meta: [
      { title: "Listing — Stuffaroo" },
      {
        name: "description",
        content: "See item details and message the seller on Stuffaroo.",
      },
      { property: "og:title", content: "Listing — Stuffaroo" },
      {
        property: "og:description",
        content: "See item details and message the seller on Stuffaroo.",
      },
    ],
  }),
  component: ListingPage,
});

function ListingPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const { data: l, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Listing | null;
    },
  });
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!l) return <p>That item has hopped away.</p>;
  const d = discount(l);
  const isMine = user?.id === l.seller_id;

  async function send() {
    if (!user || !l?.seller_id || !body.trim()) return;
    setSending(true);
    const { error } = await supabase
      .from("messages")
      .insert({
        listing_id: l.id,
        sender_id: user.id,
        recipient_id: l.seller_id,
        body: body.trim().slice(0, 2000),
      });
    setSending(false);
    if (error) return void toast.error(error.message);
    setBody("");
    toast.success("Message sent! Check your inbox for replies.");
  }

  async function remove() {
    if (!l) return;
    const { error } = await supabase.from("listings").delete().eq("id", l.id);
    if (error) return void toast.error(error.message);
    toast.success("Listing removed");
    history.back();
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div
        className={`chunky aspect-square overflow-hidden rounded-3xl ${tintFor(l.id)} flex items-center justify-center`}
      >
        {l.image_url ? (
          <img
            src={l.image_url}
            alt={l.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="px-6 text-center font-semibold text-muted-foreground">
            {l.title}
          </span>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex gap-2">
          <span className="rounded-full border-2 border-ink px-2 text-xs font-bold">
            {l.category}
          </span>
          <span className="rounded-full bg-lavender px-2 text-xs font-bold text-grape">
            {l.kind === "sell"
              ? "FOR SALE"
              : l.kind === "rent"
                ? "FOR RENT"
                : "WANTED"}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold leading-tight">{l.title}</h1>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-extrabold">
            {money(l.price)}
          </span>
          {d && (
            <span className="text-muted-foreground line-through">
              {money(l.original_price)}
            </span>
          )}
          {d && (
            <span className="rounded-full bg-peach px-2 text-sm font-bold text-brick">
              -{d}%
            </span>
          )}
        </div>
        {l.location && (
          <p className="flex items-center gap-1 text-sm">
            <MapPin className="size-4" />
            {l.location}
          </p>
        )}
        {l.description && (
          <p className="whitespace-pre-wrap">{l.description}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Posted by <b>{l.seller_name}</b> ·{" "}
          {new Date(l.created_at).toLocaleDateString()}
        </p>

        <div className="chunky rounded-2xl bg-card p-4">
          {isMine ? (
            <div className="flex items-center justify-between">
              <span className="text-sm">This is your listing.</span>
              <button
                onClick={remove}
                className="chunky-sm rounded-xl bg-destructive px-3 py-1 text-sm font-bold text-destructive-foreground"
              >
                Remove
              </button>
            </div>
          ) : !l.seller_id ? (
            <p className="text-sm text-muted-foreground">
              This is a sample listing, so messaging is off. Post your own to
              start trading!
            </p>
          ) : !user ? (
            <p className="text-sm">
              <Link to="/auth" className="font-bold text-brick">
                Sign in
              </Link>{" "}
              to message {l.seller_name}.
            </p>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-bold">
                {l.kind === "wanted"
                  ? `Tell ${l.seller_name} you have it`
                  : `Message ${l.seller_name}`}
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Hi! Is this still available?"
                className="w-full rounded-xl border-2 border-ink bg-paper p-2 outline-none"
              />
              <button
                disabled={sending || !body.trim()}
                onClick={send}
                className="chunky-sm press flex items-center gap-1 rounded-xl bg-primary px-4 py-1.5 font-bold disabled:opacity-50"
              >
                <Send className="size-4" />
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
