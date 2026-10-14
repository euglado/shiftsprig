import assert from "node:assert/strict";
import test from "node:test";
import { Store } from "../src/store.js";

const binding = { user: "u", guild: "g", channel: "c" };
function fixture() {
  let time = 1;
  const store = new Store(() => time);
  return {
    store,
    set: (n: number) => {
      time = n;
    },
  };
}
test("secure nonce is 36 lowercase hex and changes", () => {
  const s = new Store();
  const a = s.create(binding, "x", "en");
  const b = s.create(binding, "x", "en");
  assert.match(a ?? "", /^[a-f0-9]{36}$/);
  assert.notEqual(a, b);
});
test("draft cannot be consumed until message is bound", () => {
  const { store } = fixture();
  const id = store.create(binding, "x", "en") ?? "";
  assert.equal(store.take(id, binding, "m"), undefined);
  assert.equal(store.drafts.size, 1);
});
for (const field of ["user", "guild", "channel"] as const)
  test(`wrong ${field} cannot consume legitimate draft`, () => {
    const { store } = fixture();
    const id = store.create(binding, "x", "tr") ?? "";
    store.bind(id, "m");
    assert.equal(
      store.take(id, { ...binding, [field]: "other" }, "m"),
      undefined,
    );
    assert.equal(store.take(id, binding, "m")?.lang, "tr");
  });
test("wrong message cannot consume draft; correct message is single-use", () => {
  const s = new Store();
  const id = s.create(binding, "x", "en") ?? "";
  s.bind(id, "m");
  assert.equal(s.take(id, binding, "other"), undefined);
  assert.equal(s.take(id, binding, "m")?.content, "x");
  assert.equal(s.take(id, binding, "m"), undefined);
});
test("expires at exactly five minutes and prunes cooldowns", () => {
  const { store, set } = fixture();
  const id = store.create(binding, "x", "en") ?? "";
  store.bind(id, "m");
  store.cooldown(store.users, "u", 5000);
  set(300001);
  assert.equal(store.take(id, binding, "m"), undefined);
  assert.equal(store.drafts.size, 0);
  assert.equal(store.users.size, 0);
});
test("capacity of drafts is bounded and becomes available after expiry", () => {
  const { store, set } = fixture();
  for (let i = 0; i < 100; i++) assert.ok(store.create(binding, "x", "en"));
  assert.equal(store.create(binding, "x", "en"), undefined);
  set(300001);
  assert.ok(store.create(binding, "x", "en"));
  assert.equal(store.drafts.size, 1);
});
test("cooldown blocks duplicates but admits at expiry", () => {
  const { store, set } = fixture();
  assert.equal(store.cooldown(store.channels, "c", 60000), true);
  set(60000);
  assert.equal(store.cooldown(store.channels, "c", 60000), false);
  set(60001);
  assert.equal(store.cooldown(store.channels, "c", 60000), true);
});
test("cooldown maps bounded at 500 records with recovery", () => {
  const { store, set } = fixture();
  for (let i = 0; i < 500; i++)
    assert.equal(store.cooldown(store.users, String(i), 5000), true);
  assert.equal(store.cooldown(store.users, "extra", 5000), false);
  set(5001);
  assert.equal(store.cooldown(store.users, "extra", 5000), true);
  assert.equal(store.users.size, 1);
});
test("collision or malformed nonce fails closed", () => {
  const s = new Store(Date.now, () => "a".repeat(36));
  s.create(binding, "x", "en");
  assert.throws(() => s.create(binding, "x", "en"));
  assert.throws(() =>
    new Store(Date.now, () => "bad").create(binding, "x", "en"),
  );
});
