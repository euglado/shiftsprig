import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const allowed = new Set([
  "MIT OR Apache-2.0",
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "0BSD",
  "Python-2.0",
]);
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
if (lock.lockfileVersion !== 3) throw new Error("Expected lockfile v3");
let dependencies = 0;
for (const [name, entry] of Object.entries(lock.packages)) {
  if (!name) continue;
  if (
    !allowed.has(entry.license) ||
    entry.hasInstallScript ||
    !/^https:\/\/registry\.npmjs\.org\//.test(entry.resolved ?? "") ||
    !/^sha512-[A-Za-z0-9+/]+={0,2}$/.test(entry.integrity ?? "")
  )
    throw new Error(`Dependency metadata rejected: ${name}`);
  dependencies++;
}
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/,
  /\bmfa\.[A-Za-z0-9_-]{40,}\b/,
  /\b[A-Za-z0-9_-]{23,30}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{25,110}\b/,
];
let sources = 0;
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist"].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Unexpected source symlink");
    if (entry.isDirectory()) {
      walk(file);
      continue;
    }
    if (entry.name.startsWith(".env") && entry.name !== ".env.example")
      throw new Error(
        "Private environment file in source tree; remove from check workspace",
      );
    if (patterns.some((pattern) => pattern.test(readFileSync(file, "utf8"))))
      throw new Error(`Potential credential found in ${file}; value omitted`);
    sources++;
  }
}
walk(".");
console.log(
  `Supply check passed: ${dependencies} dependency license/registry/SHA-512/no-install-script records; ${sources} source credential-pattern scans.`,
);
