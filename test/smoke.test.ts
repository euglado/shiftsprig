import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { readConfig } from "../src/config.js";

test("configuration error never echoes credential values", () => {
  const marker = "invalid-token-marker";
  assert.throws(
    () => readConfig({ DISCORD_TOKEN: marker }),
    (error) => error instanceof Error && !error.message.includes(marker),
  );
});
test("configuration trims IDs and validates without network", () => {
  const c = readConfig({
    DISCORD_TOKEN: "a".repeat(40),
    DISCORD_APPLICATION_ID: " 123456789012345678 ",
    DISCORD_GUILD_ID: "123456789012345679",
  });
  assert.equal(c.application, "123456789012345678");
});
for (const module of [
  "../src/main.js",
  "../src/register.js",
  "../../scripts/setup.mjs",
])
  test(`unconfigured ${module} fails safely without writes`, () => {
    const tempRoot = path.resolve(os.tmpdir());
    const cwd = mkdtempSync(path.join(tempRoot, "shiftsprig-smoke-"));
    const relative = path.relative(tempRoot, cwd);
    assert.ok(
      !relative.startsWith("..") &&
        !path.isAbsolute(relative) &&
        path.basename(cwd).startsWith("shiftsprig-smoke-"),
    );
    const env = { ...process.env };
    for (const key of [
      "DISCORD_TOKEN",
      "DISCORD_APPLICATION_ID",
      "DISCORD_GUILD_ID",
    ])
      delete env[key];
    try {
      const result = spawnSync(
        process.execPath,
        [fileURLToPath(new URL(module, import.meta.url))],
        { cwd, env, timeout: 15000, encoding: "utf8", input: "" },
      );
      assert.equal(result.error, undefined);
      assert.equal(result.status, 1);
      assert.ok(
        result.stderr.includes("No credentials logged") ||
          result.stderr.includes("No token logged"),
      );
      assert.equal(existsSync(path.join(cwd, ".env")), false);
      assert.deepEqual(readdirSync(cwd), []);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
