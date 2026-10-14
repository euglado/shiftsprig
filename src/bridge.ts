import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  ChannelType,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import type { Context } from "./handler.js";
import { type Language, words } from "./plan.js";

const required = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
];
const mentions = { parse: [] as [] };
const controls = (id: string, lang: Language) => [
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`ss:share:${id}`)
      .setLabel(words(lang, "Paylaş", "Share"))
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`ss:discard:${id}`)
      .setLabel(words(lang, "Vazgeç", "Discard"))
      .setStyle(ButtonStyle.Secondary),
  ),
];

export function context(
  i: ChatInputCommandInteraction | ButtonInteraction,
  lang: Language,
): Context {
  return {
    user: i.user.id,
    guild: i.guildId ?? "",
    channel: i.channelId ?? "",
    lang,
    defer: async () => {
      await i.deferReply({ flags: MessageFlags.Ephemeral });
    },
    privateReply: async (content) => {
      await i.reply({
        content,
        flags: MessageFlags.Ephemeral | MessageFlags.SuppressEmbeds,
        allowedMentions: mentions,
      });
    },
    edit: async (content, id, cardLang) => {
      const message = await i.editReply({
        content,
        components: id ? controls(id, cardLang ?? lang) : [],
        allowedMentions: mentions,
        flags: MessageFlags.SuppressEmbeds,
      });
      return message.id;
    },
    update: async (content) => {
      if (!i.isButton()) throw new Error("Button required");
      await i.update({
        content,
        components: [],
        allowedMentions: mentions,
        flags: MessageFlags.SuppressEmbeds,
      });
    },
    canPublish: async () => {
      if (!i.guild || !i.channelId) return false;
      const channel = await i.guild.channels.fetch(i.channelId, {
        force: true,
        cache: false,
      });
      if (
        !channel ||
        ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(
          channel.type,
        )
      )
        return false;
      const [member, bot] = await Promise.all([
        i.guild.members.fetch({ user: i.user.id, force: true, cache: false }),
        i.guild.members.fetch({
          user: i.client.user.id,
          force: true,
          cache: false,
        }),
      ]);
      return (
        channel.permissionsFor(member)?.has(required) === true &&
        channel.permissionsFor(bot)?.has(required) === true
      );
    },
    send: async (content) => {
      if (!i.guild || !i.channelId) throw new Error("Guild required");
      const channel = await i.guild.channels.fetch(i.channelId, {
        force: true,
        cache: false,
      });
      if (
        !channel ||
        (channel.type !== ChannelType.GuildText &&
          channel.type !== ChannelType.GuildAnnouncement)
      )
        throw new Error("Unsupported channel");
      await channel.send({
        content,
        allowedMentions: mentions,
        flags: MessageFlags.SuppressEmbeds,
      });
    },
  };
}

export function authenticPreview(
  author: string,
  bot: string,
  webhook: string | null,
  application: string,
  ephemeral: boolean,
) {
  return author === bot && webhook === application && ephemeral;
}
