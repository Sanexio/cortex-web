// HWG-Compliance Scan (AK-4) — scans the WP praxis page for forbidden
// commerce tokens that would violate the Heilmittelwerbegesetz / Berufsordnung.
//
// Forbidden (per spec §2.3 E-5, Option (i)):
//   €               (euro sign)
//   EUR             (currency code, word-boundary, case-insensitive)
//   Kaufen          (verb, word-boundary, case-insensitive)
//   Warenkorb       (noun, word-boundary, case-insensitive)
//   Bestellen       (verb, word-boundary, case-insensitive)
//   Jetzt buchen    (juvantis CTA — appearance on praxis page = cross-contamination)
//
// Required: the allowed Praxis-CTA (Label + URL aus trunk.views.praxis,
// also tenant-konfiguriert — kein hartcodierter Domain-Bezug).
//
// Output: specs/phase-3/evidence/hwg-scan.json

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const FORBIDDEN = [
  { label: "€", pattern: /€/ },
  { label: "EUR", pattern: /\bEUR\b/i },
  { label: "Kaufen", pattern: /\bKaufen\b/i },
  { label: "Warenkorb", pattern: /\bWarenkorb\b/i },
  { label: "Bestellen", pattern: /\bBestellen\b/i },
  { label: "Jetzt buchen", pattern: /jetzt\s+buchen/i }
];

function scan(text) {
  return FORBIDDEN.map(({ label, pattern }) => {
    const match = pattern.exec(text);
    return {
      token: label,
      found: !!match,
      context: match ? text.slice(Math.max(0, match.index - 30), match.index + match[0].length + 30) : null
    };
  });
}

export async function runHwgScan(ctx) {
  const { trunk, wpClient, wpSlug, evidenceDir } = ctx;

  const lookup = await wpClient.get(
    `/wp/v2/pages?slug=${encodeURIComponent(wpSlug)}&status=any&per_page=10`
  );
  if (!Array.isArray(lookup) || lookup.length !== 1) {
    return { ok: false, details: { error: `expected 1 page, got ${Array.isArray(lookup) ? lookup.length : "non-array"}` } };
  }
  const page = lookup[0];
  const rendered = page.content?.rendered ?? "";
  const title = page.title?.rendered ?? "";
  const fullText = title + "\n" + rendered;

  const forbiddenHits = scan(fullText);
  const allowedCtaLabel = trunk.views.praxis.cta_label?.de ?? "";
  const allowedCtaUrl = trunk.views.praxis.cta_url ?? "";

  const ctaLabelPresent = fullText.includes(allowedCtaLabel);
  const ctaUrlPresent = fullText.includes(allowedCtaUrl);

  const anyForbidden = forbiddenHits.some((h) => h.found);
  const ok = !anyForbidden && ctaLabelPresent && ctaUrlPresent;

  const details = {
    page_id: page.id,
    link: page.link,
    forbidden: forbiddenHits,
    allowed: {
      cta_label_expected: allowedCtaLabel,
      cta_label_present: ctaLabelPresent,
      cta_url_expected: allowedCtaUrl,
      cta_url_present: ctaUrlPresent
    }
  };

  writeFileSync(resolve(evidenceDir, "hwg-scan.json"), JSON.stringify({ ok, ...details, timestamp: ctx.now }, null, 2) + "\n");
  return { ok, details };
}
