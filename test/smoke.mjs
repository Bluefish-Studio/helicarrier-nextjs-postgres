import assert from "node:assert/strict";
import { setTimeout } from "node:timers/promises";
const origin = "http://127.0.0.1:3000";
let ready = false;
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    const response = await fetch(`${origin}/health`, { signal: AbortSignal.timeout(2000) });
    if (response.ok && (await response.json()).ok === true) { ready = true; break; }
  } catch { /* Allow the container to start. */ }
  await setTimeout(1000);
}
assert.equal(ready, true, "Application must become healthy with its migrated database");
const page = await fetch(origin);
assert.equal(page.status, 200);
const html = await page.text();
assert.ok(html.includes("PostgreSQL connected"));
assert.ok(html.includes("Give the idea a home"));
assert.ok(html.includes("Ship the next small thing"));
assert.ok(!html.includes("postgresql://"), "The rendered page must not expose a connection URL");
console.log("Read-only deployment image serves the seeded PostgreSQL board and a healthy readiness endpoint.");
