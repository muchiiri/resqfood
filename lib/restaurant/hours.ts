export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export type OpenInterval = { open: string; close: string };

// Stored shape: an absent key means closed.
export type OpeningHours = Partial<Record<DayKey, OpenInterval>>;

export type DayFormValue = { closed: boolean; open: string; close: string };

export type RestaurantValues = {
  businessName: string;
  address: string;
  hours: Record<DayKey, DayFormValue>;
};

// One line per day, Monday first, for showing a restaurant's stored hours to other people.
export function formatOpeningHours(hours: OpeningHours): { day: string; text: string }[] {
  return DAY_KEYS.map((key) => {
    const interval = hours[key];
    return { day: DAY_LABELS[key], text: interval ? `${interval.open} to ${interval.close}` : "Closed" };
  });
}

export const emptyHours = (): Record<DayKey, DayFormValue> =>
  Object.fromEntries(DAY_KEYS.map((day) => [day, { closed: true, open: "", close: "" }])) as Record<
    DayKey,
    DayFormValue
  >;
