import { SlashCommandBuilder } from "discord.js";
export const command = new SlashCommandBuilder()
  .setName("shiftsprig")
  .setDescription(
    "Privately plan volunteer shifts, then choose whether to share",
  )
  .setDescriptionLocalizations({
    tr: "Gönüllü vardiyalarını özel önizle, ardından istersen paylaş",
  })
  .addStringOption((o) =>
    o
      .setName("title")
      .setDescription("Public event title; no private details")
      .setDescriptionLocalizations({
        tr: "Herkese açık etkinlik başlığı; özel bilgi yazmayın",
      })
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(80),
  )
  .addStringOption((o) =>
    o
      .setName("start")
      .setDescription(
        "Start with UTC offset: 2026-10-15T10:00+03:00 or 2026-10-15T07:00Z",
      )
      .setRequired(true)
      .setMinLength(17)
      .setMaxLength(22),
  )
  .addIntegerOption((o) =>
    o
      .setName("shifts")
      .setDescription("Number of shifts / Vardiya sayısı (1–12)")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(12),
  )
  .addIntegerOption((o) =>
    o
      .setName("minutes")
      .setDescription("Minutes per shift / Her vardiya kaç dakika (5–240)")
      .setRequired(true)
      .setMinValue(5)
      .setMaxValue(240),
  )
  .addIntegerOption((o) =>
    o
      .setName("gap")
      .setDescription(
        "Minutes between shifts / Vardiyalar arası boşluk (0–60, default 0)",
      )
      .setMinValue(0)
      .setMaxValue(60),
  )
  .addStringOption((o) =>
    o
      .setName("language")
      .setDescription("Card language / Kart dili")
      .addChoices(
        { name: "Türkçe", value: "tr" },
        { name: "English", value: "en" },
      ),
  );
