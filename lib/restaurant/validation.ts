import { DAY_KEYS, type DayFormValue, type DayKey, type OpeningHours } from "./hours";

export const MAX_BUSINESS_NAME_LENGTH = 100;
export const MAX_ADDRESS_LENGTH = 200;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export type RestaurantFieldErrors = Partial<Record<"businessName" | "address" | "hours" | `hours.${DayKey}`, string>>;

export type RestaurantInput = {
  businessName: string;
  address: string;
  hours: Record<DayKey, DayFormValue>;
};

export type ValidRestaurant = { businessName: string; address: string; openingHours: OpeningHours };

export function validateRestaurant(input: RestaurantInput): {
  fieldErrors: RestaurantFieldErrors;
  valid?: ValidRestaurant;
} {
  const fieldErrors: RestaurantFieldErrors = {};
  const businessName = input.businessName.trim();
  const address = input.address.trim();

  if (!businessName) fieldErrors.businessName = "Enter your business name.";
  else if (businessName.length > MAX_BUSINESS_NAME_LENGTH)
    fieldErrors.businessName = `Use at most ${MAX_BUSINESS_NAME_LENGTH} characters.`;

  if (!address) fieldErrors.address = "Enter your address.";
  else if (address.length > MAX_ADDRESS_LENGTH) fieldErrors.address = `Use at most ${MAX_ADDRESS_LENGTH} characters.`;

  const openingHours: OpeningHours = {};
  for (const day of DAY_KEYS) {
    const { closed, open, close } = input.hours[day];
    if (closed) continue;
    if (!TIME_PATTERN.test(open) || !TIME_PATTERN.test(close)) {
      fieldErrors[`hours.${day}`] = "Enter both an opening and a closing time.";
    } else if (open === close) {
      fieldErrors[`hours.${day}`] = "Opening and closing times must be different.";
    } else {
      openingHours[day] = { open, close };
    }
  }

  const hasDayError = DAY_KEYS.some((day) => fieldErrors[`hours.${day}`]);
  if (!hasDayError && Object.keys(openingHours).length === 0) fieldErrors.hours = "Choose at least one open day.";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
  return { fieldErrors, valid: { businessName, address, openingHours } };
}
