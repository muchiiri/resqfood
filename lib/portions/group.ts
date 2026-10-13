import { BASE_GRAMS, HUNGER_MULTIPLIER } from "./plan";

export const MIN_GROUP = 2;
export const MAX_GROUP = 100;

export const GROUP_FIELDS = [
  "light",
  "normal",
  "veryHungry",
  "vegetarian",
  "vegan",
  "halal",
  "glutenFree",
  "dairyFree",
  "nutAllergy",
] as const;
export type GroupField = (typeof GROUP_FIELDS)[number];

// What the form holds: every field as the user typed it.
export type GroupValues = Record<GroupField, string>;
export type ValidGroup = Record<GroupField, number>;
export type GroupFieldErrors = Partial<Record<GroupField | "group", string>>;

export const emptyGroupValues = (): GroupValues => ({
  light: "0",
  normal: "2",
  veryHungry: "0",
  vegetarian: "0",
  vegan: "0",
  halal: "0",
  glutenFree: "0",
  dairyFree: "0",
  nutAllergy: "0",
});

export type GroupLineKey =
  | "protein_vegan"
  | "protein_vegetarian"
  | "protein_regular"
  | "carbs_gluten_free"
  | "carbs_regular"
  | "vegetables";
export type GroupLine = { key: GroupLineKey; label: string; grams: number; suggestion: string };
export type GroupPlan = { totalGrams: number; groupSize: number; lines: GroupLine[]; notes: string[] };

export function validateGroup(values: GroupValues): { fieldErrors: GroupFieldErrors; valid: ValidGroup | null } {
  const fieldErrors: GroupFieldErrors = {};
  const parsed = {} as ValidGroup;
  for (const field of GROUP_FIELDS) {
    const raw = typeof values[field] === "string" ? values[field].trim() : "";
    if (/^\d{1,3}$/.test(raw)) parsed[field] = Number(raw);
    else {
      parsed[field] = 0;
      fieldErrors[field] = "Enter a whole number, 0 or more.";
    }
  }

  const size = parsed.light + parsed.normal + parsed.veryHungry;
  const hungerOk = (["light", "normal", "veryHungry"] as const).every((f) => !fieldErrors[f]);
  if (hungerOk && (size < MIN_GROUP || size > MAX_GROUP)) {
    fieldErrors.group = `The group must have ${MIN_GROUP} to ${MAX_GROUP} people in total.`;
  }

  if (hungerOk && !fieldErrors.group) {
    for (const field of GROUP_FIELDS.slice(3)) {
      if (!fieldErrors[field] && parsed[field] > size) {
        fieldErrors[field] = `This cannot be more than the ${size} people in the group.`;
      }
    }
    if (!fieldErrors.vegetarian && !fieldErrors.vegan && parsed.vegetarian + parsed.vegan > size) {
      fieldErrors.vegan = "Vegetarian and vegan together cannot be more than the group.";
    }
  }

  return Object.keys(fieldErrors).length > 0 ? { fieldErrors, valid: null } : { fieldErrors, valid: parsed };
}

const roundToTen = (grams: number) => Math.round(grams / 10) * 10;

// Splits a component total into two shares by headcount, plus the rest. Never negative, always sums to the total.
function split(total: number, a: number, b: number, size: number): [number, number, number] {
  const first = Math.min(total, roundToTen((total * a) / size));
  const second = Math.max(0, Math.min(total - first, roundToTen((total * b) / size)));
  return [first, second, total - first - second];
}

const people = (n: number, one: string, many: string) => (n === 1 ? `1 person ${one}` : `${n} ${many}`);

export function planGroup(group: ValidGroup): GroupPlan {
  const size = group.light + group.normal + group.veryHungry;
  const units =
    group.light * HUNGER_MULTIPLIER.light +
    group.normal * HUNGER_MULTIPLIER.normal +
    group.veryHungry * HUNGER_MULTIPLIER.very_hungry;
  const total = (key: keyof typeof BASE_GRAMS) => roundToTen(BASE_GRAMS[key] * units);

  const [vegan, vegetarian, regularProtein] = split(total("protein"), group.vegan, group.vegetarian, size);
  const [glutenFree, , regularCarbs] = split(total("carbs"), group.glutenFree, 0, size);

  const all: GroupLine[] = [
    { key: "protein_vegan", label: "Protein (vegan)", grams: vegan, suggestion: "Legumes, tofu or tempeh" },
    {
      key: "protein_vegetarian",
      label: "Protein (vegetarian)",
      grams: vegetarian,
      suggestion: "Eggs, dairy, legumes or tofu",
    },
    { key: "protein_regular", label: "Protein", grams: regularProtein, suggestion: "Meat, fish, eggs or legumes" },
    {
      key: "carbs_gluten_free",
      label: "Carbs (gluten-free)",
      grams: glutenFree,
      suggestion: "Rice, potatoes, corn or quinoa",
    },
    { key: "carbs_regular", label: "Carbs", grams: regularCarbs, suggestion: "Rice, pasta, bread or potatoes" },
    {
      key: "vegetables",
      label: "Vegetables",
      grams: total("vegetables"),
      suggestion: "Any mix of cooked or fresh vegetables",
    },
  ];
  const lines = all.filter((line) => line.grams > 0);

  const notes: string[] = [];
  if (group.halal > 0) {
    notes.push(`${people(group.halal, "eats halal", "eat halal")}: order halal-certified meat and check sauces.`);
  }
  if (group.dairyFree > 0) {
    notes.push(
      `${people(group.dairyFree, "is dairy-free", "are dairy-free")}: ask for sauces, dressings and sides without dairy.`,
    );
  }
  if (group.nutAllergy > 0) {
    notes.push(
      `${people(group.nutAllergy, "has a nut allergy", "have a nut allergy")}: check labels and keep nut-free dishes separate.`,
    );
  }

  return { totalGrams: lines.reduce((sum, line) => sum + line.grams, 0), groupSize: size, lines, notes };
}

// Plain text for pasting into a chat. Built only from numbers and fixed wording, never from typed text.
export function groupSummary(group: ValidGroup, plan: GroupPlan): string {
  const rows = [
    `Group meal for ${plan.groupSize} people (${group.light} light, ${group.normal} normal, ${group.veryHungry} very hungry)`,
    `Total: ${plan.totalGrams} g`,
    ...plan.lines.map((line) => `${line.label}: ${line.grams} g (${line.suggestion})`),
    ...plan.notes.map((note) => `- ${note}`),
  ];
  return rows.join("\n");
}
