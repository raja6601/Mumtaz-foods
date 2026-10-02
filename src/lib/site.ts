export const SITE = {
  name: "Mumtaz Foods",
  phone: "+92 51 5181635",
  phoneHref: "tel:+925151816 35".replace(/\s/g, ""),
  address:
    "Shop A-305, Dhok Hasu Road, Hafizabad, Westridge, Rawalpindi, Punjab, Pakistan",
  city: "Rawalpindi",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Mumtaz+Foods+Dhok+Hasu+Road+Westridge+Rawalpindi",
  timezone: "Asia/Karachi",
  cuisine: "Pakistani",
} as const;

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function telHref(phone?: string | null) {
  return `tel:${(phone ?? SITE.phone).replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(number: string | null | undefined, message?: string) {
  if (!number) return null;
  const digits = number.replace(/[^\d]/g, "");
  if (!digits) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) return "Price on request";
  return `Rs. ${Number(value).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export type OpeningHour = {
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
};

export type OpenState = {
  isOpen: boolean;
  label: string;
  nextChange: string | null;
};

/** Current time in Asia/Karachi as { day, minutes }. */
export function karachiNow(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const hour = Number(get("hour"));
  return {
    day: weekdayMap[get("weekday")] ?? 0,
    minutes: (hour === 24 ? 0 : hour) * 60 + Number(get("minute")),
  };
}

function toMinutes(time: string | null) {
  if (!time) return null;
  const [h, m] = time.split(":");
  return Number(h) * 60 + Number(m ?? 0);
}

export function formatTime(time: string | null) {
  const mins = toMinutes(time);
  if (mins === null) return "—";
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Works out open/closed using the restaurant's own timezone. */
export function getOpenState(hours: OpeningHour[], now: Date = new Date()): OpenState {
  if (!hours.length) return { isOpen: false, label: "Hours not set", nextChange: null };
  const { day, minutes } = karachiNow(now);
  const byDay = new Map(hours.map((h) => [h.day_of_week, h]));

  const today = byDay.get(day);
  if (today && !today.is_closed) {
    const open = toMinutes(today.opens_at);
    const close = toMinutes(today.closes_at);
    if (open !== null && close !== null) {
      const overnight = close <= open;
      const openNow = overnight
        ? minutes >= open || minutes < close
        : minutes >= open && minutes < close;
      if (openNow) {
        return {
          isOpen: true,
          label: "Open now",
          nextChange: `Closes ${formatTime(today.closes_at)}`,
        };
      }
      if (minutes < open) {
        return {
          isOpen: false,
          label: "Closed now",
          nextChange: `Opens today at ${formatTime(today.opens_at)}`,
        };
      }
    }
  }

  for (let i = 1; i <= 7; i++) {
    const next = byDay.get((day + i) % 7);
    if (next && !next.is_closed && next.opens_at) {
      const dayLabel = i === 1 ? "tomorrow" : DAY_NAMES[(day + i) % 7];
      return {
        isOpen: false,
        label: "Closed now",
        nextChange: `Opens ${dayLabel} at ${formatTime(next.opens_at)}`,
      };
    }
  }
  return { isOpen: false, label: "Closed now", nextChange: null };
}

export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  delivery: ["received", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"],
  pickup: ["received", "confirmed", "preparing", "ready_for_pickup", "picked_up"],
};

export const STATUS_LABELS: Record<string, string> = {
  received: "Order received",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  picked_up: "Picked up",
  cancelled: "Cancelled",
};

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash on delivery / pickup", enabled: true },
  { value: "bank_transfer", label: "Bank transfer", enabled: true },
  { value: "easypaisa", label: "Easypaisa", enabled: false },
  { value: "jazzcash", label: "JazzCash", enabled: false },
  { value: "card", label: "Card payment", enabled: false },
];
