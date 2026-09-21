import JavaScriptObfuscator from "javascript-obfuscator";
import { getPresetOptions } from "./presets.mjs";

/**
 * Preset alap-opciók és egyedi felülírások sekély összefésülése.
 * Az `overrides`-ban megadott mezők felülírják a preset azonos nevű
 * mezőit; a preset többi mezője változatlan marad.
 */
function mergeOptions(baseOptions, overrides) {
  if (!overrides || typeof overrides !== "object") {
    return baseOptions;
  }
  return { ...baseOptions, ...overrides };
}

/**
 * Lefuttatja a javascript-obfuscator motort a megadott forráskódon.
 *
 * @param {object} params
 * @param {string} params.code - Az obfuszkálandó JS forráskód.
 * @param {string} [params.preset] - Preset neve (default/low-obfuscation/medium-obfuscation/high-obfuscation).
 * @param {object} [params.options] - Egyedi opció-felülírások a preset felett.
 * @returns {{ obfuscatedCode: string, inputBytes: number, outputBytes: number, ratio: number, preset: string }}
 */
export function runObfuscation({ code, preset = "default", options }) {
  if (typeof code !== "string" || code.length === 0) {
    throw new Error("Nincs obfuszkálandó forráskód (üres 'code').");
  }

  const baseOptions = getPresetOptions(preset);
  const mergedOptions = mergeOptions(baseOptions, options);

  let result;
  try {
    result = JavaScriptObfuscator.obfuscate(code, mergedOptions);
  } catch (err) {
    throw new Error(`Obfuszkálási hiba (érvénytelen JS szintaxis vagy opció?): ${err.message}`);
  }

  const obfuscatedCode = result.getObfuscatedCode();
  const inputBytes = Buffer.byteLength(code, "utf8");
  const outputBytes = Buffer.byteLength(obfuscatedCode, "utf8");

  return {
    obfuscatedCode,
    inputBytes,
    outputBytes,
    ratio: inputBytes > 0 ? outputBytes / inputBytes : 0,
    preset,
  };
}
