/**
 * Beépített obfuszkálási presetek - 1:1 átemelve a webes eszköz
 * assets/js/presets.js fájljából, hogy az MCP szerver és a webes UI
 * ugyanazokat az opció-kombinációkat kínálja.
 *
 * Lásd: docs/js-obfuszkator-specifikacio.md, 6. pont.
 */

export const PRESETS = {
  default: {
    label: "Alapértelmezett",
    options: {
      identifierNamesGenerator: "hexadecimal",
      renameGlobals: false,
      renameProperties: false,
      renamePropertiesMode: "safe",
      identifiersPrefix: "",
      stringArray: true,
      stringArrayThreshold: 0.75,
      stringArrayEncoding: [],
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 1,
      stringArrayWrappersType: "variable",
      splitStrings: false,
      splitStringsChunkLength: 10,
      unicodeEscapeSequence: false,
      controlFlowFlattening: false,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: false,
      deadCodeInjectionThreshold: 0.4,
      numbersToExpressions: false,
      simplify: true,
      transformObjectKeys: false,
      selfDefending: false,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: false,
      domainLock: [],
      domainLockRedirectUrl: "about:blank",
      compact: true,
      target: "browser",
      seed: 0,
      sourceMap: false,
    },
  },

  "low-obfuscation": {
    label: "Gyors",
    options: {
      identifierNamesGenerator: "hexadecimal",
      renameGlobals: false,
      renameProperties: false,
      renamePropertiesMode: "safe",
      identifiersPrefix: "",
      stringArray: true,
      stringArrayThreshold: 0.75,
      stringArrayEncoding: [],
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 1,
      stringArrayWrappersType: "variable",
      splitStrings: false,
      splitStringsChunkLength: 10,
      unicodeEscapeSequence: false,
      controlFlowFlattening: false,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: false,
      deadCodeInjectionThreshold: 0.4,
      numbersToExpressions: false,
      simplify: true,
      transformObjectKeys: false,
      selfDefending: true,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: false,
      domainLock: [],
      domainLockRedirectUrl: "about:blank",
      compact: true,
      target: "browser",
      seed: 0,
      sourceMap: false,
    },
  },

  "medium-obfuscation": {
    label: "Kiegyensúlyozott",
    options: {
      identifierNamesGenerator: "hexadecimal",
      renameGlobals: false,
      renameProperties: false,
      renamePropertiesMode: "safe",
      identifiersPrefix: "",
      stringArray: true,
      stringArrayThreshold: 0.75,
      stringArrayEncoding: ["base64"],
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 2,
      stringArrayWrappersType: "function",
      splitStrings: false,
      splitStringsChunkLength: 10,
      unicodeEscapeSequence: false,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.5,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      numbersToExpressions: true,
      simplify: true,
      transformObjectKeys: true,
      selfDefending: true,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: false,
      domainLock: [],
      domainLockRedirectUrl: "about:blank",
      compact: true,
      target: "browser",
      seed: 0,
      sourceMap: false,
    },
  },

  "high-obfuscation": {
    label: "Erős védelem",
    options: {
      identifierNamesGenerator: "hexadecimal",
      renameGlobals: false,
      renameProperties: false,
      renamePropertiesMode: "safe",
      identifiersPrefix: "",
      stringArray: true,
      stringArrayThreshold: 1,
      stringArrayEncoding: ["rc4"],
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 5,
      stringArrayWrappersType: "function",
      splitStrings: true,
      splitStringsChunkLength: 10,
      unicodeEscapeSequence: false,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1,
      numbersToExpressions: true,
      simplify: true,
      transformObjectKeys: true,
      selfDefending: true,
      debugProtection: true,
      debugProtectionInterval: 4000,
      disableConsoleOutput: true,
      domainLock: [],
      domainLockRedirectUrl: "about:blank",
      compact: true,
      target: "browser",
      seed: 0,
      sourceMap: false,
    },
  },
};

export const PRESET_NAMES = Object.keys(PRESETS);

export function getPresetOptions(presetName) {
  const preset = PRESETS[presetName];
  if (!preset) {
    throw new Error(
      `Ismeretlen preset: "${presetName}". Elérhető presetek: ${PRESET_NAMES.join(", ")}`
    );
  }
  // Sekély másolat, hogy a merge során ne módosítsuk a megosztott preset-objektumot.
  return { ...preset.options };
}
