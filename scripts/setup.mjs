import { existsSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

function hiddenToken() {
  return new Promise((resolve, reject) => {
    let value = "";
    const previousRaw = process.stdin.isRaw;
    const cleanup = () => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(previousRaw);
      process.stdin.pause();
      process.stdout.write("\n");
    };
    const onData = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003" || char === "\u0004" || char === "\u001b") {
          cleanup();
          reject(new Error("Cancelled"));
          return;
        }
        if (char === "\r" || char === "\n") {
          cleanup();
          resolve(value);
          return;
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else if (/^[A-Za-z0-9._-]$/.test(char) && value.length < 201)
          value += char;
      }
    };
    process.stdout.write(
      "Bot token (hidden / gizli; Enter to finish, Esc to cancel): ",
    );
    process.stdin.setRawMode(true);
    process.stdin.on("data", onData);
    process.stdin.resume();
  });
}

try {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new Error("Interactive terminal required");
  if (existsSync(".env")) throw new Error("Existing configuration");
  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let application, guild;
  try {
    console.log(
      "ShiftSprig setup / kurulum. Never share your token / tokenı kimseyle paylaşmayın.",
    );
    application = (
      await prompt.question("Application ID / Uygulama kimliği: ")
    ).trim();
    guild = (await prompt.question("Server ID / Sunucu kimliği: ")).trim();
  } finally {
    prompt.close();
  }
  if (!/^[0-9]{17,20}$/.test(application) || !/^[0-9]{17,20}$/.test(guild))
    throw new Error("Invalid IDs");
  const token = await hiddenToken();
  if (typeof token !== "string" || !/^[A-Za-z0-9._-]{30,200}$/.test(token))
    throw new Error("Invalid token");
  writeFileSync(
    ".env",
    `DISCORD_TOKEN=${token}\nDISCORD_APPLICATION_ID=${application}\nDISCORD_GUILD_ID=${guild}\n`,
    { flag: "wx", mode: 0o600 },
  );
  console.log(
    "Saved locally to .env. Next: npm run register, then npm start. / Kaydedildi; komutu kaydedip botu başlatın.",
  );
} catch {
  console.error(
    "Setup stopped. Use an interactive terminal; check IDs/token. Existing .env is never overwritten; rename it privately if reconfiguring. / Kurulum durdu; mevcut .env üzerine yazılmaz. No token logged.",
  );
  process.exitCode = 1;
}
