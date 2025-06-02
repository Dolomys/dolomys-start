import { z } from "zod";

// Define an enum for referrer types
enum ReferrerType {
  DIRECT = "direct",
  SOCIAL = "social",
  SEARCH = "search",
}

// Add local storage keys here
export const localeStorageKeys = {
  referrerId: "referrer_id",
  recentSearches: "keendom-recent-searches",
} as const;

export const createLocalStorage = <T>(key: string, schema: z.ZodType<T>) => {
  const get = (defaultValue: T | null = null): T | null => {
    if (typeof window === "undefined") return defaultValue;
    const value = localStorage.getItem(key);
    if (!value) return defaultValue;

    try {
      const parsed = JSON.parse(value);
      return schema.parse(parsed);
    } catch (error) {
      console.error("Failed to parse localStorage item:", error);
      return defaultValue;
    }
  };

  const set = (value: T): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  };

  return { get, set };
};

// Create a schema using the enum
const referrerIdSchema = z.nativeEnum(ReferrerType);
// Create local storage utility
export const referrerIdStorage = createLocalStorage("referrerId", referrerIdSchema);
