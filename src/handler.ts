import {
  type Input,
  InputError,
  inputHelp,
  type Language,
  makePlan,
  renderPlan,
  words,
} from "./plan.js";
import type { Binding, Store } from "./store.js";

export interface Context extends Binding {
  lang: Language;
  defer(): Promise<void>;
  privateReply(content: string): Promise<void>;
  edit(content: string, id?: string, lang?: Language): Promise<string>;
  update(content: string): Promise<void>;
  canPublish(): Promise<boolean>;
  send(content: string): Promise<void>;
}
const expired = (lang: Language) =>
  words(
    lang,
    "Önizleme geçersiz, kullanılmış veya 5 dakikası dolmuş. /shiftsprig ile tekrar deneyin.",
    "Preview is invalid, already used or older than 5 minutes. Run /shiftsprig again.",
  );

export async function preview(
  ctx: Context,
  input: Input,
  store: Store,
): Promise<void> {
  await ctx.defer();
  if (!store.cooldown(store.users, `${ctx.guild}:${ctx.user}`, 5_000)) {
    await ctx.edit(
      words(
        ctx.lang,
        "Lütfen 5 saniye bekleyin; kapasite doluysa daha sonra deneyin.",
        "Please wait 5 seconds; if capacity is full, try later.",
      ),
    );
    return;
  }
  let content: string;
  try {
    content = renderPlan(makePlan(input), ctx.lang);
  } catch (error) {
    if (!(error instanceof InputError)) throw error;
    await ctx.edit(inputHelp(ctx.lang));
    return;
  }
  const id = store.create(ctx, content, ctx.lang);
  if (!id) {
    await ctx.edit(
      words(
        ctx.lang,
        "Önizleme kapasitesi dolu. Birkaç dakika sonra tekrar deneyin.",
        "Preview capacity is full. Try again in a few minutes.",
      ),
    );
    return;
  }
  try {
    const notice = words(
      ctx.lang,
      "Özel önizleme · 5 dakika geçerli. Paylaş, başlığı ve tüm planı bu kanala herkese açık gönderir.",
      "Private preview · valid for 5 minutes. Share publishes the title and entire plan in this channel.",
    );
    const message = await ctx.edit(`${content}\n\n${notice}`, id, ctx.lang);
    store.bind(id, message);
  } catch (error) {
    store.drafts.delete(id);
    throw error;
  }
}

export async function button(
  ctx: Context,
  customId: string,
  messageId: string,
  authentic: boolean,
  store: Store,
): Promise<void> {
  const match = /^ss:(share|discard):([a-f0-9]{36})$/.exec(customId);
  if (!match || !authentic) {
    await ctx.privateReply(expired(ctx.lang));
    return;
  }
  const draft = store.take(match[2] ?? "", ctx, messageId);
  if (!draft) {
    await ctx.privateReply(expired(ctx.lang));
    return;
  }
  const lang = draft.lang;
  // Acknowledge and remove both controls before checking permissions or sending.
  await ctx.update(words(lang, "İşleniyor…", "Processing…"));
  if (match[1] === "discard") {
    await ctx.edit(
      words(
        lang,
        "Önizleme silindi. Hiçbir şey paylaşılmadı.",
        "Preview discarded. Nothing was shared.",
      ),
    );
    return;
  }
  if (!(await ctx.canPublish())) {
    await ctx.edit(
      words(
        lang,
        "Paylaşılmadı. Sizin ve botun bu kanalda Kanalı Görüntüle ve Mesaj Gönder izinlerini kontrol edin. Normal metin/duyuru kanalı kullanın.",
        "Not shared. Check View Channel and Send Messages for both you and the bot. Use a regular text/announcement channel.",
      ),
    );
    return;
  }
  if (!store.cooldown(store.channels, `${ctx.guild}:${ctx.channel}`, 60_000)) {
    await ctx.edit(
      words(
        lang,
        "Bu kanalda paylaşımlar arasında 60 saniye bekleyin. Kapasite doluysa daha sonra deneyin; yeni önizleme gerekir.",
        "Wait 60 seconds between shares in this channel. If capacity is full, try later; create a new preview.",
      ),
    );
    return;
  }
  try {
    await ctx.send(draft.content);
  } catch {
    await ctx.edit(
      words(
        lang,
        "Gönderim doğrulanamadı. Tekrar denemeden önce kanalı kontrol edin; otomatik tekrar yapılmadı.",
        "Delivery could not be confirmed. Check the channel before trying again; no automatic resend was made.",
      ),
    );
    return;
  }
  await ctx.edit(
    words(
      lang,
      "Plan bu kanalda paylaşıldı. Değişiklik için yeni plan hazırlayın; eski mesajı yetkili biri silebilir.",
      "Plan shared in this channel. Create a new plan for changes; an authorized person can delete the old message.",
    ),
  );
}
