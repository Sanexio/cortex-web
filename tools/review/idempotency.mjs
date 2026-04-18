// Idempotency (AK-6, AK-7) — re-runs sync-wp.sh and sync-shopify.sh and
// verifies that no duplicate artefacts are created.
//
// WP: 2nd run → same page id, action "update", modified_gmt advances or equals.
// Shopify: 2nd run → same product id, same handle, action "update".
//
// Output: specs/phase-3/evidence/idempotency-wp.json + idempotency-shopify.json

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

function extractAdapterSummary(stdout) {
  // sync scripts print progress lines *and* the adapter's pretty-printed
  // JSON summary *and* a trailing "sync-*: OK" marker. Walk lines from the
  // end, find the last "}"-only line, scan backward for the matching "{",
  // try to parse. This is tolerant of non-JSON noise before and after.
  const lines = stdout.split("\n");
  for (let end = lines.length - 1; end >= 0; end--) {
    if (lines[end].trimEnd() === "}") {
      for (let start = end; start >= 0; start--) {
        if (lines[start].trim() === "{") {
          const candidate = lines.slice(start, end + 1).join("\n");
          try { return JSON.parse(candidate); } catch { break; }
        }
      }
    }
  }
  return null;
}

function runSync(script, cwd, contentPath) {
  const r = spawnSync("bash", [script, contentPath], {
    cwd,
    encoding: "utf8",
    env: process.env
  });
  const stdout = r.stdout ?? "";
  const summary = extractAdapterSummary(stdout);
  return { exit: r.status, summary, stdout_tail: stdout.trim().split("\n").slice(-6) };
}

export async function runIdempotency(ctx) {
  const { repoRoot, contentPath, evidenceDir } = ctx;

  // WordPress ----------------------------------------------------------------
  const wpFirst = runSync("tools/sync-wp.sh", repoRoot, contentPath);
  const wpSecond = runSync("tools/sync-wp.sh", repoRoot, contentPath);
  const wpOk =
    wpFirst.exit === 0 &&
    wpSecond.exit === 0 &&
    wpFirst.summary?.id !== undefined &&
    wpSecond.summary?.id === wpFirst.summary?.id &&
    wpSecond.summary?.action === "update" &&
    wpSecond.summary?.slug === wpFirst.summary?.slug;
  const wpDetails = {
    run1: wpFirst.summary,
    run2: wpSecond.summary,
    run1_exit: wpFirst.exit,
    run2_exit: wpSecond.exit,
    same_id: wpFirst.summary?.id === wpSecond.summary?.id,
    run2_action: wpSecond.summary?.action ?? null
  };
  writeFileSync(
    resolve(evidenceDir, "idempotency-wp.json"),
    JSON.stringify({ ok: wpOk, ...wpDetails, timestamp: ctx.now }, null, 2) + "\n"
  );

  // Shopify ------------------------------------------------------------------
  const spFirst = runSync("tools/sync-shopify.sh", repoRoot, contentPath);
  const spSecond = runSync("tools/sync-shopify.sh", repoRoot, contentPath);
  const spOk =
    spFirst.exit === 0 &&
    spSecond.exit === 0 &&
    spFirst.summary?.id !== undefined &&
    spSecond.summary?.id === spFirst.summary?.id &&
    spSecond.summary?.action === "update" &&
    spSecond.summary?.handle === spFirst.summary?.handle;
  const spDetails = {
    run1: spFirst.summary,
    run2: spSecond.summary,
    run1_exit: spFirst.exit,
    run2_exit: spSecond.exit,
    same_id: spFirst.summary?.id === spSecond.summary?.id,
    same_handle: spFirst.summary?.handle === spSecond.summary?.handle,
    run2_action: spSecond.summary?.action ?? null
  };
  writeFileSync(
    resolve(evidenceDir, "idempotency-shopify.json"),
    JSON.stringify({ ok: spOk, ...spDetails, timestamp: ctx.now }, null, 2) + "\n"
  );

  return {
    wp: { ok: wpOk, details: wpDetails },
    shopify: { ok: spOk, details: spDetails }
  };
}
