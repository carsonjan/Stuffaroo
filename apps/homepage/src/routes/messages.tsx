import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/messages")({
  validateSearch: z.object({
    listing: z.string().optional(),
    with: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Messages — Stuffaroo" },
      {
        name: "description",
        content: "Chat with buyers and sellers on Stuffaroo.",
      },
      { property: "og:title", content: "Messages — Stuffaroo" },
      {
        property: "og:description",
        content: "Chat with buyers and sellers on Stuffaroo.",
      },
    ],
  }),
  component: MessagesPage,
});

type Msg = {
  id: string;
  listing_id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
};

function MessagesPage() {
  const { user, loading } = useAuth();
  const search = Route.useSearch();
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  const { data } = useQuery({
    enabled: !!user,
    queryKey: ["messages", user?.id],
    queryFn: async () => {
      const { data: msgs, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at");
      if (error) throw error;
      const listingIds = [...new Set(msgs.map((m) => m.listing_id))];
      const userIds = [
        ...new Set(msgs.flatMap((m) => [m.sender_id, m.recipient_id])),
      ];
      const [{ data: listings }, { data: profiles }] = await Promise.all([
        supabase
          .from("listings")
          .select("id,title")
          .in(
            "id",
            listingIds.length
              ? listingIds
              : ["00000000-0000-0000-0000-000000000000"],
          ),
        supabase
          .from("profiles")
          .select("id,display_name")
          .in(
            "id",
            userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"],
          ),
      ]);
      return {
        msgs: msgs as Msg[],
        titles: Object.fromEntries(
          (listings ?? []).map((l) => [l.id, l.title]),
        ),
        names: Object.fromEntries(
          (profiles ?? []).map((p) => [p.id, p.display_name]),
        ),
      };
    },
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`msgs-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => qc.invalidateQueries({ queryKey: ["messages"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, qc]);

  const threads = useMemo(() => {
    if (!data || !user) return [];
    const map = new Map<
      string,
      { listing: string; other: string; last: Msg; msgs: Msg[] }
    >();
    for (const m of data.msgs) {
      const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
      const key = `${m.listing_id}:${other}`;
      const t = map.get(key) ?? {
        listing: m.listing_id,
        other,
        last: m,
        msgs: [],
      };
      t.msgs.push(m);
      t.last = m;
      map.set(key, t);
    }
    return [...map.values()].sort((a, b) =>
      b.last.created_at.localeCompare(a.last.created_at),
    );
  }, [data, user]);

  if (loading) return null;
  if (!user)
    return (
      <p className="text-center">
        Please{" "}
        <Link to="/auth" className="font-bold text-brick">
          sign in
        </Link>{" "}
        to see your messages.
      </p>
    );

  const active =
    threads.find(
      (t) => t.listing === search.listing && t.other === search.with,
    ) ?? null;

  async function reply() {
    if (!active || !body.trim() || !user) return;
    const { error } = await supabase
      .from("messages")
      .insert({
        listing_id: active.listing,
        sender_id: user.id,
        recipient_id: active.other,
        body: body.trim().slice(0, 2000),
      });
    if (error) return void toast.error(error.message);
    setBody("");
    qc.invalidateQueries({ queryKey: ["messages"] });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Messages</h1>
      {threads.length === 0 ? (
        <p className="rounded-2xl bg-muted p-8 text-center text-muted-foreground">
          No chats yet. Find something you like and message the seller!
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <ul className="space-y-2">
            {threads.map((t) => {
              const on = active === t;
              return (
                <li key={`${t.listing}:${t.other}`}>
                  <Link
                    to="/messages"
                    search={{ listing: t.listing, with: t.other }}
                    className={`chunky-sm block rounded-xl p-3 ${on ? "bg-peach" : "bg-card"}`}
                  >
                    <p className="truncate text-sm font-bold">
                      {data?.names[t.other] ?? "Student"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {data?.titles[t.listing] ?? "Listing"}
                    </p>
                    <p className="truncate text-xs">{t.last.body}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="chunky flex min-h-[400px] flex-col rounded-2xl bg-card p-4">
            {!active ? (
              <p className="m-auto text-muted-foreground">
                Pick a conversation
              </p>
            ) : (
              <>
                <Link
                  to="/listing/$id"
                  params={{ id: active.listing }}
                  className="mb-3 border-b-2 border-ink pb-2 font-bold"
                >
                  {data?.titles[active.listing]}
                </Link>
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {active.msgs.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.sender_id === user.id ? "ml-auto bg-primary" : "bg-mint"}`}
                    >
                      {m.body}
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    reply();
                  }}
                  className="mt-3 flex gap-2"
                >
                  <input
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={2000}
                    placeholder="Write a reply…"
                    className="flex-1 rounded-xl border-2 border-ink bg-paper px-3 py-2 outline-none"
                  />
                  <button
                    className="chunky-sm rounded-xl bg-primary px-3"
                    aria-label="Send"
                  >
                    <Send className="size-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
