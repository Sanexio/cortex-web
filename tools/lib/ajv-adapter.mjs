import Ajv from "ajv";

export function createAdapterAjv() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  // Match tools/lib/schema-validate.mjs: ajv-formats is not a dependency yet,
  // so known schema formats are accepted explicitly without warning noise.
  ajv.addFormat("date", true);
  ajv.addFormat("date-time", true);
  ajv.addFormat("uri", true);
  return ajv;
}
