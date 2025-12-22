// proto/index.js
import "./Proto.core.js";
import "./Proto.draw.js";
import "./Proto.mem.js";
import "./Proto.interact.js";

export { LogicProto } from "./Proto.core.js";

/* ============================================================
   Proto index – résolution des chemins de prototypes
   ============================================================ */

export const PROTO_BASE = "/LogicCompiler2/prototypes";

export const PROTO_CATEGORIES = {
  "E-S":        "1_E-S",
  "PORTES":    "2_PORTES",
  "BASCULES":  "3_BASCULES",
  "BUS":       "4_BUS",
  "UC":        "5_UC",
  "SAP1":      "10_SAP1"
};

/**
 * Résout le chemin réel d'un prototype
 * @param {string} tool   catégorie logique (PORTES, BASCULES…)
 * @param {string} name   nom du proto (AND, RS, ALU8s…)
 */
export function resolveProtoPath(tool, name) {
  const folder = PROTO_CATEGORIES[tool];
  if (folder) {
    return `${PROTO_BASE}/${folder}/${name}.txt`;
  }

  // fallback legacy temporaire
  return `${PROTO_BASE}/${name}.txt`;
}
