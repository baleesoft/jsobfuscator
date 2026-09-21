# jsobfuscator MCP szerver

MCP (Model Context Protocol) szerver, ami a [`javascript-obfuscator`](https://github.com/javascript-obfuscator/javascript-obfuscator)
motort teszi elérhetővé Claude Code-ból (VSCode extension vagy CLI), bármelyik
projektből. Ugyanazokat a beépített presteket kínálja, mint a repó gyökerében
lévő webes eszköz ([../assets/js/presets.js](../assets/js/presets.js)):
`default`, `low-obfuscation`, `medium-obfuscation`, `high-obfuscation`.

A webes eszközzel ellentétben ez a szerver **nem a böngészőben**, hanem
Node.js-ben, közvetlenül az npm `javascript-obfuscator` csomaggal fut — ugyanaz
a motor, csak szerver/CLI oldali futtatással, mert Claude Code-nak nincs
böngésző-környezete a tool-hívásokhoz.

## Telepítés

```bash
cd mcp
npm install
```

## Regisztráció Claude Code-ban (globális, minden projektből elérhető)

```bash
claude mcp add -s user jsobfuscator -- node "C:\Users\balazs.nemes\Downloads\git\jsobfuscator\mcp\src\index.mjs"
```

Ellenőrzés:

```bash
claude mcp list
```

A `jsobfuscator` szervernek "Connected" állapotban kell megjelennie, és onnantól
bármelyik Claude Code munkamenetből (bármely projektből) elérhető az
`obfuscate_js` tool.

## A tool: `obfuscate_js`

| Paraméter    | Típus                                                                          | Kötelező                       | Leírás |
|---|---|---|---|
| `code`       | string                                                                         | `code` vagy `filePath` közül pontosan egy | Nyers JS forráskód. |
| `filePath`   | string                                                                         | ua.                             | Bemeneti `.js` fájl útvonala. |
| `outputPath` | string                                                                         | nem                              | Ha megadva, ide írja az obfuszkált kódot; ha nincs, a válaszban szövegként jön vissza. |
| `preset`     | `default` \| `low-obfuscation` \| `medium-obfuscation` \| `high-obfuscation`   | nem (alapérték: `default`)      | Beépített preset. |
| `options`    | object                                                                          | nem                              | A motor natív opcióinak felülírása a preset felett (sekély merge). |

### Példák (természetes nyelven, Claude Code-ban)

- "Obfuszkáld a `src/utils.js` fájlt `high-obfuscation` preset-tel, írd
  `dist/utils.min.js`-be."
- "Obfuszkáld ezt a kódrészletet `medium-obfuscation` preset-tel, de
  `stringArrayEncoding: rc4`-fel."

### Preset + egyedi felülírás

Az `options` mezővel bármely, a preset felett megadott natív opció
felülírható egyetlen híváson belül, pl.:

```json
{
  "filePath": "src/app.js",
  "preset": "medium-obfuscation",
  "options": { "stringArrayEncoding": ["rc4"], "controlFlowFlatteningThreshold": 1 }
}
```

## Fontos figyelmeztetés: `high-obfuscation` és `debugProtection`

A `high-obfuscation` preset bekapcsolja a motor `debugProtection: true` és
`selfDefending: true` opcióit. Ezek **szándékosan** megnehezítik/lefagyasztják
a futtatást, ha a kód DevTools-szal vagy más debug-környezetben (pl. sima
`node kimenet.js` egy terminálban) fut. Ez böngészőben, éles környezetben
elvárt védelmi funkció, de azt jelenti, hogy a `high-obfuscation` kimenetét
**ne** próbáld egyszerű `node` paranccsal futtatva tesztelni — csak a
szintaxis ellenőrizhető biztonságosan (`node --check kimenet.js`), a tényleges
futtatás böngészőben vagy a célkörnyezetben történjen.

## Helyi tesztelés (fejlesztéshez)

```bash
npm run inspect
```

Ez elindítja a [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
webes felületét, ahol a `obfuscate_js` tool interaktívan kipróbálható.

CLI módban, egyetlen hívással:

```bash
npx @modelcontextprotocol/inspector --cli node src/index.mjs \
  --method tools/call --tool-name obfuscate_js \
  --tool-arg code='function add(a,b){return a+b;}' \
  --tool-arg preset=low-obfuscation
```

## Elvi megjegyzés

Ez a szerver **nem** hívja meg és nem is éri el a webes eszköz PHP/MySQL
backendjét ([../api/presets.php](../api/presets.php)) — teljesen önálló,
csak a 4 beépített presetet ismeri. A webes eszközben elmentett egyedi
presetek jelenleg nem érhetők el innen; ha ez később igény lesz, a szervert
ki lehet egészíteni, hogy HTTP-n lekérdezze az `api/presets.php?action=list`
végpontot.

## Miért nem a nemesbalazs.hu/jsobfuscator/ élő oldalt hívja ez a szerver?

Ez a szerver **helyi (stdio) MCP szerver**: egy `node` processzt indít a
gépeden, ami közvetlenül az npm `javascript-obfuscator` csomagot hívja. Ez
tudatos döntés, nem csak kényelem:

- A `nemesbalazs.hu/jsobfuscator/` PHP oldal az obfuszkálást a **böngészőben**
  futtatja (vendorolt `javascript-obfuscator.browser.js`), a PHP/MySQL backend
  ([../docs/js-obfuszkator-specifikacio.md](../docs/js-obfuszkator-specifikacio.md),
  2. pont) kizárólag preseteket tárol, forráskódot soha nem lát és nem is
  szolgál ki API-t obfuszkáláshoz.
- Ahhoz, hogy az élő domain MCP-ként (HTTP transporttal) elérhető legyen,
  vagy Node.js-t kellene futtatni a `nemesbalazs.hu` tárhelyen a PHP mellett
  (a legtöbb megosztott tárhely ezt nem támogatja - lásd a specifikáció
  1. pontját), vagy a motort PHP-ban kellene újraírni (irreális egy JS
  parser/AST-transzformátorhoz).
- Emiatt egyelőre a lokális stdio megoldás maradt: minden gépen, ahol
  használni szeretnéd, egyszer kell telepíteni Node.js-t + ezt a repót.

## Másik gépre áttelepítés (nincs meg lokálban a repó)

Ha egy új gépen (ahol a repó még nincs meg lokálban) szeretnéd elérni az
`obfuscate_js` tool-t, ez a menete:

1. **Node.js telepítése** (ha még nincs) - LTS verzió, `node --version`
   ellenőrzéssel (18+ ajánlott).

2. **Repó klónozása:**

   ```bash
   git clone https://github.com/baleesoft/jsobfuscator.git
   ```

3. **MCP szerver dependenciáinak telepítése:**

   ```bash
   cd jsobfuscator/mcp
   npm install
   ```

4. **Regisztráció Claude Code-ban** (a klón tényleges útvonalával):

   ```bash
   claude mcp add -s user jsobfuscator -- node "<klón abszolút útvonala>/mcp/src/index.mjs"
   ```

   Windows példa: `claude mcp add -s user jsobfuscator -- node "C:\Users\<felhasznalo>\...\jsobfuscator\mcp\src\index.mjs"`
   macOS/Linux példa: `claude mcp add -s user jsobfuscator -- node "/home/<felhasznalo>/.../jsobfuscator/mcp/src/index.mjs"`

5. **Ellenőrzés:**

   ```bash
   claude mcp get jsobfuscator
   ```

   "Connected" állapotot kell mutasson.

A `nemesbalazs.hu/jsobfuscator/` élő oldalhoz ennek a lépéssornak **semmi
köze** - a webes eszköz és az MCP szerver két teljesen külön, egymástól
független módja ugyanannak a motornak a használatára. Az MCP-hez mindig a
saját gépeden futó Node.js-re és erre a repóra van szükség, nem a domainre.

### Ha valóban "csak URL-lel, telepítés nélkül" szeretnéd elérni bármelyik gépről

Ez technikailag megoldható, de **nem ezzel a szerverrel**, hanem egy külön,
HTTP transportú MCP szerver Node.js hosztingra (pl. VPS, Render, Railway,
Fly.io - a `nemesbalazs.hu` PHP tárhelye önmagában valószínűleg nem elég,
hacsak nincs rajta Node.js app funkció is). Az így felállított szerver
esetén a regisztráció ennyi lenne, bármelyik gépen:

```bash
claude mcp add --transport http jsobfuscator https://<a-te-mcp-domained>/
```

Ez egy külön fejlesztési feladat lenne (HTTP transport bekötése a meglévő
`obfuscate_js` tool logika köré, majd deploy egy Node-ot futtató helyre) -
jelenleg nincs megvalósítva, ez a szakasz csak azt dokumentálja, mi lenne
hozzá az irány, ha később ezt választanád.
