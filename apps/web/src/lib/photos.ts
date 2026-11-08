/**
 * Mockup listing photos: free Unsplash photos (Unsplash License), hot-linked
 * from images.unsplash.com and cropped to 4:5 by its image CDN. Stand-ins until
 * listings carry real uploads.
 */

const W = 800;

export function unsplash(id: string, width = W): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${Math.round(width * 1.25)}&q=70`;
}

/** Photos per demo catalog item, first one is the cover. */
export const demoPhotos: Record<string, string[]> = {
  "b-1": ["1542728928-1413d1894ed1", "1551380701-5dd33d5b5d06"],
  "r-1": ["1504280390367-361c6d9f38f4", "1537905569824-f89f14cceb68"],
  "b-2": ["1509228468518-180dd4864904", "1518133835878-5a93cc3f89e5"],
  "r-2": ["1495707902641-75cac588d2e9", "1502982720700-bfff97f2ecac"],
  "b-3": ["1540961403310-79825242906e"],
  "r-3": ["1618384887929-16ec33fab9ef", "1632079003110-d694908500da"],
  "b-4": ["1610305947387-9dd3b77faef9", "1652654753784-7a376792b816"],
  "r-4": ["1541689592655-f5f52825a3b8", "1558098329-a11cff621064"],
  "b-5": ["1544233726-9f1d2b27be8b", "1599182345361-9542815e73f6"],
  "r-5": ["1572981779307-38b8cabb2407", "1540104539488-92a51bbc0410"],
  "b-6": ["1754304342329-3c5aff22a39c"],
  "r-6": ["1648201637025-1c77b9be3013", "1648201188793-418f2b9b4b32"],
  "b-7": ["1763004871583-4183d64096b1"],
  "r-7": ["1535016120720-40c646be5580", "1589113050289-1c654e7e305d"],
};

/** Photos for the seeded API listings, matched on a keyword in the title. */
const apiPhotos: [RegExp, string[]][] = [
  [/switch/i, ["1612036781124-847f8939b154", "1578303512597-81e6cc155b3e"]],
  [
    /speaker|jbl/i,
    ["1608043152269-423dbba4e7e1", "1589003077984-894e133dabab"],
  ],
  [/canon/i, ["1495707902641-75cac588d2e9", "1502982720700-bfff97f2ecac"]],
  [/sony|a6000/i, ["1516035069371-29a1b244cc32", "1766582078462-4d0d8408c930"]],
  [
    /keyboard|keychron/i,
    ["1618384887929-16ec33fab9ef", "1632079003110-d694908500da"],
  ],
  [/instant pot/i, ["1569641092045-f6ec23879aef", "1544233726-9f1d2b27be8b"]],
  [/calculus/i, ["1754304342329-3c5aff22a39c"]],
  [
    /ti-84|calculator/i,
    ["1648201637025-1c77b9be3013", "1648201188793-418f2b9b4b32"],
  ],
  [/tent/i, ["1504280390367-361c6d9f38f4", "1537905569824-f89f14cceb68"]],
  [/drill/i, ["1572981779307-38b8cabb2407", "1540104539488-92a51bbc0410"]],
  [/basketball/i, ["1627627256672-027a4613d028", "1519861531473-9200262188bf"]],
];

export function photosForDemo(id: string): string[] {
  return (demoPhotos[id] ?? []).map((p) => unsplash(p));
}

export function photosForTitle(title: string): string[] {
  const match = apiPhotos.find(([pattern]) => pattern.test(title));
  return match ? match[1].map((p) => unsplash(p)) : [];
}

/** One photo per category for the "Shop by category" tiles. */
export const categoryPhotos: Record<string, string> = {
  electronics: unsplash("1618384887929-16ec33fab9ef"),
  cameras: unsplash("1495707902641-75cac588d2e9"),
  textbooks: unsplash("1509228468518-180dd4864904"),
  outdoor: unsplash("1504280390367-361c6d9f38f4"),
  music: unsplash("1541689592655-f5f52825a3b8"),
  kitchen: unsplash("1544233726-9f1d2b27be8b"),
  tools: unsplash("1572981779307-38b8cabb2407"),
  sports: unsplash("1627627256672-027a4613d028"),
};
