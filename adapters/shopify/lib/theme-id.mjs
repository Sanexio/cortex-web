import { tenantConfigGet } from "../../../tools/lib/tenant-config.mjs";

function parseThemeId(value, sourceLabel) {
  if (value === undefined || value === null || value === "") return null;
  const id = Number(value);
  if (!Number.isFinite(id)) {
    throw new Error(`${sourceLabel} must be numeric, got "${value}"`);
  }
  return id;
}

export async function resolveThemeId(client) {
  const envThemeId = parseThemeId(process.env.SHOPIFY_THEME_ID, "SHOPIFY_THEME_ID");
  if (envThemeId) {
    return { themeId: envThemeId, source: "env:SHOPIFY_THEME_ID" };
  }

  for (const key of ["shop.theme_id", "shopify.theme_id"]) {
    const configured = parseThemeId(tenantConfigGet(key, null), `tenant.config.json ${key}`);
    if (configured) {
      return { themeId: configured, source: `tenant.config.json:${key}` };
    }
  }

  const themesRes = await client.get(`/themes.json`);
  const themes = themesRes?.themes || [];
  const live = themes.find((t) => t.role === "main");
  if (!live) throw new Error(`no theme with role=main found among ${themes.length} themes`);
  return { themeId: live.id, source: "shopify:role=main" };
}
