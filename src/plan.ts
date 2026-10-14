export type Language = "tr" | "en";
export const words = (lang: Language, tr: string, en: string) =>
  lang === "tr" ? tr : en;
export class InputError extends Error {}
export interface Input {
  title: string;
  start: string;
  count: number;
  minutes: number;
  gap: number;
}
export interface Slot {
  start: number;
  end: number;
}
export interface Plan {
  title: string;
  slots: Slot[];
  minutes: number;
  gap: number;
}
export const MIN_TIME = Date.UTC(2000, 0, 1) / 1000;
export const MAX_TIME = Date.UTC(2101, 0, 1) / 1000 - 1;

export function parseStart(value: string): number {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) throw new InputError("start");
  const [, y, mo, d, h, mi, zone] = match;
  const year = Number(y),
    month = Number(mo),
    day = Number(d),
    hour = Number(h),
    minute = Number(mi);
  if (year < 2000 || year > 2100 || hour > 23 || minute > 59)
    throw new InputError("start");
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const date = new Date(wall);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    throw new InputError("start");
  let offset = 0;
  if (zone !== "Z") {
    const z = zone ?? "";
    const zh = Number(z.slice(1, 3)),
      zm = Number(z.slice(4, 6));
    if (zh > 14 || zm > 59 || (zh === 14 && zm !== 0) || z === "-00:00")
      throw new InputError("start");
    offset = (zh * 60 + zm) * (z.startsWith("+") ? 1 : -1);
  }
  const seconds = wall / 1000 - offset * 60;
  if (seconds < MIN_TIME || seconds > MAX_TIME) throw new InputError("start");
  return seconds;
}

export function makePlan(input: Input): Plan {
  const title = input.title.trim();
  if (
    !title ||
    title.length > 80 ||
    /[\p{Cc}\p{Cf}\p{Cs}\p{Zl}\p{Zp}]/u.test(title)
  )
    throw new InputError("title");
  for (const [value, min, max] of [
    [input.count, 1, 12],
    [input.minutes, 5, 240],
    [input.gap, 0, 60],
  ]) {
    if (
      value === undefined ||
      min === undefined ||
      max === undefined ||
      !Number.isInteger(value) ||
      value < min ||
      value > max
    )
      throw new InputError("numbers");
  }
  const start = parseStart(input.start);
  const slots = Array.from({ length: input.count }, (_, i) => {
    const begin = start + i * (input.minutes + input.gap) * 60;
    return { start: begin, end: begin + input.minutes * 60 };
  });
  if (slots.some((s) => s.end > MAX_TIME)) throw new InputError("start");
  return { title, slots, minutes: input.minutes, gap: input.gap };
}

export function safeTitle(value: string): string {
  return value
    .replace(/[@<>]/g, (c) => ({ "@": "＠", "<": "＜", ">": "＞" })[c] ?? c)
    .replace(/[\\`*_{}[\]()#+.!|~-]/g, "\\$&");
}

export function renderPlan(plan: Plan, lang: Language): string {
  const heading = words(lang, "Gönüllü vardiya planı", "Volunteer shift plan");
  const lines = plan.slots.map(
    (s, i) => `${i + 1}. <t:${s.start}:f> → <t:${s.end}:f>`,
  );
  const detail = words(
    lang,
    `${plan.minutes} dk/vardiya; aralarda ${plan.gap} dk boşluk.`,
    `${plan.minutes} min/shift; ${plan.gap} min gap between shifts.`,
  );
  const note = words(
    lang,
    "Saatler Discord yerel saatinde. Sabit sürelerdir; son vardiyadan sonra boşluk yok. Kayıt veya hatırlatma yapılmaz.",
    "Times use your Discord local timezone. Durations are fixed; no gap after the final shift. No signups or reminders.",
  );
  const result = `${heading}: ${safeTitle(plan.title)}\n${detail}\n${lines.join("\n")}\n${note}`;
  if (result.length > 1800) throw new InputError("length");
  return result;
}

export function inputHelp(lang: Language): string {
  return words(
    lang,
    "Başlığı 1–80 görünür tek satır karakterle yazın. Başlangıç: 2026-10-15T10:00+03:00 veya 2026-10-15T07:00Z (2000–2100). Vardiya 1–12, süre 5–240 dk, boşluk 0–60 dk. Saat dilimi zorunludur; -00:00 kabul edilmez.",
    "Use a visible single-line title of 1–80 characters. Start: 2026-10-15T10:00+03:00 or 2026-10-15T07:00Z (2000–2100). Choose 1–12 shifts, 5–240 minutes each, gap 0–60 minutes. Explicit timezone required; -00:00 is not accepted.",
  );
}
