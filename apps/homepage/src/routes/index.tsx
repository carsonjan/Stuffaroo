import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Armchair,
  ArrowRight,
  Bike,
  BookOpen,
  Headphones,
  Heart,
  Leaf,
  MessageCircle,
  RefreshCw,
  Shirt,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import campus from "@/assets/campus-still-life.jpg";
import roo from "@/assets/roo.png.asset.json";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stuffaroo — Good stuff. Second lives." },
      {
        name: "description",
        content:
          "Your campus, your community, your next great find. Buy, rent and pass on second-hand essentials with fellow UBC students on Stuffaroo.",
      },
      {
        property: "og:title",
        content: "Stuffaroo — Good stuff. Second lives.",
      },
      {
        property: "og:description",
        content:
          "Buy, rent and pass on second-hand essentials with fellow UBC students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const categories = [
  { name: "Textbooks", icon: BookOpen },
  { name: "Electronics", icon: Headphones },
  { name: "Furniture", icon: Armchair },
  { name: "Clothing", icon: Shirt },
  { name: "Bikes", icon: Bike },
];

function Landing() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="bg-ink px-4 py-2 text-center text-xs font-bold text-paper">
        Less waste. More campus life.{" "}
        <span className="ml-1 text-butter">That’s the Stuffaroo way.</span>
      </div>
      <header className="relative z-20 border-b border-ink/15 bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 md:px-8">
          <Link to="/" className="font-display text-3xl font-extrabold">
            Stuff<span className="text-brick">aroo</span>
            <span className="text-primary">.</span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-3 md:gap-7"
          >
            <Button
              asChild
              variant="ghost"
              className="hidden font-bold sm:inline-flex"
            >
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild className="chunky-sm press rounded-xl font-bold">
              <Link to="/auth">
                Get started <ArrowRight />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden px-5 pb-12 pt-12 text-center md:pt-16">
          <img
            src={campus}
            alt="Textbooks, headphones and student essentials arranged on a peach tabletop"
            width={1600}
            height={1008}
            fetchPriority="high"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 -z-10 bg-paper/45" />
          <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-brick">
            Small campus. Big pouch.
          </p>
          <h1 className="font-display text-6xl font-extrabold leading-none md:text-7xl">
            Stuff<span className="text-brick">aroo</span>
          </h1>
          <h2 className="mt-2 text-4xl font-extrabold leading-tight md:text-5xl">
            Good stuff. Second lives.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-foreground/80">
            From your first textbook to your last move-out.
            <br className="hidden sm:block" /> Buy, rent and pass it on with
            your UBC community.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="chunky press h-12 rounded-xl text-base font-extrabold"
            >
              <Link to="/auth">
                Join the pouch <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="relative mx-auto mt-9 max-w-3xl">
            <div className="chunky relative flex min-h-72 flex-col items-center overflow-hidden rounded-3xl bg-paper px-5 pt-6 sm:min-h-80 sm:flex-row sm:justify-between sm:px-8">
              <div className="relative z-10 text-center sm:w-48 sm:text-left">
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-forest bg-mint px-3 py-1 text-xs font-extrabold text-forest">
                  <Leaf className="size-3.5" />
                  Made for campus
                </span>
                <h3 className="mt-4 text-3xl font-extrabold leading-tight">
                  A little less new.
                  <br />A lot more you.
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Your next great find is already on campus.
                </p>
              </div>
              <img
                src={roo.url}
                alt="Roo, the Stuffaroo kangaroo, with a pouch full of campus essentials"
                width={300}
                height={320}
                className="relative z-10 mt-3 h-56 w-auto object-contain sm:absolute sm:bottom-0 sm:left-1/2 sm:mt-0 sm:h-72 sm:-translate-x-1/2"
              />
              <div className="hidden w-40 space-y-3 sm:block">
                <div className="chunky-sm flex -rotate-3 items-center gap-3 rounded-xl bg-sky p-3">
                  <BookOpen className="size-7" />
                  <span className="font-display text-lg font-bold">
                    Study buddies
                  </span>
                </div>
                <div className="chunky-sm flex rotate-3 items-center gap-3 rounded-xl bg-lavender p-3">
                  <Headphones className="size-7" />
                  <span className="font-display text-lg font-bold">
                    Daily essentials
                  </span>
                </div>
                <div className="chunky-sm flex -rotate-2 items-center gap-3 rounded-xl bg-butter p-3">
                  <Armchair className="size-7" />
                  <span className="font-display text-lg font-bold">
                    Dorm favourites
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-5 flex items-center justify-center gap-2 text-xs font-bold">
              <Heart className="size-3.5 text-brick" />
              For students. From students. With love, Roo.
            </p>
          </div>
        </section>

        <section className="border-b border-ink/15 px-5 py-9">
          <p className="text-center text-sm text-muted-foreground">
            Whatever campus life calls for
          </p>
          <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-x-9 gap-y-5 md:justify-between">
            {categories.map(({ name, icon: Icon }) => (
              <div
                key={name}
                className="flex items-center gap-2 font-display text-lg font-bold"
              >
                <Icon className="size-5" />
                {name}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <p className="text-center text-xs font-extrabold uppercase tracking-widest text-brick">
            One community. Plenty of possibilities.
          </p>
          <h2 className="mt-3 text-center text-4xl font-extrabold">
            Campus life, a little lighter.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              {
                icon: ShoppingBag,
                title: "Find your next favourite",
                text: "Textbooks, tech and the little things that make your dorm feel like home. Second-hand, right here at UBC.",
                tint: "bg-peach",
              },
              {
                icon: RefreshCw,
                title: "Borrow, don’t buy",
                text: "Need it for a little while, not forever? Find something to rent from a classmate and keep your space clutter-free.",
                tint: "bg-sky",
              },
              {
                icon: Sparkles,
                title: "Pass the good stuff on",
                text: "Moving out or making room? Give your things a new chapter with another student. Or request what you’re looking for.",
                tint: "bg-mint",
              },
            ].map(({ icon: Icon, title, text, tint }) => (
              <div key={title}>
                <div
                  className={`chunky-sm mb-5 flex size-12 items-center justify-center rounded-xl ${tint}`}
                >
                  <Icon className="size-6" />
                </div>
                <h3 className="text-2xl font-bold leading-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y-2 border-ink bg-mint px-6 py-12 text-center">
          <MessageCircle className="mx-auto size-8 text-forest" />
          <h2 className="mt-3 text-4xl font-extrabold">
            Your next find starts with a hello.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed">
            Find something you love, message a classmate and arrange a pickup.
            Good stuff doesn’t have to travel far.
          </p>
        </section>
      </main>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-7">
        <Link to="/" className="font-display text-2xl font-extrabold">
          Stuff<span className="text-brick">aroo</span>.
        </Link>
        <p className="text-xs text-muted-foreground">
          A second home for your stuff. A little love for our planet.
        </p>
        <Button asChild variant="ghost" className="font-bold">
          <Link to="/post">
            Pass it on <ArrowRight />
          </Link>
        </Button>
      </footer>
    </div>
  );
}
