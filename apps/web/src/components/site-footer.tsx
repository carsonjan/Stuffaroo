import Link from "next/link";

import { spots } from "@/lib/catalog";

import { Logo } from "./logo";

const linkClass =
  "text-[0.875rem] font-light text-ink-2 transition-colors duration-200 hover:text-ink";

/** No repeated nav: what Stuffaroo is, how it works, safety, the pickup spots, and the demo note. */
export function SiteFooter() {
  return (
    <footer className="mt-[var(--section-gap)] border-t border-line pb-28 md:pb-0">
      <div className="container grid gap-12 pt-14 pb-12 md:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))] md:gap-8">
        <div className="flex flex-col gap-4">
          <Logo className="text-[1.75rem]" />
          <p className="max-w-[30ch] text-[0.875rem] font-light text-ink-2">
            A campus marketplace for UBC. Buy, rent or ask classmates for the
            things you need this week.
          </p>
        </div>
        <FooterCol title="About">
          <p className={linkClass}>
            Built by UBC students. Things move a few hundred metres instead of
            to the landfill.
          </p>
        </FooterCol>
        <FooterCol title="How it works">
          <p className={linkClass}>Find it or ask for it.</p>
          <p className={linkClass}>Message and pick a time.</p>
          <p className={linkClass}>Meet at a campus spot, then rate.</p>
        </FooterCol>
        <FooterCol title="Safety">
          <p className={linkClass}>UBC-verified accounts only.</p>
          <p className={linkClass}>Meet in public campus spots.</p>
          <Link href="/marketplace/deposits" className={linkClass}>
            How deposits work
          </Link>
        </FooterCol>
        <FooterCol title="Campus spots">
          {spots.map((s) => (
            <Link
              key={s.slug}
              href={`/marketplace/browse?spot=${s.slug}`}
              className={linkClass}
            >
              {s.name}
            </Link>
          ))}
        </FooterCol>
      </div>
      <div className="container flex flex-col gap-2 border-t border-line py-6 md:flex-row md:justify-between">
        <p className="t-meta text-ink-2">Demo info</p>
        <p className="t-meta text-ink-2">
          Students and listings are fictional. No real money moves.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="t-label text-ink">{title}</h3>
      {children}
    </div>
  );
}
