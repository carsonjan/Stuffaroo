import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, KINDS } from "@/lib/listings";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post an item — Stuffaroo" },
      {
        name: "description",
        content: "List something to sell, rent or request from UBC students.",
      },
      { property: "og:title", content: "Post an item — Stuffaroo" },
      {
        property: "og:description",
        content: "List something to sell, rent or request from UBC students.",
      },
    ],
  }),
  component: PostPage,
});

const field =
  "w-full rounded-xl border-2 border-ink bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring";

function PostPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [kind, setKind] = useState("sell");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (!user)
    return (
      <p className="text-center">
        Please{" "}
        <Link to="/auth" className="font-bold text-brick">
          sign in
        </Link>{" "}
        to post an item.
      </p>
    );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title") || "").trim();
    const price = Number(f.get("price"));
    if (!title || title.length > 120)
      return void toast.error("Title is required (max 120 characters)");
    if (!(price >= 0) || price > 100000)
      return void toast.error("Enter a valid price");
    setBusy(true);
    let image_url: string | null = null;
    if (file) {
      const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.]/g, "_")}`;
      const up = await supabase.storage
        .from("listing-images")
        .upload(path, file);
      if (up.error) {
        setBusy(false);
        return void toast.error(up.error.message);
      }
      const signed = await supabase.storage
        .from("listing-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      image_url = signed.data?.signedUrl ?? null;
    }
    const orig = f.get("original_price")
      ? Number(f.get("original_price"))
      : null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();
    const { data, error } = await supabase
      .from("listings")
      .insert({
        seller_id: user.id,
        seller_name: profile?.display_name ?? "UBC Student",
        kind,
        title,
        price,
        original_price: orig,
        category: String(f.get("category")),
        location:
          String(f.get("location") || "")
            .trim()
            .slice(0, 80) || null,
        description:
          String(f.get("description") || "")
            .trim()
            .slice(0, 2000) || null,
        image_url,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Into the pouch it goes!");
    navigate({ to: "/listing/$id", params: { id: data.id } });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-extrabold">Post to the pouch</h1>
      <div className="grid grid-cols-3 gap-2">
        {KINDS.map((k) => (
          <button
            type="button"
            key={k.value}
            onClick={() => setKind(k.value)}
            className={`chunky-sm rounded-xl py-2 font-bold ${kind === k.value ? "bg-primary" : "bg-card"}`}
          >
            {k.label === "Buy"
              ? "Sell"
              : k.label === "Rent"
                ? "Rent out"
                : "Request"}
          </button>
        ))}
      </div>
      <label className="chunky-sm flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-sky p-6 text-sm font-semibold">
        {file ? (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="max-h-56 rounded-xl"
          />
        ) : (
          <>
            <ImagePlus className="size-8" />
            Add a photo
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <input
        name="title"
        required
        maxLength={120}
        placeholder="Title, e.g. MATH 100 textbook"
        className={field}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="price"
          type="number"
          min="0"
          step="1"
          required
          placeholder={kind === "wanted" ? "Budget ($)" : "Price ($)"}
          className={field}
        />
        <input
          name="original_price"
          type="number"
          min="0"
          step="1"
          placeholder="Original price (optional)"
          className={field}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select name="category" className={field} defaultValue="Other">
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          name="location"
          maxLength={80}
          placeholder="Pickup spot, e.g. The Nest"
          className={field}
        />
      </div>
      <textarea
        name="description"
        rows={4}
        maxLength={2000}
        placeholder="Condition, pickup dates, course code…"
        className={field}
      />
      <button
        disabled={busy}
        className="chunky press w-full rounded-2xl bg-primary py-3 font-display text-lg font-bold disabled:opacity-50"
      >
        {busy ? "Posting…" : "Post it"}
      </button>
    </form>
  );
}
