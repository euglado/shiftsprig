import { existsSync } from "node:fs";

const mode = process.argv[2];
try {
  if (mode !== "start" && mode !== "register") throw new Error("Unknown mode");
  if (existsSync(".env")) process.loadEnvFile(".env");
  const module = mode === "start" ? "main" : "register";
  if (!existsSync(`dist/src/${module}.js`)) throw new Error("Missing build");
  await import(`../dist/src/${module}.js`);
} catch {
  console.error(
    "Could not launch. Run npm ci --ignore-scripts, npm run build, npm run setup first. / Başlatılamadı; önce kurulum adımlarını tamamlayın. No credentials logged.",
  );
  process.exitCode = 1;
}
