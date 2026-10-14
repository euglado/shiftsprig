import assert from "node:assert/strict";
import test from "node:test";
import { button, type Context, preview } from "../src/handler.js";
import { Store } from "../src/store.js";

const input = {
  title: "Park",
  start: "2026-10-15T10:00Z",
  count: 2,
  minutes: 30,
  gap: 0,
};
function fixture() {
  const store = new Store();
  const events: string[] = [];
  const sent: string[] = [];
  let id = "";
  const ctx: Context = {
    user: "u",
    guild: "g",
    channel: "c",
    lang: "en",
    defer: async () => {
      events.push("defer");
    },
    privateReply: async (content) => {
      events.push(`private:${content}`);
    },
    edit: async (content, draftId) => {
      events.push(`edit:${content}`);
      if (draftId) id = draftId;
      return "m";
    },
    update: async (content) => {
      events.push(`update:${content}`);
    },
    canPublish: async () => {
      events.push("permissions");
      return true;
    },
    send: async (content) => {
      events.push("send");
      sent.push(content);
    },
  };
  return { store, events, sent, ctx, id: () => id };
}
test("preview is private and never sends publicly", async () => {
  const f = fixture();
  await preview(f.ctx, input, f.store);
  assert.equal(f.events[0], "defer");
  assert.equal(f.sent.length, 0);
  assert.equal(f.store.drafts.size, 1);
  assert.equal(f.store.drafts.get(f.id())?.message, "m");
  assert.ok(f.events.some((e) => e.includes("Share publishes")));
});
test("invalid input produces actionable help and no controls", async () => {
  const f = fixture();
  await preview(f.ctx, { ...input, start: "tomorrow" }, f.store);
  assert.equal(f.store.drafts.size, 0);
  assert.equal(f.id(), "");
  assert.ok(f.events.some((e) => e.includes("Explicit timezone")));
});
test("share removes controls before permission fetch and sends once", async () => {
  const f = fixture();
  await preview(f.ctx, input, f.store);
  await button(f.ctx, `ss:share:${f.id()}`, "m", true, f.store);
  assert.equal(f.sent.length, 1);
  assert.ok(
    f.events.findIndex((e) => e.startsWith("update:")) <
      f.events.indexOf("permissions"),
  );
  assert.ok(f.events.indexOf("permissions") < f.events.indexOf("send"));
  assert.equal(f.store.drafts.size, 0);
  await button(f.ctx, `ss:share:${f.id()}`, "m", true, f.store);
  assert.equal(f.sent.length, 1);
});
test("discard consumes without fetching permissions or sending", async () => {
  const f = fixture();
  await preview(f.ctx, input, f.store);
  await button(f.ctx, `ss:discard:${f.id()}`, "m", true, f.store);
  assert.equal(f.store.drafts.size, 0);
  assert.equal(f.sent.length, 0);
  assert.ok(!f.events.includes("permissions"));
});
test("permission denial sends nothing and consumes preview", async () => {
  const f = fixture();
  f.ctx.canPublish = async () => false;
  await preview(f.ctx, input, f.store);
  await button(f.ctx, `ss:share:${f.id()}`, "m", true, f.store);
  assert.equal(f.sent.length, 0);
  assert.equal(f.store.drafts.size, 0);
  assert.ok(f.events.some((e) => e.includes("Not shared")));
});
test("permission API failure fails closed after consumption", async () => {
  const f = fixture();
  f.ctx.canPublish = async () => {
    throw new Error("sensitive API failure");
  };
  await preview(f.ctx, input, f.store);
  await assert.rejects(button(f.ctx, `ss:share:${f.id()}`, "m", true, f.store));
  assert.equal(f.sent.length, 0);
  assert.equal(f.store.drafts.size, 0);
});
test("unconfirmed send is not retried or logged in private error", async () => {
  const f = fixture();
  let attempts = 0;
  f.ctx.send = async () => {
    attempts++;
    throw new Error("secret");
  };
  await preview(f.ctx, input, f.store);
  await button(f.ctx, `ss:share:${f.id()}`, "m", true, f.store);
  assert.equal(attempts, 1);
  assert.ok(f.events.some((e) => e.includes("Check the channel")));
  assert.ok(!f.events.some((e) => e.includes("secret")));
  assert.equal(f.store.drafts.size, 0);
});
test("forged message authenticity cannot consume preview", async () => {
  const f = fixture();
  await preview(f.ctx, input, f.store);
  await button(f.ctx, `ss:share:${f.id()}`, "m", false, f.store);
  assert.equal(f.store.drafts.size, 1);
  assert.equal(f.sent.length, 0);
});
for (const id of [
  "ss:share:bad",
  `ss:delete:${"a".repeat(36)}`,
  `ss:share:${"a".repeat(36)}:extra`,
])
  test(`malformed control ${id}`, async () => {
    const f = fixture();
    await button(f.ctx, id, "m", true, f.store);
    assert.equal(f.sent.length, 0);
    assert.ok(f.events[0]?.startsWith("private:"));
  });
test("channel cooldown prevents public burst", async () => {
  const f = fixture();
  f.store.cooldown(f.store.channels, "g:c", 60000);
  await preview(f.ctx, input, f.store);
  await button(f.ctx, `ss:share:${f.id()}`, "m", true, f.store);
  assert.equal(f.sent.length, 0);
  assert.ok(f.events.some((e) => e.includes("60 seconds")));
});
test("user cooldown prevents repeated drafts", async () => {
  const f = fixture();
  await preview(f.ctx, input, f.store);
  await preview(f.ctx, input, f.store);
  assert.equal(f.store.drafts.size, 1);
  assert.ok(f.events.some((e) => e.includes("5 seconds")));
});
test("edit failure removes orphan draft", async () => {
  const f = fixture();
  f.ctx.edit = async () => {
    throw new Error("fail");
  };
  await assert.rejects(preview(f.ctx, input, f.store));
  assert.equal(f.store.drafts.size, 0);
});
test("simultaneous duplicate clicks cannot send twice", async () => {
  const f = fixture();
  await preview(f.ctx, input, f.store);
  await Promise.all([
    button(f.ctx, `ss:share:${f.id()}`, "m", true, f.store),
    button(f.ctx, `ss:share:${f.id()}`, "m", true, f.store),
  ]);
  assert.equal(f.sent.length, 1);
});
test("draft card language survives button clicker's locale", async () => {
  const f = fixture();
  f.ctx.lang = "tr";
  await preview(f.ctx, input, f.store);
  f.ctx.lang = "en";
  await button(f.ctx, `ss:discard:${f.id()}`, "m", true, f.store);
  assert.ok(f.events.some((e) => e.includes("Önizleme silindi")));
});
