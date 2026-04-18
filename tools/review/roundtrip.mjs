// Trunk-Master-Roundtrip (AK-8, CW-001) — demonstrates that the Shopify adapter
// re-asserts the trunk's "draft" status after a simulated admin edit to "active".
//
// Flow:
//   1. Read current Shopify product (expected: status=draft).
//   2. PUT status=active via Admin API.
//   3. Verify product is now active.
//   4. Run tools/sync-shopify.sh once.
//   5. Read product again. Expected: status=draft (trunk wins).
//   6. finally-Block: if anything unexpected happened, force status back to draft.
//
// Output: specs/phase-3/evidence/roundtrip.json

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

export async function runRoundtrip(ctx) {
  const { shopifyClient, shopifyProductId, repoRoot, contentPath, evidenceDir } = ctx;

  if (!shopifyProductId) {
    return { ok: false, details: { error: "shopifyProductId missing (parity step failed?)" } };
  }

  const productPath = `/products/${shopifyProductId}.json`;
  const steps = [];
  let ok = false;
  let forcedResetRequired = false;

  try {
    const before = await shopifyClient.get(productPath);
    const statusBefore = before?.product?.status;
    steps.push({ step: "read-before", status: statusBefore, published_at: before?.product?.published_at ?? null });

    if (statusBefore !== "draft") {
      return {
        ok: false,
        details: {
          error: `precondition failed: product is not draft before test (got "${statusBefore}")`,
          steps
        }
      };
    }

    // Flip to active via Admin API.
    const flipBody = { product: { id: Number(shopifyProductId), status: "active" } };
    const flipped = await shopifyClient.put(productPath, flipBody);
    steps.push({ step: "admin-flip-to-active", result_status: flipped?.product?.status });

    if (flipped?.product?.status !== "active") {
      forcedResetRequired = true;
      return {
        ok: false,
        details: { error: `admin flip did not produce status=active`, steps }
      };
    }

    forcedResetRequired = true; // from here on, we MUST ensure draft at the end

    // Re-run the adapter — it should reset status back to draft.
    // Note: products-to-shopify.mjs requires ALLOW_OVERWRITE=1 when target is published.
    const sync = spawnSync("bash", ["tools/sync-shopify.sh", contentPath], {
      cwd: repoRoot,
      encoding: "utf8",
      env: { ...process.env, ALLOW_OVERWRITE: "1" }
    });
    const syncTail = (sync.stdout ?? "").trim().split("\n").slice(-4);
    steps.push({ step: "adapter-run", exit: sync.status, stdout_tail: syncTail });

    if (sync.status !== 0) {
      return { ok: false, details: { error: `adapter run failed`, steps } };
    }

    // Verify reset.
    const after = await shopifyClient.get(productPath);
    const statusAfter = after?.product?.status;
    steps.push({ step: "read-after", status: statusAfter, published_at: after?.product?.published_at ?? null });

    ok = statusAfter === "draft";

    // If adapter did its job, no forced reset needed.
    if (ok) forcedResetRequired = false;

    return {
      ok,
      details: {
        product_id: shopifyProductId,
        status_before: statusBefore,
        status_after_adapter: statusAfter,
        steps
      }
    };
  } finally {
    // Safety-Net — if anything left the product as non-draft, force it back.
    if (forcedResetRequired) {
      try {
        await shopifyClient.put(productPath, {
          product: { id: Number(shopifyProductId), status: "draft", published_at: null }
        });
        steps.push({ step: "safety-net-forced-reset", note: "product pushed back to draft" });
      } catch (err) {
        steps.push({ step: "safety-net-FAILED", error: err.message });
      }
    }
    writeFileSync(
      resolve(evidenceDir, "roundtrip.json"),
      JSON.stringify({ ok, steps, timestamp: ctx.now }, null, 2) + "\n"
    );
  }
}
