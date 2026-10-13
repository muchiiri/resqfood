import Link from "next/link";

export type SectionTab = { id: string; label: string; href: string };

// A minimal tab header made of links: the active tab has a line under it. Each tab is its own page or view.
export function SectionTabs({
  label,
  tabs,
  active,
  className = "",
}: {
  label: string;
  tabs: readonly SectionTab[];
  active: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={`flex max-w-2xl gap-6 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {tabs.map(({ id, label: text, href }) => (
        <Link
          key={id}
          href={href}
          aria-current={active === id ? "page" : undefined}
          className={`-mb-px inline-flex min-h-11 shrink-0 items-center whitespace-nowrap border-b-2 px-1 text-sm font-semibold outline-none focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 ${
            active === id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {text}
        </Link>
      ))}
    </nav>
  );
}

export const MY_FOOD_TABS: readonly SectionTab[] = [
  { id: "pantry", label: "My Food", href: "/my-food" },
  { id: "listings", label: "My listings", href: "/listings" },
  { id: "claims", label: "My claims", href: "/claims" },
  { id: "waste-log", label: "Waste log", href: "/waste-log" },
];
