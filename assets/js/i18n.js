/**
 * JS Obfuszkátor - fordítási szótár (hu/en/de) és alkalmazó logika.
 *
 * Nincs build lépés, ezért egyetlen sima JS objektum tartalmazza az összes
 * felület-szöveget kulcs -> fordítás formában. Az app.js induláskor (és
 * nyelvváltáskor) meghívja window.OBF_I18N.apply(lang)-et, ami minden
 * [data-i18n*] attribútumos elemet frissít.
 */
(function () {
    "use strict";

    var TRANSLATIONS = {
        hu: {
            "meta.title": "JS Obfuszkátor",
            "meta.description": "Saját hosztolású JavaScript kód-védelem — a forráskód sosem hagyja el a böngészőt.",

            "header.title": "JS Obfuszkátor",
            "header.subtitle": "Saját hosztolású JavaScript kód-védelem — a forráskód sosem hagyja el a böngészőt.",
            "header.themeToggle.label": "Világos/sötét téma váltása",
            "header.langToggle.label": "Nyelv váltása",

            "preset.default": "Alapértelmezett",
            "preset.low": "Gyors",
            "preset.medium": "Kiegyensúlyozott",
            "preset.high": "Erős védelem",
            "preset.custom": "Egyéni",

            "panel.input.title": "Bemenet",
            "panel.input.placeholder": "Illeszd be ide a JavaScript kódot...",
            "panel.output.title": "Kimenet",
            "panel.output.placeholder": "Az obfuszkált kód itt jelenik meg...",

            "btn.fileUpload": "Fájl feltöltése",
            "btn.reset": "Reset",
            "btn.obfuscate": "Obfuszkálás",
            "btn.copy": "Másolás",
            "btn.copy.done": "Másolva!",
            "btn.download": "Letöltés",

            "options.header": "Opciók",

            "group.renaming": "Névátalakítás",
            "label.identifierNamesGenerator": "Névgenerálás módja",
            "option.identifierNamesGenerator.hexadecimal": "hexadecimal (_0xabc123)",
            "option.identifierNamesGenerator.mangled": "mangled (a, b, c...)",
            "option.identifierNamesGenerator.mangledShuffled": "mangled-shuffled",
            "option.identifierNamesGenerator.dictionary": "dictionary",
            "desc.identifierNamesGenerator": "A változó- és függvénynevek generálásának módja.",

            "label.renameGlobals": "Globális nevek átírása",
            "desc.renameGlobals": "⚠️ Törheti a kódot, ha más <script> tag vagy inline HTML esemény név szerint hivatkozik rájuk (pl. onclick=\"fuggveny()\").",

            "label.renameProperties": "Objektum-tulajdonságok átírása",
            "option.renamePropertiesMode.safe": "safe",
            "option.renamePropertiesMode.unsafe": "unsafe",
            "desc.renameProperties": "⚠️ Még \"safe\" módban is törhet olyan kódot, ami DOM-elemek vagy külső könyvtárak property-jeit stringként éri el.",

            "label.identifiersPrefix": "Azonosító előtag",
            "placeholder.identifiersPrefix": "pl. app_",
            "desc.identifiersPrefix": "Egyedi előtag minden globális azonosítóhoz. Több, külön obfuszkált fájl esetén hasznos, hogy a generált nevek ne ütközzenek.",

            "group.stringProtection": "String védelem",
            "label.stringArray": "String tömbösítés",
            "desc.stringArray": "A szöveges literálokat egy közös tömbbe gyűjti, a kódban csak index-szel hivatkozik rájuk.",

            "label.stringArrayThreshold": "String tömb küszöb",
            "desc.stringArrayThreshold": "Mekkora eséllyel kerüljön egy adott string a tömbbe. 1 = minden string, 0 = kikapcsolva.",

            "label.stringArrayEncoding": "String kódolás",
            "option.stringArrayEncoding.base64": "base64",
            "option.stringArrayEncoding.rc4": "rc4",
            "desc.stringArrayEncoding": "base64: gyors. rc4: erősebb, de kb. 30-50%-kal lassabb futásidőt eredményez. RC4 esetén ajánlott kikapcsolni az unicode escape opciót.",

            "label.stringArrayRotate": "String tömb eltolása",
            "label.stringArrayShuffle": "String tömb összekeverése",
            "desc.stringArrayShuffle": "A string-tömb elemeinek eltolása/összekeverése, hogy a sorrendből ne lehessen visszakövetkeztetni az eredeti helyre.",

            "label.stringArrayWrappersCount": "Csomagolók száma",
            "option.stringArrayWrappersType.variable": "variable",
            "option.stringArrayWrappersType.function": "function",
            "desc.stringArrayWrappersCount": "Hány és milyen típusú \"csomagoló\" hívja a string-tömböt. A function típus erősebb védelmet ad, de lassabb.",

            "label.splitStrings": "Hosszú stringek darabolása",
            "desc.splitStrings": "Hosszú stringeket kisebb darabokra vág és összefűzi.",

            "label.unicodeEscapeSequence": "Unicode escape kódolás",
            "desc.unicodeEscapeSequence": "⚠️ A stringeket unicode escape formára alakítja (pl. \\u0041). Nagyban növeli a fájlméretet, csak kisebb kódrészletekhez ajánlott.",

            "group.codeStructure": "Kódstruktúra",
            "label.controlFlowFlattening": "Vezérlési folyamat \"ellaposítása\"",
            "desc.controlFlowFlattening": "⚠️ Az if/else, for, while szerkezeteket switch-alapú állapotgéppé alakítja. Akár 1.5x-ös futásidő-lassulást is okozhat.",

            "label.deadCodeInjection": "Halott kód beszúrása",
            "desc.deadCodeInjection": "⚠️ Véletlenszerű, soha le nem futó kódblokkokat szúr be. Akár 200%-kal is megnövelheti a fájlméretet. Automatikusan bekapcsolja a string tömbösítést.",

            "label.numbersToExpressions": "Számok kifejezésekké alakítása",
            "desc.numbersToExpressions": "A számliterálokat matematikai kifejezésekké alakítja.",

            "label.simplify": "Egyszerűsítés",
            "desc.simplify": "További apró egyszerűsítő/összevonó trükkök. Ajánlott bekapcsolva hagyni.",

            "label.transformObjectKeys": "Objektum kulcsok átalakítása",
            "desc.transformObjectKeys": "Az objektum kulcsneveit is a string-tömbön keresztüli hivatkozásra cseréli.",

            "group.runtimeProtection": "Futásidő-védelem",
            "label.selfDefending": "Öndefenzív kód",
            "desc.selfDefending": "⚠️ A kimenet ellenáll az utólagos formázásnak/széppé tételnek. Ha bekapcsolod, az obfuszkált kimenetet utólag semmilyen módon ne módosítsd.",

            "label.debugProtection": "Debug védelem",
            "desc.debugProtection": "⚠️ Megnehezíti a Fejlesztői eszközök (F12) használatát. Lefagyaszthatja a böngészőt/lapot, ha valaki megnyitja a DevTools-t. Csak akkor ajánlott, ha éles környezetben biztosan senki nem debugol.",

            "label.disableConsoleOutput": "Konzol kimenet letiltása",
            "desc.disableConsoleOutput": "Kikapcsolja a console.log/warn/error hívásokat. Éles build-nél hasznos.",

            "label.domainLock": "Domain zárolás",
            "placeholder.domainLock": "pelda.hu\naldomain.pelda.hu",
            "label.domainLockRedirectUrl": "Átirányítási URL más domainen",
            "placeholder.domainLockRedirectUrl": "https://pelda.hu",
            "desc.domainLock": "A kód csak a megadott domain(ek)en fusson; máshol a megadott URL-re irányítja át a böngészőt. Nem működik \"node\" targettel.",

            "group.outputCompat": "Kimenet / kompatibilitás",
            "label.compact": "Tömörített kimenet",
            "desc.compact": "A kimenetet egy sorba tömöríti, extra szóköz/sortörés nélkül.",

            "label.target": "Célkörnyezet",
            "option.target.browser": "browser",
            "option.target.browserNoEval": "browser-no-eval",
            "option.target.node": "node",
            "desc.target": "browser-no-eval akkor hasznos, ha az oldal szigorú Content-Security-Policy-ja tiltja az eval() használatát.",

            "label.seed": "Véletlen mag (seed)",
            "desc.seed": "Rögzített érték esetén ugyanabból a bemenetből és beállításokból mindig ugyanaz a kimenet születik. 0 = kikapcsolva.",

            "label.sourceMap": "Forrástérkép generálása",
            "desc.sourceMap": "⚠️ Éles, publikusan elérhető build mellé ne tedd ki – visszaadja az eredeti, olvasható kódot.",

            "group.exclusions": "Kizárási lista",
            "label.reservedNames": "Kizárt nevek (regex, soronként)",
            "placeholder.reservedNames": "^_get_\n^_set_\npublikusFuggveny",
            "desc.reservedNames": "Az ide illeszkedő névvel rendelkező azonosítók nem lesznek átírva/generálva.",

            "label.reservedStrings": "Kizárt stringek (regex, soronként)",
            "placeholder.reservedStrings": "^API_KEY_PLACEHOLDER$",
            "desc.reservedStrings": "Az ide illeszkedő string-literálok nem kerülnek a string-tömbbe / nem lesznek kódolva.",

            "footer.disclaimer": "Az obfuszkálás nem egyenlő titkosítással — a cél a visszafejtéshez szükséges munka növelése, nem az áttörhetetlenség.",

            "msg.noInput": "Nincs bemeneti kód.",
            "msg.engineNotLoaded": "Az obfuszkáló motor nem töltődött be.",
            "msg.obfuscateError": "Hiba az obfuszkálás közben: ",
            "msg.copyFailed": "A vágólapra másolás nem sikerült.",
            "msg.fileReadFailed": "A fájl beolvasása nem sikerült."
        },

        en: {
            "meta.title": "JS Obfuscator",
            "meta.description": "Self-hosted JavaScript code protection — your source code never leaves the browser.",

            "header.title": "JS Obfuscator",
            "header.subtitle": "Self-hosted JavaScript code protection — your source code never leaves the browser.",
            "header.themeToggle.label": "Toggle light/dark theme",
            "header.langToggle.label": "Change language",

            "preset.default": "Default",
            "preset.low": "Fast",
            "preset.medium": "Balanced",
            "preset.high": "Strong protection",
            "preset.custom": "Custom",

            "panel.input.title": "Input",
            "panel.input.placeholder": "Paste your JavaScript code here...",
            "panel.output.title": "Output",
            "panel.output.placeholder": "The obfuscated code will appear here...",

            "btn.fileUpload": "Upload file",
            "btn.reset": "Reset",
            "btn.obfuscate": "Obfuscate",
            "btn.copy": "Copy",
            "btn.copy.done": "Copied!",
            "btn.download": "Download",

            "options.header": "Options",

            "group.renaming": "Name mangling",
            "label.identifierNamesGenerator": "Name generation mode",
            "option.identifierNamesGenerator.hexadecimal": "hexadecimal (_0xabc123)",
            "option.identifierNamesGenerator.mangled": "mangled (a, b, c...)",
            "option.identifierNamesGenerator.mangledShuffled": "mangled-shuffled",
            "option.identifierNamesGenerator.dictionary": "dictionary",
            "desc.identifierNamesGenerator": "How variable and function names are generated.",

            "label.renameGlobals": "Rename global names",
            "desc.renameGlobals": "⚠️ May break code if another <script> tag or inline HTML event references them by name (e.g. onclick=\"myFunc()\").",

            "label.renameProperties": "Rename object properties",
            "option.renamePropertiesMode.safe": "safe",
            "option.renamePropertiesMode.unsafe": "unsafe",
            "desc.renameProperties": "⚠️ Even in \"safe\" mode this can break code that accesses DOM elements' or external libraries' properties as strings.",

            "label.identifiersPrefix": "Identifier prefix",
            "placeholder.identifiersPrefix": "e.g. app_",
            "desc.identifiersPrefix": "A unique prefix for every global identifier. Useful when obfuscating multiple separate files, so generated names don't collide.",

            "group.stringProtection": "String protection",
            "label.stringArray": "String array",
            "desc.stringArray": "Collects text literals into a shared array, referencing them by index in the code.",

            "label.stringArrayThreshold": "String array threshold",
            "desc.stringArrayThreshold": "The chance that a given string ends up in the array. 1 = every string, 0 = disabled.",

            "label.stringArrayEncoding": "String encoding",
            "option.stringArrayEncoding.base64": "base64",
            "option.stringArrayEncoding.rc4": "rc4",
            "desc.stringArrayEncoding": "base64: fast. rc4: stronger, but roughly 30-50% slower at runtime. With RC4 it's recommended to disable the unicode escape option.",

            "label.stringArrayRotate": "Rotate string array",
            "label.stringArrayShuffle": "Shuffle string array",
            "desc.stringArrayShuffle": "Shifts/shuffles the string array's elements so the original position can't be inferred from order.",

            "label.stringArrayWrappersCount": "Number of wrappers",
            "option.stringArrayWrappersType.variable": "variable",
            "option.stringArrayWrappersType.function": "function",
            "desc.stringArrayWrappersCount": "How many, and what type of, \"wrapper\" calls the string array. The function type gives stronger protection but is slower.",

            "label.splitStrings": "Split long strings",
            "desc.splitStrings": "Splits long strings into smaller chunks and concatenates them.",

            "label.unicodeEscapeSequence": "Unicode escape encoding",
            "desc.unicodeEscapeSequence": "⚠️ Converts strings to unicode escape form (e.g. \\u0041). Greatly increases file size, recommended only for smaller code snippets.",

            "group.codeStructure": "Code structure",
            "label.controlFlowFlattening": "Control flow flattening",
            "desc.controlFlowFlattening": "⚠️ Converts if/else, for, while structures into a switch-based state machine. Can cause up to a 1.5x runtime slowdown.",

            "label.deadCodeInjection": "Dead code injection",
            "desc.deadCodeInjection": "⚠️ Inserts random code blocks that never run. Can increase file size by up to 200%. Automatically enables the string array.",

            "label.numbersToExpressions": "Numbers to expressions",
            "desc.numbersToExpressions": "Converts number literals into mathematical expressions.",

            "label.simplify": "Simplify",
            "desc.simplify": "Additional minor simplification/merging tricks. Recommended to keep enabled.",

            "label.transformObjectKeys": "Transform object keys",
            "desc.transformObjectKeys": "Also replaces object key names with a reference through the string array.",

            "group.runtimeProtection": "Runtime protection",
            "label.selfDefending": "Self-defending code",
            "desc.selfDefending": "⚠️ The output resists later formatting/beautifying. If enabled, never modify the obfuscated output afterwards in any way.",

            "label.debugProtection": "Debug protection",
            "desc.debugProtection": "⚠️ Makes using Developer Tools (F12) harder. May freeze the browser/tab if someone opens DevTools. Only recommended if you're certain no one will debug in production.",

            "label.disableConsoleOutput": "Disable console output",
            "desc.disableConsoleOutput": "Disables console.log/warn/error calls. Useful for production builds.",

            "label.domainLock": "Domain lock",
            "placeholder.domainLock": "example.com\nsub.example.com",
            "label.domainLockRedirectUrl": "Redirect URL for other domains",
            "placeholder.domainLockRedirectUrl": "https://example.com",
            "desc.domainLock": "The code will only run on the given domain(s); elsewhere it redirects the browser to the given URL. Doesn't work with the \"node\" target.",

            "group.outputCompat": "Output / compatibility",
            "label.compact": "Compact output",
            "desc.compact": "Compresses the output into a single line, without extra whitespace or line breaks.",

            "label.target": "Target environment",
            "option.target.browser": "browser",
            "option.target.browserNoEval": "browser-no-eval",
            "option.target.node": "node",
            "desc.target": "browser-no-eval is useful when the page's strict Content-Security-Policy forbids using eval().",

            "label.seed": "Random seed",
            "desc.seed": "With a fixed value, the same input and settings always produce the same output. 0 = disabled.",

            "label.sourceMap": "Generate source map",
            "desc.sourceMap": "⚠️ Don't ship this alongside a public production build – it reveals the original, readable code.",

            "group.exclusions": "Exclusion list",
            "label.reservedNames": "Excluded names (regex, one per line)",
            "placeholder.reservedNames": "^_get_\n^_set_\npublicFunction",
            "desc.reservedNames": "Identifiers matching these patterns will not be renamed/generated.",

            "label.reservedStrings": "Excluded strings (regex, one per line)",
            "placeholder.reservedStrings": "^API_KEY_PLACEHOLDER$",
            "desc.reservedStrings": "String literals matching these patterns won't be placed in the string array / won't be encoded.",

            "footer.disclaimer": "Obfuscation is not the same as encryption — the goal is to increase the effort needed to reverse it, not to make it unbreakable.",

            "msg.noInput": "No input code.",
            "msg.engineNotLoaded": "The obfuscation engine failed to load.",
            "msg.obfuscateError": "Error while obfuscating: ",
            "msg.copyFailed": "Copying to clipboard failed.",
            "msg.fileReadFailed": "Failed to read the file."
        },

        de: {
            "meta.title": "JS-Obfuskator",
            "meta.description": "Selbst gehosteter JavaScript-Codeschutz — der Quellcode verlässt niemals den Browser.",

            "header.title": "JS-Obfuskator",
            "header.subtitle": "Selbst gehosteter JavaScript-Codeschutz — der Quellcode verlässt niemals den Browser.",
            "header.themeToggle.label": "Hell-/Dunkelmodus umschalten",
            "header.langToggle.label": "Sprache ändern",

            "preset.default": "Standard",
            "preset.low": "Schnell",
            "preset.medium": "Ausgewogen",
            "preset.high": "Starker Schutz",
            "preset.custom": "Benutzerdefiniert",

            "panel.input.title": "Eingabe",
            "panel.input.placeholder": "Füge hier deinen JavaScript-Code ein...",
            "panel.output.title": "Ausgabe",
            "panel.output.placeholder": "Der obfuskierte Code erscheint hier...",

            "btn.fileUpload": "Datei hochladen",
            "btn.reset": "Zurücksetzen",
            "btn.obfuscate": "Obfuskieren",
            "btn.copy": "Kopieren",
            "btn.copy.done": "Kopiert!",
            "btn.download": "Herunterladen",

            "options.header": "Optionen",

            "group.renaming": "Namensumwandlung",
            "label.identifierNamesGenerator": "Modus der Namensgenerierung",
            "option.identifierNamesGenerator.hexadecimal": "hexadecimal (_0xabc123)",
            "option.identifierNamesGenerator.mangled": "mangled (a, b, c...)",
            "option.identifierNamesGenerator.mangledShuffled": "mangled-shuffled",
            "option.identifierNamesGenerator.dictionary": "dictionary",
            "desc.identifierNamesGenerator": "Wie Variablen- und Funktionsnamen generiert werden.",

            "label.renameGlobals": "Globale Namen umbenennen",
            "desc.renameGlobals": "⚠️ Kann den Code beschädigen, wenn ein anderer <script>-Tag oder ein Inline-HTML-Ereignis sie namentlich referenziert (z. B. onclick=\"funktion()\").",

            "label.renameProperties": "Objekteigenschaften umbenennen",
            "option.renamePropertiesMode.safe": "safe",
            "option.renamePropertiesMode.unsafe": "unsafe",
            "desc.renameProperties": "⚠️ Auch im \"safe\"-Modus kann dies Code beschädigen, der auf Eigenschaften von DOM-Elementen oder externen Bibliotheken als Strings zugreift.",

            "label.identifiersPrefix": "Bezeichner-Präfix",
            "placeholder.identifiersPrefix": "z. B. app_",
            "desc.identifiersPrefix": "Ein eindeutiges Präfix für jeden globalen Bezeichner. Nützlich bei mehreren separat obfuskierten Dateien, damit generierte Namen nicht kollidieren.",

            "group.stringProtection": "String-Schutz",
            "label.stringArray": "String-Array",
            "desc.stringArray": "Sammelt Textliterale in einem gemeinsamen Array und referenziert sie im Code nur über den Index.",

            "label.stringArrayThreshold": "String-Array-Schwellenwert",
            "desc.stringArrayThreshold": "Wahrscheinlichkeit, mit der ein String ins Array aufgenommen wird. 1 = jeder String, 0 = deaktiviert.",

            "label.stringArrayEncoding": "String-Kodierung",
            "option.stringArrayEncoding.base64": "base64",
            "option.stringArrayEncoding.rc4": "rc4",
            "desc.stringArrayEncoding": "base64: schnell. rc4: stärker, aber etwa 30-50% langsamer zur Laufzeit. Bei RC4 wird empfohlen, die Unicode-Escape-Option zu deaktivieren.",

            "label.stringArrayRotate": "String-Array rotieren",
            "label.stringArrayShuffle": "String-Array mischen",
            "desc.stringArrayShuffle": "Verschiebt/mischt die Elemente des String-Arrays, damit die ursprüngliche Position nicht aus der Reihenfolge ableitbar ist.",

            "label.stringArrayWrappersCount": "Anzahl der Wrapper",
            "option.stringArrayWrappersType.variable": "variable",
            "option.stringArrayWrappersType.function": "function",
            "desc.stringArrayWrappersCount": "Wie viele und welche Art von \"Wrapper\" das String-Array aufrufen. Der Typ function bietet stärkeren Schutz, ist aber langsamer.",

            "label.splitStrings": "Lange Strings aufteilen",
            "desc.splitStrings": "Teilt lange Strings in kleinere Teile und fügt sie wieder zusammen.",

            "label.unicodeEscapeSequence": "Unicode-Escape-Kodierung",
            "desc.unicodeEscapeSequence": "⚠️ Wandelt Strings in Unicode-Escape-Form um (z. B. \\u0041). Erhöht die Dateigröße erheblich, empfohlen nur für kleinere Codeabschnitte.",

            "group.codeStructure": "Codestruktur",
            "label.controlFlowFlattening": "Kontrollfluss-Abflachung",
            "desc.controlFlowFlattening": "⚠️ Wandelt if/else-, for-, while-Strukturen in eine switch-basierte Zustandsmaschine um. Kann bis zu einer 1,5-fachen Laufzeitverlangsamung führen.",

            "label.deadCodeInjection": "Toten Code einfügen",
            "desc.deadCodeInjection": "⚠️ Fügt zufällige, nie ausgeführte Codeblöcke ein. Kann die Dateigröße um bis zu 200% erhöhen. Aktiviert automatisch das String-Array.",

            "label.numbersToExpressions": "Zahlen in Ausdrücke umwandeln",
            "desc.numbersToExpressions": "Wandelt Zahlenliterale in mathematische Ausdrücke um.",

            "label.simplify": "Vereinfachen",
            "desc.simplify": "Weitere kleine Vereinfachungs-/Zusammenführungstricks. Empfohlen, aktiviert zu lassen.",

            "label.transformObjectKeys": "Objektschlüssel umwandeln",
            "desc.transformObjectKeys": "Ersetzt auch Objektschlüsselnamen durch eine Referenz über das String-Array.",

            "group.runtimeProtection": "Laufzeitschutz",
            "label.selfDefending": "Selbstverteidigender Code",
            "desc.selfDefending": "⚠️ Die Ausgabe widersteht nachträglicher Formatierung/Verschönerung. Wenn aktiviert, die obfuskierte Ausgabe nachträglich in keiner Weise verändern.",

            "label.debugProtection": "Debug-Schutz",
            "desc.debugProtection": "⚠️ Erschwert die Nutzung der Entwicklertools (F12). Kann den Browser/Tab einfrieren, wenn jemand die DevTools öffnet. Nur empfohlen, wenn sicher ist, dass in der Produktion niemand debuggt.",

            "label.disableConsoleOutput": "Konsolenausgabe deaktivieren",
            "desc.disableConsoleOutput": "Deaktiviert console.log/warn/error-Aufrufe. Nützlich für Produktions-Builds.",

            "label.domainLock": "Domain-Sperre",
            "placeholder.domainLock": "beispiel.de\nsub.beispiel.de",
            "label.domainLockRedirectUrl": "Weiterleitungs-URL für andere Domains",
            "placeholder.domainLockRedirectUrl": "https://beispiel.de",
            "desc.domainLock": "Der Code läuft nur auf den angegebenen Domain(s); andernorts wird der Browser auf die angegebene URL umgeleitet. Funktioniert nicht mit dem Ziel \"node\".",

            "group.outputCompat": "Ausgabe / Kompatibilität",
            "label.compact": "Kompakte Ausgabe",
            "desc.compact": "Komprimiert die Ausgabe in eine einzige Zeile, ohne zusätzliche Leerzeichen/Zeilenumbrüche.",

            "label.target": "Zielumgebung",
            "option.target.browser": "browser",
            "option.target.browserNoEval": "browser-no-eval",
            "option.target.node": "node",
            "desc.target": "browser-no-eval ist nützlich, wenn die strikte Content-Security-Policy der Seite eval() verbietet.",

            "label.seed": "Zufalls-Seed",
            "desc.seed": "Bei einem festen Wert erzeugen dieselbe Eingabe und Einstellungen immer dieselbe Ausgabe. 0 = deaktiviert.",

            "label.sourceMap": "Source Map generieren",
            "desc.sourceMap": "⚠️ Nicht zusammen mit einem öffentlich zugänglichen Produktions-Build bereitstellen – gibt den ursprünglichen, lesbaren Code preis.",

            "group.exclusions": "Ausschlussliste",
            "label.reservedNames": "Ausgeschlossene Namen (Regex, pro Zeile)",
            "placeholder.reservedNames": "^_get_\n^_set_\noeffentlicheFunktion",
            "desc.reservedNames": "Bezeichner, die diesem Muster entsprechen, werden nicht umbenannt/generiert.",

            "label.reservedStrings": "Ausgeschlossene Strings (Regex, pro Zeile)",
            "placeholder.reservedStrings": "^API_KEY_PLACEHOLDER$",
            "desc.reservedStrings": "String-Literale, die diesem Muster entsprechen, werden nicht ins String-Array aufgenommen bzw. nicht kodiert.",

            "footer.disclaimer": "Obfuskierung ist nicht dasselbe wie Verschlüsselung — das Ziel ist, den für die Rückentwicklung nötigen Aufwand zu erhöhen, nicht Unknackbarkeit.",

            "msg.noInput": "Kein Eingabecode vorhanden.",
            "msg.engineNotLoaded": "Die Obfuskierungs-Engine konnte nicht geladen werden.",
            "msg.obfuscateError": "Fehler beim Obfuskieren: ",
            "msg.copyFailed": "Kopieren in die Zwischenablage fehlgeschlagen.",
            "msg.fileReadFailed": "Die Datei konnte nicht gelesen werden."
        }
    };

    var SUPPORTED_LANGS = ["hu", "en", "de"];
    var DEFAULT_LANG = "hu";

    function isSupported(lang) {
        return SUPPORTED_LANGS.indexOf(lang) !== -1;
    }

    function t(lang, key) {
        var dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
        if (dict && Object.prototype.hasOwnProperty.call(dict, key)) {
            return dict[key];
        }
        // Ismeretlen kulcs vagy hiányzó fordítás esetén essünk vissza a
        // magyarra, hogy sose maradjon üresen egy elem.
        var fallback = TRANSLATIONS[DEFAULT_LANG];
        return fallback && Object.prototype.hasOwnProperty.call(fallback, key) ? fallback[key] : "";
    }

    /**
     * Minden data-i18n* attribútumos elemet frissít az adott nyelv szerint.
     *  - data-i18n            -> textContent
     *  - data-i18n-placeholder -> placeholder attribútum
     *  - data-i18n-aria-label  -> aria-label attribútum
     *  - data-i18n-title       -> title attribútum
     */
    function apply(lang) {
        if (!isSupported(lang)) {
            lang = DEFAULT_LANG;
        }

        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            el.textContent = t(lang, el.getAttribute("data-i18n"));
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            el.setAttribute("placeholder", t(lang, el.getAttribute("data-i18n-placeholder")));
        });
        document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
            el.setAttribute("aria-label", t(lang, el.getAttribute("data-i18n-aria-label")));
        });
        document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
            el.setAttribute("title", t(lang, el.getAttribute("data-i18n-title")));
        });

        document.title = t(lang, "meta.title");
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", t(lang, "meta.description"));
        }
    }

    window.OBF_I18N = {
        SUPPORTED_LANGS: SUPPORTED_LANGS,
        DEFAULT_LANG: DEFAULT_LANG,
        isSupported: isSupported,
        t: t,
        apply: apply
    };
})();
