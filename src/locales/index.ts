import en from "./en.json";
import id from "./id.json";

export type Locale = "en" | "id";

export const messages = {
  en,
  id,
} as const;

export type Messages = typeof messages.en;

export function getMessages(locale?: string) {
  if (locale === "en") {
    return messages.en;
  }
  return messages.id;
}
