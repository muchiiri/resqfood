// Simple flat food shapes for decorative cards. Each is a 64x64 SVG drawn only with theme colours (through the
// Tailwind fill and stroke utilities) and hidden from assistive technology: the card text carries the meaning.

type ArtProps = { className?: string };

const base = (className?: string) => ({
  viewBox: "0 0 64 64",
  "aria-hidden": true as const,
  focusable: false as const,
  className: className ?? "size-14",
});

export function PlateArt({ className }: ArtProps) {
  return (
    <svg {...base(className)}>
      <circle cx="32" cy="32" r="27" className="fill-card" />
      <circle cx="32" cy="32" r="19" className="fill-primary-tint" />
      <circle cx="26" cy="29" r="6" className="fill-orange" />
      <circle cx="38" cy="27" r="5" className="fill-secondary" />
      <circle cx="33" cy="38" r="5" className="fill-amber" />
    </svg>
  );
}

export function LoafArt({ className }: ArtProps) {
  return (
    <svg {...base(className)}>
      <path d="M10 38c0-12 10-20 22-20s22 8 22 20v6a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" className="fill-amber" />
      <path
        d="M22 26l5 8M32 24l5 8M42 26l5 8"
        className="stroke-card"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function CarrotArt({ className }: ArtProps) {
  return (
    <svg {...base(className)}>
      <path d="M44 22L20 52a3 3 0 0 1-5-3l8-30a8 8 0 0 1 21 3z" className="fill-orange" />
      <path d="M40 18c0-7 4-11 9-12-1 5-3 9-9 12zM44 22c5-4 10-4 14-2-3 4-8 5-14 2z" className="fill-secondary" />
    </svg>
  );
}

export function MilkArt({ className }: ArtProps) {
  return (
    <svg {...base(className)}>
      <path d="M20 14l12-8 12 8v6H20z" className="fill-primary" />
      <rect x="20" y="20" width="24" height="38" rx="3" className="fill-card" />
      <rect x="20" y="30" width="24" height="14" className="fill-secondary" />
    </svg>
  );
}

export function BagArt({ className }: ArtProps) {
  return (
    <svg {...base(className)}>
      <path
        d="M24 22c0-8 4-12 8-12s8 4 8 12"
        className="stroke-primary"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M14 22h36l-3 34a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3z" className="fill-primary" />
      <circle cx="27" cy="38" r="5" className="fill-amber" />
      <circle cx="38" cy="40" r="5" className="fill-secondary" />
    </svg>
  );
}

export function ShopArt({ className }: ArtProps) {
  return (
    <svg {...base(className)}>
      <path d="M8 24l5-12h38l5 12z" className="fill-orange" />
      <path
        d="M8 24h12v6a6 6 0 0 1-12 0zM20 24h12v6a6 6 0 0 1-12 0zM32 24h12v6a6 6 0 0 1-12 0zM44 24h12v6a6 6 0 0 1-12 0z"
        className="fill-card"
      />
      <rect x="12" y="34" width="40" height="22" rx="2" className="fill-primary-tint" />
      <rect x="28" y="42" width="10" height="14" rx="1" className="fill-primary" />
    </svg>
  );
}

export function BasketArt({ className }: ArtProps) {
  return (
    <svg {...base(className)}>
      <path
        d="M20 28c0-10 5-16 12-16s12 6 12 16"
        className="stroke-primary"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="25" cy="30" r="7" className="fill-orange" />
      <circle cx="39" cy="30" r="7" className="fill-secondary" />
      <circle cx="32" cy="26" r="7" className="fill-amber" />
      <path d="M10 34h44l-5 20a4 4 0 0 1-4 3H19a4 4 0 0 1-4-3z" className="fill-primary" />
    </svg>
  );
}

export function AppleArt({ className }: ArtProps) {
  return (
    <svg {...base(className)}>
      <path
        d="M32 20c-5-4-16-3-18 8-2 12 6 26 14 26 3 0 3-1 4-1s1 1 4 1c8 0 16-14 14-26-2-11-13-12-18-8z"
        className="fill-orange"
      />
      <path d="M32 20c0-6 2-10 7-13 1 6-1 10-7 13z" className="fill-secondary" />
    </svg>
  );
}

export function SproutArt({ className }: ArtProps) {
  return (
    <svg {...base(className)}>
      <path d="M32 54V32" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 34c-10 0-16-6-16-16 10 0 16 6 16 16z" className="fill-secondary" />
      <path d="M32 30c0-10 6-16 16-16 0 10-6 16-16 16z" className="fill-primary" />
      <ellipse cx="32" cy="55" rx="14" ry="4" className="fill-primary-tint" />
    </svg>
  );
}
