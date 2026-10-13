import type { ReactNode } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  AppleArt,
  BagArt,
  BasketArt,
  CarrotArt,
  LoafArt,
  MilkArt,
  PlateArt,
  ShopArt,
  SproutArt,
} from "@/app/components/illustrations";
import { ScrollRow } from "@/app/components/scroll-row";
import type { Role } from "@/lib/auth/roles";

const focusRing = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

type Message = { href: string; title: string; text: string; art: ReactNode; className: string; textClass: string };

// Three short messages in the app's voice. Fixed copy: no user text or live numbers. One solid card, two soft tints.
function messagesFor(role: Role): Message[] {
  const restaurant = role === "restaurant";
  return [
    {
      href: "/listings/new",
      title: restaurant ? "Post your end-of-day surplus" : "Share what you will not finish",
      text: restaurant ? "Turn unsold meals into a listing." : "Post it in a minute and let someone nearby collect it.",
      art: <BasketArt className="size-12 sm:size-14" />,
      className: "bg-primary text-primary-foreground",
      textClass: "text-primary-foreground",
    },
    {
      href: "/my-food",
      title: "Use it before it expires",
      text: "See what in your pantry needs eating first.",
      art: <AppleArt className="size-12 sm:size-14" />,
      className: "bg-expiring-tint text-foreground",
      textClass: "text-muted-foreground",
    },
    {
      href: "/waste-stats",
      title: "Good food. Second chances.",
      text: "See how much you have saved and shared.",
      art: <SproutArt className="size-12 sm:size-14" />,
      className: "bg-fresh-tint text-foreground",
      textClass: "text-muted-foreground",
    },
  ];
}

export function MessageCards({ role }: { role: Role }) {
  const items = messagesFor(role).map(({ href, title, text, art, className, textClass }) => (
    <Link
      key={href}
      href={href}
      className={`flex h-full w-[min(17rem,78vw)] items-center gap-3 rounded-2xl p-3 sm:w-72 sm:p-4 ${className} ${focusRing}`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold leading-snug sm:text-base">{title}</span>
        <span className={`mt-1 block text-xs sm:text-sm ${textClass}`}>{text}</span>
      </span>
      <span className="shrink-0">{art}</span>
    </Link>
  ));
  return <ScrollRow id="messages" label="Messages" items={items} />;
}

const CATEGORIES: { label: string; href: string; art: ReactNode; className: string }[] = [
  { label: "Meals", href: "/find-food?cat=cooked_meals", art: <PlateArt />, className: "bg-today-tint" },
  { label: "Bakery", href: "/find-food?cat=bakery", art: <LoafArt />, className: "bg-expiring-tint" },
  { label: "Produce", href: "/find-food?cat=produce", art: <CarrotArt />, className: "bg-fresh-tint" },
  { label: "Dairy", href: "/find-food?cat=dairy", art: <MilkArt />, className: "bg-primary-tint" },
  { label: "Groceries", href: "/find-food?cat=dry_goods", art: <BagArt />, className: "bg-expiring-tint" },
  { label: "Restaurants", href: "/find-food?type=restaurants", art: <ShopArt />, className: "bg-today-tint" },
];

export function CategoryCards() {
  const items = CATEGORIES.map(({ label, href, art, className }) => (
    <Link
      key={label}
      href={href}
      className={`flex h-full w-28 flex-col items-center gap-2 rounded-2xl p-3 text-center text-foreground ${className} ${focusRing}`}
    >
      {art}
      <span className="text-sm font-bold">{label}</span>
    </Link>
  ));
  return <ScrollRow id="categories" label="categories" heading="Browse by category" items={items} />;
}

// A plain GET form into Find Food's own search. It works without JavaScript and uses the same 50 character limit.
export function HomeSearch() {
  return (
    <form action="/find-food" method="get" role="search" className="flex max-w-2xl gap-2">
      <label className="relative flex-1">
        <span className="sr-only">Search food by title or area</span>
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          name="q"
          maxLength={50}
          placeholder="Search food or an area"
          className="h-12 w-full rounded-full border bg-card pl-10 pr-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      <button
        type="submit"
        className="h-12 shrink-0 rounded-full bg-primary px-5 font-bold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Search
      </button>
    </form>
  );
}
