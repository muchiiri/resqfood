export const FOOD_PREFERENCES = [
  "halal",
  "vegetarian",
  "vegan",
  "gluten_free",
  "nut_allergy",
  "dairy_free",
] as const;
export type FoodPreference = (typeof FOOD_PREFERENCES)[number];

export const FOOD_PREFERENCE_LABELS: Record<FoodPreference, string> = {
  halal: "Halal",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  gluten_free: "Gluten-free",
  nut_allergy: "Nut allergy",
  dairy_free: "Dairy-free",
};

export const isFoodPreference = (value: unknown): value is FoodPreference =>
  typeof value === "string" && (FOOD_PREFERENCES as readonly string[]).includes(value);

export const NOTIFICATION_KEYS = ["expiry", "nearby", "claims"] as const;
export type NotificationKey = (typeof NOTIFICATION_KEYS)[number];

export const NOTIFICATION_LABELS: Record<NotificationKey, string> = {
  expiry: "Expiry reminders",
  nearby: "New nearby listings",
  claims: "Claims on my listings",
};

export type Notifications = Record<NotificationKey, boolean>;

export type ProfileValues = {
  name: string;
  location: string;
  householdSize: string;
  foodPreferences: FoodPreference[];
  notifications: Notifications;
};
