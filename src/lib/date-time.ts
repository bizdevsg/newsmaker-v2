export const JAKARTA_TIME_ZONE = "Asia/Jakarta";

type DateInput = string | number | Date | null | undefined;

type BaseFormatOptions = {
  fallback?: string;
};

type DateFormatOptions = BaseFormatOptions & {
  day?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "short" | "long";
  year?: "numeric" | "2-digit";
  weekday?: "narrow" | "short" | "long";
};

type TimeFormatOptions = BaseFormatOptions & {
  separator?: ":" | ".";
  includeSeconds?: boolean;
};

type DateTimeFormatOptions = DateFormatOptions &
  TimeFormatOptions & {
    dateTimeSeparator?: string;
  };

const getLocaleCode = (locale: string) => (locale === "en" ? "en-US" : "id-ID");

const parseDateInput = (value: DateInput) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDatePart = (
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) => parts.find((part) => part.type === type)?.value;

export const formatJakartaDate = (
  value: DateInput,
  locale: string,
  options: DateFormatOptions = {},
) => {
  const parsed = parseDateInput(value);
  const fallback = options.fallback ?? "";

  if (!parsed) {
    return typeof value === "string" && value.trim() ? value : fallback;
  }

  const dateParts = new Intl.DateTimeFormat(getLocaleCode(locale), {
    weekday: options.weekday,
    day: options.day ?? "numeric",
    month: options.month ?? "short",
    year: options.year ?? "numeric",
    timeZone: JAKARTA_TIME_ZONE,
  }).formatToParts(parsed);

  const weekday = getDatePart(dateParts, "weekday");
  const day = getDatePart(dateParts, "day");
  const month = getDatePart(dateParts, "month");
  const year = getDatePart(dateParts, "year");

  if (!day || !month || !year) {
    return fallback;
  }

  return weekday ? `${weekday}, ${day} ${month} ${year}` : `${day} ${month} ${year}`;
};

export const formatJakartaTime = (
  value: DateInput,
  locale: string,
  options: TimeFormatOptions = {},
) => {
  const parsed = parseDateInput(value);
  const fallback = options.fallback ?? "";

  if (!parsed) {
    return fallback;
  }

  const timeParts = new Intl.DateTimeFormat(getLocaleCode(locale), {
    hour: "2-digit",
    minute: "2-digit",
    second: options.includeSeconds ? "2-digit" : undefined,
    hour12: false,
    timeZone: JAKARTA_TIME_ZONE,
  }).formatToParts(parsed);

  const hour = getDatePart(timeParts, "hour");
  const minute = getDatePart(timeParts, "minute");
  const second = getDatePart(timeParts, "second");

  if (!hour || !minute) {
    return fallback;
  }

  const separator = options.separator ?? ".";
  return second
    ? `${hour}${separator}${minute}${separator}${second}`
    : `${hour}${separator}${minute}`;
};

export const formatJakartaDateTime = (
  value: DateInput,
  locale: string,
  options: DateTimeFormatOptions = {},
) => {
  const fallback = options.fallback ?? "";
  const date = formatJakartaDate(value, locale, options);
  const time = formatJakartaTime(value, locale, options);

  if (!date && !time) return fallback;
  if (!date) return time;
  if (!time) return date;

  return `${date}${options.dateTimeSeparator ?? " - "}${time}`;
};

export const formatJakartaMonthYear = (
  month: number | undefined,
  year: number | undefined,
  locale: string,
  monthStyle: "short" | "long" = "long",
) => {
  if (!month || !year) return undefined;

  const date = new Date(Date.UTC(year, month - 1, 1));
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat(getLocaleCode(locale), {
    month: monthStyle,
    year: "numeric",
    timeZone: JAKARTA_TIME_ZONE,
  }).format(date);
};
