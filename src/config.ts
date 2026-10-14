export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const token = env.DISCORD_TOKEN?.trim() ?? "";
  const application = env.DISCORD_APPLICATION_ID?.trim() ?? "";
  const guild = env.DISCORD_GUILD_ID?.trim() ?? "";
  if (
    !/^[A-Za-z0-9._-]{30,200}$/.test(token) ||
    !/^[0-9]{17,20}$/.test(application) ||
    !/^[0-9]{17,20}$/.test(guild)
  )
    throw new Error(
      "Configuration missing or invalid. Run npm run setup / npm run setup komutunu çalıştırın.",
    );
  return { token, application, guild };
}
