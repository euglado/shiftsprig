import assert from "node:assert/strict";
import test from "node:test";
import { makePlan, parseStart, renderPlan, safeTitle } from "../src/plan.js";

const input = {
  title: "Garden volunteers",
  start: "2026-10-15T10:00+03:00",
  count: 3,
  minutes: 30,
  gap: 10,
};
test("explicit offsets denote the same instant", () => {
  const utc = Date.UTC(2026, 9, 15, 7) / 1000;
  for (const value of [
    "2026-10-15T10:00+03:00",
    "2026-10-15T07:00Z",
    "2026-10-15T03:30-03:30",
    "2026-10-15T21:00+14:00",
    "2026-10-14T17:00-14:00",
  ])
    assert.equal(parseStart(value), utc);
});
for (const value of [
  "2026-10-15T10:00",
  "2026-10-15 10:00Z",
  "2026-02-29T10:00Z",
  "2100-02-29T10:00Z",
  "2024-02-30T10:00Z",
  "2026-04-31T10:00Z",
  "2026-00-15T10:00Z",
  "2026-13-15T10:00Z",
  "2026-01-00T10:00Z",
  "2026-01-32T10:00Z",
  "2026-01-01T24:00Z",
  "2026-01-01T10:60Z",
  "2026-01-01T10:00+14:01",
  "2026-01-01T10:00-15:00",
  "2026-01-01T10:00+01:60",
  "2026-01-01T10:00-00:00",
  "1999-12-31T23:00Z",
  "2101-01-01T00:00Z",
  "2000-01-01T00:00+01:00",
  "2100-12-31T23:59-01:00",
  "2026-01-01T10:00:00Z",
  "2026-1-01T10:00Z",
  " 2026-01-01T10:00Z",
  "2026-01-01T10:00z",
  "",
  "NaN",
]) {
  test(`reject invalid or ambiguous start ${JSON.stringify(value)}`, () =>
    assert.throws(() => parseStart(value)));
}
test("leap day and zero positive offset are valid", () => {
  assert.equal(
    parseStart("2024-02-29T00:00+00:00"),
    Date.UTC(2024, 1, 29) / 1000,
  );
  assert.equal(parseStart("2000-02-29T00:00Z"), Date.UTC(2000, 1, 29) / 1000);
});
test("gaps appear only between fixed-duration shifts", () => {
  const p = makePlan(input);
  const start = parseStart(input.start);
  assert.deepEqual(p.slots, [
    { start, end: start + 1800 },
    { start: start + 2400, end: start + 4200 },
    { start: start + 4800, end: start + 6600 },
  ]);
});
test("one shift has no trailing gap and crosses midnight correctly", () => {
  const p = makePlan({
    ...input,
    start: "2026-10-15T23:50Z",
    count: 1,
    minutes: 20,
    gap: 60,
  });
  assert.equal(p.slots[0]?.end, Date.UTC(2026, 9, 16, 0, 10) / 1000);
});
test("schedule stays in supported UTC range including end", () =>
  assert.throws(() => makePlan({ ...input, start: "2100-12-31T23:59Z" })));
for (const [field, value] of [
  ["count", 0],
  ["count", 13],
  ["count", 1.5],
  ["minutes", 4],
  ["minutes", 241],
  ["minutes", Number.NaN],
  ["gap", -1],
  ["gap", 61],
  ["gap", Number.POSITIVE_INFINITY],
] as const) {
  test(`reject ${field}=${value}`, () =>
    assert.throws(() => makePlan({ ...input, [field]: value })));
}
for (const title of [
  "",
  "   ",
  "x".repeat(81),
  "a\nb",
  "a\tb",
  "a\u202eb",
  "a\u200bb",
  "a\u2028b",
  "a\u2029b",
  "a\ud800b",
])
  test(`reject unsafe title ${JSON.stringify(title)}`, () =>
    assert.throws(() => makePlan({ ...input, title })));
test("safe title neutralizes mentions, markdown, and timestamp injection", () => {
  const s = safeTitle("@everyone <t:1:f> [click](https://x.test) **hi**");
  assert.ok(!s.includes("@everyone"));
  assert.ok(!s.includes("<t:"));
  assert.ok(s.includes("\\[click\\]"));
  assert.ok(s.includes("\\*\\*hi"));
});
test("maximum bilingual cards fit Discord content limits and contain every slot", () => {
  const p = makePlan({
    ...input,
    title: "*".repeat(80),
    count: 12,
    minutes: 240,
    gap: 60,
  });
  for (const lang of ["en", "tr"] as const) {
    const text = renderPlan(p, lang);
    assert.ok(text.length <= 1800);
    assert.equal((text.match(/<t:/g) ?? []).length, 24);
    for (const slot of p.slots) {
      assert.ok(text.includes(`<t:${slot.start}:f>`));
      assert.ok(text.includes(`<t:${slot.end}:f>`));
    }
  }
});
test("start across a DST transition uses elapsed time rather than wall-clock arithmetic", () => {
  const p = makePlan({
    ...input,
    start: "2026-10-25T02:30+02:00",
    count: 2,
    minutes: 60,
    gap: 0,
  });
  assert.equal((p.slots[1]?.end ?? 0) - (p.slots[0]?.start ?? 0), 7200);
});
