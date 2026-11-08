/**
 * Sample data for the frontend mockup.
 *
 * Shapes mirror the planned Supabase schema (profiles, listings, wanted_posts,
 * rental_requests, deposits) so these can be swapped for real queries later.
 * Nothing here represents a real transaction.
 */

export type CategorySlug =
  | "electronics"
  | "cameras"
  | "textbooks"
  | "outdoor"
  | "music"
  | "kitchen"
  | "tools"
  | "sports";

export type Category = {
  slug: CategorySlug;
  name: string;
  /** Tailwind classes for the pastel tile behind the category icon. */
  tint: string;
};

export const categories: Category[] = [
  { slug: "electronics", name: "Electronics", tint: "bg-tint-blue text-ink" },
  { slug: "cameras", name: "Cameras", tint: "bg-tint-peach text-ink" },
  { slug: "textbooks", name: "Textbooks", tint: "bg-tint-butter text-ink" },
  { slug: "outdoor", name: "Outdoor & Camping", tint: "bg-tint-mint text-ink" },
  { slug: "music", name: "Music", tint: "bg-tint-peach text-ink" },
  { slug: "kitchen", name: "Kitchen", tint: "bg-tint-butter text-ink" },
  { slug: "tools", name: "Tools & DIY", tint: "bg-tint-blue text-ink" },
  { slug: "sports", name: "Sports", tint: "bg-tint-mint text-ink" },
];

export type Profile = {
  id: string;
  displayName: string;
  campus: string;
  program: string;
  joined: string;
  initials: string;
  rating: number;
  completedLends: number;
};

export type Condition = "New" | "Like new" | "Good" | "Fair";
export type AvailabilityStatus = "available" | "on_loan" | "paused";

export type Listing = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: CategorySlug;
  condition: Condition;
  /** null = free to borrow */
  pricePerDay: number | null;
  depositAmount: number | null;
  location: string;
  availability: AvailabilityStatus;
  createdAt: string;
};

export type WantedPost = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: CategorySlug;
  budgetPerDay: number | null;
  startDate: string;
  endDate: string;
  status: "open" | "fulfilled" | "closed";
  createdAt: string;
};

export type RentalStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "active"
  | "completed";

export type RentalRequest = {
  id: string;
  listingId: string;
  borrowerId: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  message: string;
  createdAt: string;
};

export type MatchSuggestion = {
  listingId: string;
  score: number;
  reason: string;
};

/** The signed-in student in the mockup. */
export const CURRENT_USER_ID = "u-maya";

export const profiles: Profile[] = [
  {
    id: "u-maya",
    displayName: "Maya Chen",
    campus: "North Campus",
    program: "Computer Science, 3rd year",
    joined: "2025-09-02",
    initials: "MC",
    rating: 4.9,
    completedLends: 14,
  },
  {
    id: "u-jordan",
    displayName: "Jordan Okafor",
    campus: "Main Quad",
    program: "Film Studies, 4th year",
    joined: "2024-09-10",
    initials: "JO",
    rating: 4.8,
    completedLends: 31,
  },
  {
    id: "u-priya",
    displayName: "Priya Raman",
    campus: "Engineering Hall",
    program: "Mechanical Eng., 2nd year",
    joined: "2025-01-15",
    initials: "PR",
    rating: 5.0,
    completedLends: 9,
  },
  {
    id: "u-lucas",
    displayName: "Lucas Moreau",
    campus: "South Residences",
    program: "Kinesiology, 3rd year",
    joined: "2024-10-03",
    initials: "LM",
    rating: 4.7,
    completedLends: 22,
  },
  {
    id: "u-sam",
    displayName: "Sam Patel",
    campus: "Library District",
    program: "Economics, 1st year",
    joined: "2026-09-05",
    initials: "SP",
    rating: 4.6,
    completedLends: 3,
  },
  {
    id: "u-aiko",
    displayName: "Aiko Tanaka",
    campus: "Arts Building",
    program: "Music Performance, 2nd year",
    joined: "2025-09-08",
    initials: "AT",
    rating: 4.9,
    completedLends: 17,
  },
];

export const listings: Listing[] = [
  {
    id: "l-1",
    ownerId: "u-jordan",
    title: "Sony Alpha a6000 with 16–50mm kit lens",
    description:
      "Great starter mirrorless camera. Comes with two batteries, charger, a 64GB SD card and a padded bag. Perfect for weekend trips, club events or a film assignment. Please return with the battery charged.",
    category: "cameras",
    condition: "Good",
    pricePerDay: 12,
    depositAmount: 80,
    location: "Main Quad",
    availability: "available",
    createdAt: "2026-11-01",
  },
  {
    id: "l-2",
    ownerId: "u-priya",
    title: "Keychron K2 mechanical keyboard (brown switches)",
    description:
      "Wireless 75% keyboard, Bluetooth or USB-C. Tactile but not too loud for the library. Includes keycap puller and cable.",
    category: "electronics",
    condition: "Like new",
    pricePerDay: 3,
    depositAmount: 25,
    location: "Engineering Hall",
    availability: "available",
    createdAt: "2026-11-03",
  },
  {
    id: "l-3",
    ownerId: "u-lucas",
    title: "2-person backpacking tent",
    description:
      "Lightweight 1.8kg dome tent with rainfly and footprint. Sets up in 5 minutes. Used on three trips, no tears.",
    category: "outdoor",
    condition: "Good",
    pricePerDay: 6,
    depositAmount: 40,
    location: "South Residences",
    availability: "available",
    createdAt: "2026-10-28",
  },
  {
    id: "l-4",
    ownerId: "u-sam",
    title: "Calculus: Early Transcendentals (9th ed.)",
    description:
      "Stewart textbook for MATH 100/101. Some highlighting in chapters 2–4. Free to borrow for the term — just bring it back before finals.",
    category: "textbooks",
    condition: "Fair",
    pricePerDay: null,
    depositAmount: null,
    location: "Library District",
    availability: "available",
    createdAt: "2026-10-30",
  },
  {
    id: "l-5",
    ownerId: "u-aiko",
    title: "Yamaha acoustic guitar + soft case",
    description:
      "Full-size FG800 acoustic, recently restrung. Good for practice or a campfire. Tuner clip included.",
    category: "music",
    condition: "Good",
    pricePerDay: 5,
    depositAmount: 50,
    location: "Arts Building",
    availability: "on_loan",
    createdAt: "2026-10-20",
  },
  {
    id: "l-6",
    ownerId: "u-maya",
    title: "Instant Pot Duo 6qt",
    description:
      "Pressure cooker / slow cooker / rice cooker. Ideal for meal prep weeks. Cleaned after every use.",
    category: "kitchen",
    condition: "Like new",
    pricePerDay: 2,
    depositAmount: 20,
    location: "North Campus",
    availability: "available",
    createdAt: "2026-11-02",
  },
  {
    id: "l-7",
    ownerId: "u-priya",
    title: "Cordless drill & bit set",
    description:
      "18V DeWalt drill with two batteries and a 30-piece bit set. Great for move-in day or hanging shelves.",
    category: "tools",
    condition: "Good",
    pricePerDay: 4,
    depositAmount: 30,
    location: "Engineering Hall",
    availability: "available",
    createdAt: "2026-10-25",
  },
  {
    id: "l-8",
    ownerId: "u-jordan",
    title: "Canon EOS M50 + 50mm f/1.8",
    description:
      "Mirrorless body with the nifty-fifty for portraits. Flip screen for vlogging. One battery and a strap.",
    category: "cameras",
    condition: "Like new",
    pricePerDay: 15,
    depositAmount: 100,
    location: "Main Quad",
    availability: "available",
    createdAt: "2026-11-04",
  },
  {
    id: "l-9",
    ownerId: "u-lucas",
    title: "Spalding indoor/outdoor basketball",
    description: "Size 7. Free to borrow for pickup games at the rec centre.",
    category: "sports",
    condition: "Good",
    pricePerDay: null,
    depositAmount: null,
    location: "South Residences",
    availability: "available",
    createdAt: "2026-10-18",
  },
  {
    id: "l-10",
    ownerId: "u-maya",
    title: "TI-84 Plus CE graphing calculator",
    description:
      "Approved for most exams. Charging cable included. Free for midterm season.",
    category: "electronics",
    condition: "Good",
    pricePerDay: null,
    depositAmount: 15,
    location: "North Campus",
    availability: "available",
    createdAt: "2026-10-29",
  },
  {
    id: "l-11",
    ownerId: "u-aiko",
    title: "Portable Bluetooth speaker (JBL Flip 6)",
    description:
      "Waterproof, 12-hour battery. Good for study-group breaks or a beach day.",
    category: "electronics",
    condition: "Like new",
    pricePerDay: 3,
    depositAmount: 25,
    location: "Arts Building",
    availability: "available",
    createdAt: "2026-11-05",
  },
  {
    id: "l-12",
    ownerId: "u-sam",
    title: "Organic Chemistry (Klein, 3rd ed.) + solutions manual",
    description:
      "Both books for CHEM 233. Clean pages. Small fee to cover wear.",
    category: "textbooks",
    condition: "Like new",
    pricePerDay: 1,
    depositAmount: 20,
    location: "Library District",
    availability: "paused",
    createdAt: "2026-10-22",
  },
];

export const wantedPosts: WantedPost[] = [
  {
    id: "w-1",
    userId: "u-maya",
    title: "Camera for a weekend trip",
    description:
      "Heading to Tofino for the weekend and want something better than my phone for landscapes. Mirrorless preferred.",
    category: "cameras",
    budgetPerDay: 15,
    startDate: "2026-11-14",
    endDate: "2026-11-16",
    status: "open",
    createdAt: "2026-11-05",
  },
  {
    id: "w-2",
    userId: "u-sam",
    title: "Mechanical keyboard for three days",
    description:
      "Trying one out before I buy. Quiet-ish switches please, I work in the library.",
    category: "electronics",
    budgetPerDay: 5,
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    status: "open",
    createdAt: "2026-11-06",
  },
  {
    id: "w-3",
    userId: "u-lucas",
    title: "Camping stove for reading week",
    description:
      "Need a small backpacking stove for a 2-night hike. I have my own fuel.",
    category: "outdoor",
    budgetPerDay: 4,
    startDate: "2026-11-20",
    endDate: "2026-11-22",
    status: "open",
    createdAt: "2026-11-04",
  },
  {
    id: "w-4",
    userId: "u-aiko",
    title: "Projector for a movie night",
    description:
      "Hosting a floor movie night Friday. Anything with HDMI works.",
    category: "electronics",
    budgetPerDay: null,
    startDate: "2026-11-13",
    endDate: "2026-11-13",
    status: "open",
    createdAt: "2026-11-06",
  },
];

/** Precomputed suggestions standing in for Gemini output in the mockup. */
export const mockMatches: Record<string, MatchSuggestion[]> = {
  "w-1": [
    {
      listingId: "l-1",
      score: 0.94,
      reason:
        "Mirrorless with a versatile 16–50mm zoom — well suited to landscapes. Available for your dates and $12/day is under your $15 budget.",
    },
    {
      listingId: "l-8",
      score: 0.86,
      reason:
        "Excellent image quality, but the 50mm prime is better for portraits than wide landscapes. $15/day matches your budget exactly.",
    },
  ],
  "w-2": [
    {
      listingId: "l-2",
      score: 0.97,
      reason:
        "Tactile brown switches are among the quieter mechanical options, which fits library use. $3/day is well under budget.",
    },
  ],
  "w-3": [
    {
      listingId: "l-3",
      score: 0.58,
      reason:
        "No stoves are listed right now. This tent is from the same category and could complete your trip setup — consider asking the owner if they have a stove too.",
    },
  ],
  "w-4": [],
};

export const rentalRequests: RentalRequest[] = [
  {
    id: "r-1",
    listingId: "l-1",
    borrowerId: "u-maya",
    startDate: "2026-11-14",
    endDate: "2026-11-16",
    status: "accepted",
    message:
      "Hi Jordan! Taking it to Tofino this weekend, will keep it in a dry bag.",
    createdAt: "2026-11-05",
  },
  {
    id: "r-2",
    listingId: "l-6",
    borrowerId: "u-lucas",
    startDate: "2026-11-09",
    endDate: "2026-11-11",
    status: "pending",
    message:
      "Meal prepping for midterms — can pick up from North Campus anytime after 4pm.",
    createdAt: "2026-11-06",
  },
  {
    id: "r-3",
    listingId: "l-10",
    borrowerId: "u-sam",
    startDate: "2026-11-08",
    endDate: "2026-11-15",
    status: "pending",
    message: "Need it for my STAT midterm on the 12th. Thank you!",
    createdAt: "2026-11-06",
  },
  {
    id: "r-4",
    listingId: "l-3",
    borrowerId: "u-maya",
    startDate: "2026-10-24",
    endDate: "2026-10-26",
    status: "completed",
    message: "Weekend at Garibaldi!",
    createdAt: "2026-10-18",
  },
  {
    id: "r-5",
    listingId: "l-6",
    borrowerId: "u-aiko",
    startDate: "2026-11-01",
    endDate: "2026-11-03",
    status: "completed",
    message: "Thanks for lending!",
    createdAt: "2026-10-28",
  },
  {
    id: "r-6",
    listingId: "l-2",
    borrowerId: "u-maya",
    startDate: "2026-11-18",
    endDate: "2026-11-20",
    status: "rejected",
    message: "Would love to try it for a hackathon.",
    createdAt: "2026-11-02",
  },
];

export function getProfile(id: string): Profile | undefined {
  return profiles.find((p) => p.id === id);
}

export function getListing(id: string): Listing | undefined {
  return listings.find((l) => l.id === id);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getWantedPost(id: string): WantedPost | undefined {
  return wantedPosts.find((w) => w.id === id);
}
