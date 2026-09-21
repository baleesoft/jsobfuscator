#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { PRESET_NAMES } from "./presets.mjs";
import { runObfuscation } from "./obfuscate.mjs";

const server = new McpServer({
  name: "jsobfuscator",
  version: "1.0.0",
});

server.registerTool(
  "obfuscate_js",
  {
    title: "JavaScript obfuszkálása",
    description:
      "JavaScript forráskód obfuszkálása a javascript-obfuscator motorral, a jsobfuscator " +
      "webes eszköz beépített presetjeit használva (default / low-obfuscation / " +
      "medium-obfuscation / high-obfuscation). A bemenet megadható közvetlenül " +
      "kódként ('code') vagy fájlútvonalként ('filePath') - pontosan az egyiket kell " +
      "megadni. A kimenet visszaadható szövegként, vagy fájlba írható ('outputPath'). " +
      "Az 'options' mezővel a preset bármely opciója felülírható egy adott híváson belül.",
    inputSchema: {
      code: z.string().optional().describe("Nyers JS forráskód obfuszkáláshoz."),
      filePath: z
        .string()
        .optional()
        .describe("Bemeneti .js fájl abszolút vagy relatív útvonala."),
      outputPath: z
        .string()
        .optional()
        .describe(
          "Ha megadva, az obfuszkált kód ide kerül kiírásra; ha hiányzik, a válasz " +
            "szövegként tartalmazza az obfuszkált kódot."
        ),
      preset: z
        .enum(PRESET_NAMES)
        .optional()
        .describe(
          `Beépített preset neve (${PRESET_NAMES.join(", ")}). Alapérték: "default".`
        ),
      options: z
        .record(z.string(), z.any())
        .optional()
        .describe(
          "A javascript-obfuscator motor natív opcióinak felülírása a preset felett " +
            '(pl. {"stringArrayEncoding": ["rc4"], "controlFlowFlattening": true}).'
        ),
    },
  },
  async ({ code, filePath, outputPath, preset, options }) => {
    try {
      if (Boolean(code) === Boolean(filePath)) {
        throw new Error(
          "Pontosan az egyiket kell megadni: 'code' vagy 'filePath' (nem mindkettőt, és nem egyiket sem)."
        );
      }

      let sourceCode = code;
      let resolvedInputPath;
      if (filePath) {
        resolvedInputPath = resolve(filePath);
        try {
          sourceCode = await readFile(resolvedInputPath, "utf8");
        } catch (err) {
          throw new Error(`Nem sikerült beolvasni a bemeneti fájlt (${resolvedInputPath}): ${err.message}`);
        }
      }

      const result = runObfuscation({ code: sourceCode, preset, options });

      const summaryLines = [
        `Preset: ${result.preset}`,
        `Bemenet: ${result.inputBytes} byte`,
        `Kimenet: ${result.outputBytes} byte (${result.ratio.toFixed(2)}x)`,
      ];

      if (outputPath) {
        const resolvedOutputPath = resolve(outputPath);
        await mkdir(dirname(resolvedOutputPath), { recursive: true });
        await writeFile(resolvedOutputPath, result.obfuscatedCode, "utf8");
        summaryLines.push(`Kiírva: ${resolvedOutputPath}`);

        return {
          content: [{ type: "text", text: summaryLines.join("\n") }],
        };
      }

      return {
        content: [
          { type: "text", text: summaryLines.join("\n") },
          { type: "text", text: result.obfuscatedCode },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Hiba: ${err.message}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("jsobfuscator MCP szerver indítási hiba:", err);
  process.exit(1);
});
