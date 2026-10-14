import { randomBytes } from "node:crypto";
import type { Language } from "./plan.js";

export interface Binding {
  user: string;
  guild: string;
  channel: string;
}
interface Draft extends Binding {
  content: string;
  lang: Language;
  expires: number;
  message?: string;
}
export class Store {
  readonly drafts = new Map<string, Draft>();
  readonly users = new Map<string, number>();
  readonly channels = new Map<string, number>();
  constructor(
    readonly now: () => number = Date.now,
    readonly nonce: () => string = () => randomBytes(18).toString("hex"),
  ) {}
  prune() {
    const now = this.now();
    for (const [key, draft] of this.drafts)
      if (draft.expires <= now) this.drafts.delete(key);
    for (const map of [this.users, this.channels])
      for (const [key, expiry] of map) if (expiry <= now) map.delete(key);
  }
  cooldown(map: Map<string, number>, key: string, duration: number): boolean {
    this.prune();
    if ((map.get(key) ?? 0) > this.now() || map.size >= 500) return false;
    map.set(key, this.now() + duration);
    return true;
  }
  create(
    binding: Binding,
    content: string,
    lang: Language,
  ): string | undefined {
    this.prune();
    if (this.drafts.size >= 100) return undefined;
    const id = this.nonce();
    if (!/^[a-f0-9]{36}$/.test(id) || this.drafts.has(id))
      throw new Error("Invalid draft nonce");
    this.drafts.set(id, {
      user: binding.user,
      guild: binding.guild,
      channel: binding.channel,
      content,
      lang,
      expires: this.now() + 300_000,
    });
    return id;
  }
  bind(id: string, message: string) {
    const draft = this.drafts.get(id);
    if (draft) draft.message = message;
  }
  take(id: string, binding: Binding, message: string): Draft | undefined {
    this.prune();
    const draft = this.drafts.get(id);
    if (
      !draft ||
      draft.user !== binding.user ||
      draft.guild !== binding.guild ||
      draft.channel !== binding.channel ||
      !draft.message ||
      draft.message !== message
    )
      return undefined;
    this.drafts.delete(id); // Consume synchronously before any network operation.
    return draft;
  }
}
