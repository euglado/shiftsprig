import assert from "node:assert/strict";
import test from "node:test";
import {
  ChannelType,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import { authenticPreview, context } from "../src/bridge.js";
import { command } from "../src/command.js";

function fixture(
  type: ChannelType = ChannelType.GuildText,
  userAllowed = true,
  botAllowed = true,
) {
  const fetched: unknown[] = [],
    replies: unknown[] = [],
    sends: unknown[] = [];
  const channel = {
    type,
    permissionsFor: (member: { id: string }) => ({
      has: (permissions: bigint[]) => {
        assert.deepEqual(permissions, [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
        ]);
        return member.id === "u" ? userAllowed : botAllowed;
      },
    }),
    send: async (payload: unknown) => {
      sends.push(payload);
    },
  };
  const raw = {
    user: { id: "u" },
    guildId: "g",
    channelId: "c",
    client: { user: { id: "b" } },
    guild: {
      channels: {
        fetch: async (...args: unknown[]) => {
          fetched.push(args);
          return channel;
        },
      },
      members: {
        fetch: async (options: {
          user: string;
          force: boolean;
          cache: boolean;
        }) => {
          fetched.push(options);
          return { id: options.user };
        },
      },
    },
    deferReply: async (payload: unknown) => {
      replies.push(payload);
    },
    reply: async (payload: unknown) => {
      replies.push(payload);
    },
    editReply: async (payload: unknown) => {
      replies.push(payload);
      return { id: "m" };
    },
  };
  return {
    ctx: context(raw as unknown as ChatInputCommandInteraction, "en"),
    fetched,
    replies,
    sends,
  };
}
test("preview authentication requires bot author, application webhook and ephemeral flag", () => {
  assert.equal(authenticPreview("b", "b", "a", "a", true), true);
  assert.equal(authenticPreview("x", "b", "a", "a", true), false);
  assert.equal(authenticPreview("b", "b", null, "a", true), false);
  assert.equal(authenticPreview("b", "b", "x", "a", true), false);
  assert.equal(authenticPreview("b", "b", "a", "a", false), false);
});
for (const channel of [ChannelType.GuildText, ChannelType.GuildAnnouncement])
  test(`supported channel ${channel} fetches both members freshly`, async () => {
    const f = fixture(channel);
    assert.equal(await f.ctx.canPublish(), true);
    assert.deepEqual(f.fetched, [
      ["c", { force: true, cache: false }],
      { user: "u", force: true, cache: false },
      { user: "b", force: true, cache: false },
    ]);
  });
for (const channel of [
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
  ChannelType.GuildVoice,
  ChannelType.GuildForum,
  ChannelType.GuildCategory,
  ChannelType.DM,
])
  test(`unsupported channel ${channel} cannot publish`, async () => {
    const f = fixture(channel);
    assert.equal(await f.ctx.canPublish(), false);
    await assert.rejects(f.ctx.send("content"));
    assert.equal(f.sends.length, 0);
  });
for (const [user, bot] of [
  [false, true],
  [true, false],
  [false, false],
])
  test(`both user=${user} and bot=${bot} need permissions`, async () => {
    const f = fixture(ChannelType.GuildText, user, bot);
    assert.equal(await f.ctx.canPublish(), false);
  });
test("public payload disables mention parsing and link embeds", async () => {
  const f = fixture();
  await f.ctx.send("safe");
  assert.deepEqual(f.sends, [
    {
      content: "safe",
      allowedMentions: { parse: [] },
      flags: MessageFlags.SuppressEmbeds,
    },
  ]);
});
test("private deferred preview and localized buttons use expected bindings", async () => {
  const f = fixture();
  await f.ctx.defer();
  assert.deepEqual(f.replies[0], { flags: MessageFlags.Ephemeral });
  const id = "a".repeat(36);
  assert.equal(await f.ctx.edit("plan", id, "tr"), "m");
  const payload = f.replies[1] as {
    components: {
      toJSON(): { components: { custom_id: string; label: string }[] };
    }[];
  };
  const buttons = payload.components[0]?.toJSON().components;
  assert.deepEqual(
    buttons?.map((b) => [b.custom_id, b.label]),
    [
      [`ss:share:${id}`, "Paylaş"],
      [`ss:discard:${id}`, "Vazgeç"],
    ],
  );
});
test("registered slash schema has bounded required inputs and no default admin permission", () => {
  const schema = command.toJSON();
  const options = schema.options ?? [];
  assert.equal(schema.name, "shiftsprig");
  assert.equal(options.length, 6);
  assert.equal(schema.default_member_permissions, undefined);
  const required = options
    .filter((o) => "required" in o && o.required)
    .map((o) => o.name);
  assert.deepEqual(required, ["title", "start", "shifts", "minutes"]);
});
