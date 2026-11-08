import {
  BookOpen,
  Camera,
  CookingPot,
  Dumbbell,
  Guitar,
  Laptop,
  type LucideIcon,
  Tent,
  Wrench,
} from "lucide-react";

import type { CategorySlug } from "@/lib/mock-data";

const icons: Record<CategorySlug, LucideIcon> = {
  electronics: Laptop,
  cameras: Camera,
  textbooks: BookOpen,
  outdoor: Tent,
  music: Guitar,
  kitchen: CookingPot,
  tools: Wrench,
  sports: Dumbbell,
};

export function CategoryIcon({
  category,
  className,
  strokeWidth = 1.75,
}: {
  category: CategorySlug;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = icons[category];
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
