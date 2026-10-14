import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  Options,
} from "discord.js";
import { authenticPreview, context } from "./bridge.js";
import { readConfig } from "./config.js";
import { button, preview } from "./handler.js";
import { type Language, words } from "./plan.js";
import { Store } from "./store.js";

const mentions = { parse: [] as [] };

try {
  const config = readConfig();
  const store = new Store();
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    makeCache: Options.cacheWithLimits({
      ...Options.DefaultMakeCacheSettings,
      MessageManager: 0,
      UserManager: 0,
      GuildMemberManager: 0,
    }),
    rest: { retries: 0 },
    allowedMentions: mentions,
  });
  client.on(Events.Error, () =>
    console.error(
      "Discord connection error; check network / bağlantıyı kontrol edin.",
    ),
  );
  client.once(Events.ClientReady, () => {
    if (client.application?.id !== config.application) {
      console.error("Application ID mismatch / Uygulama kimliği uyuşmuyor.");
      client.destroy();
      process.exitCode = 1;
      return;
    }
    console.log("ShiftSprig ready / hazır. No message-reading intent enabled.");
  });
  client.on(Events.InteractionCreate, async (i) => {
    if (!i.isChatInputCommand() && !i.isButton()) return;
    if (i.isChatInputCommand() && i.commandName !== "shiftsprig") return;
    if (i.isButton() && !i.customId.startsWith("ss:")) return;
    const lang: Language = i.locale.startsWith("tr") ? "tr" : "en";
    try {
      if (i.guildId !== config.guild || !i.inGuild()) {
        await i.reply({
          content: words(
            lang,
            "Bu komut yalnızca yapılandırılmış sunucuda çalışır.",
            "This command only works in the configured server.",
          ),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const channel = i.channel;
      if (
        !channel ||
        (channel.type !== ChannelType.GuildText &&
          channel.type !== ChannelType.GuildAnnouncement)
      ) {
        await i.reply({
          content: words(
            lang,
            "Normal metin veya duyuru kanalı kullanın.",
            "Use a regular text or announcement channel.",
          ),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (i.isChatInputCommand()) {
        const requested = i.options.getString("language");
        await preview(
          context(
            i,
            requested === "tr" || requested === "en" ? requested : lang,
          ),
          {
            title: i.options.getString("title", true),
            start: i.options.getString("start", true),
            count: i.options.getInteger("shifts", true),
            minutes: i.options.getInteger("minutes", true),
            gap: i.options.getInteger("gap") ?? 0,
          },
          store,
        );
      } else {
        const authentic = authenticPreview(
          i.message.author.id,
          client.user?.id ?? "",
          i.message.webhookId,
          config.application,
          i.message.flags.has(MessageFlags.Ephemeral),
        );
        await button(
          context(i, lang),
          i.customId,
          i.message.id,
          authentic,
          store,
        );
      }
    } catch {
      console.error(
        "Interaction failed; credentials and user content omitted / İşlem başarısız.",
      );
      const content = words(
        lang,
        "İşlem doğrulanamadı. Tekrar denemeden önce kanalı kontrol edin. /shiftsprig ile yeni önizleme oluşturabilirsiniz.",
        "Operation could not be confirmed. Check the channel before retrying. Use /shiftsprig for a new preview.",
      );
      try {
        if (i.replied || i.deferred)
          await i.editReply({
            content,
            components: [],
            allowedMentions: mentions,
          });
        else await i.reply({ content, flags: MessageFlags.Ephemeral });
      } catch {
        /* Expired interaction: no token-bearing error logs. */
      }
    }
  });
  const timer = setInterval(() => store.prune(), 30_000);
  timer.unref();
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, () => {
      clearInterval(timer);
      store.drafts.clear();
      store.users.clear();
      store.channels.clear();
      client.destroy();
    });
  await client.login(config.token);
} catch {
  console.error(
    "Startup failed. Run npm run setup and check network/token. / Başlatılamadı; kurulumu ve bağlantıyı kontrol edin. No credentials logged.",
  );
  process.exitCode = 1;
}
