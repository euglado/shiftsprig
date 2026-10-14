import { REST, Routes } from "discord.js";
import { command } from "./command.js";
import { readConfig } from "./config.js";

try {
  const config = readConfig();
  await new REST({ version: "10", retries: 0 })
    .setToken(config.token)
    .post(Routes.applicationGuildCommands(config.application, config.guild), {
      body: command.toJSON(),
    });
  console.log(
    "/shiftsprig registered for the configured server / komut sunucuya kaydedildi.",
  );
} catch {
  console.error(
    "Registration failed. Check setup, application ID, token and server installation. / Kayıt başarısız; kurulumu kontrol edin. No credentials logged.",
  );
  process.exitCode = 1;
}
