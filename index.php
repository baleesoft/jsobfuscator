<?php
/**
 * JS Obfuszkátor - fő oldal.
 *
 * Ez a fájl kizárólag statikus HTML-t szolgál ki.
 * Az obfuszkálás teljes egészében a böngészőben, kliensoldali JS-ben
 * fut (assets/js/app.js + assets/js/vendor/javascript-obfuscator-*.browser.js) -
 * a beillesztett forráskód soha nem kerül ehhez a PHP fájlhoz vagy
 * bármilyen szerveroldali végponthoz. Az egyetlen szerveroldali
 * végpont (api/presets.php) kizárólag a motor opció-beállításait
 * (JSON) menti/adja vissza presetként - forráskódot soha nem lát.
 *
 * Minden erőforrás-hivatkozás relatív útvonalú, hogy az oldal
 * tetszőleges alkönyvtárba telepítve is működjön.
 */

// --- Nyelv-észlelés (csak a PHP-oldalon renderelt title/meta/lang célra) ---
// A tényleges felületi szövegeket a kliensoldali i18n.js cseréli le a
// data-i18n attribútumok alapján; itt csak a <title>/<meta description>
// és a <html lang> kezdeti értékét határozzuk meg, hogy már az első
// byte-tól a helyes nyelven érkezzen.
$OBF_SUPPORTED_LANGS = array("hu", "en", "de");
$OBF_DEFAULT_LANG = "hu";

function obf_detect_lang($supported, $default) {
    if (!empty($_COOKIE["jsobf_lang"]) && in_array($_COOKIE["jsobf_lang"], $supported, true)) {
        return $_COOKIE["jsobf_lang"];
    }
    if (!empty($_SERVER["HTTP_ACCEPT_LANGUAGE"])) {
        $accepted = explode(",", $_SERVER["HTTP_ACCEPT_LANGUAGE"]);
        foreach ($accepted as $entry) {
            $code = strtolower(trim(explode(";", $entry)[0]));
            $code = substr($code, 0, 2);
            if (in_array($code, $supported, true)) {
                return $code;
            }
        }
    }
    return $default;
}

$obf_lang = obf_detect_lang($OBF_SUPPORTED_LANGS, $OBF_DEFAULT_LANG);

$OBF_PHP_I18N = array(
    "hu" => array(
        "title" => "JS Obfuszkátor",
        "description" => "Saját hosztolású JavaScript kód-védelem — a forráskód sosem hagyja el a böngészőt.",
    ),
    "en" => array(
        "title" => "JS Obfuscator",
        "description" => "Self-hosted JavaScript code protection — your source code never leaves the browser.",
    ),
    "de" => array(
        "title" => "JS-Obfuskator",
        "description" => "Selbst gehosteter JavaScript-Codeschutz — der Quellcode verlässt niemals den Browser.",
    ),
);
$obf_text = $OBF_PHP_I18N[$obf_lang];
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($obf_lang); ?>">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="<?php echo htmlspecialchars($obf_text["description"]); ?>">
<title><?php echo htmlspecialchars($obf_text["title"]); ?></title>
<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
<link rel="stylesheet" href="assets/css/style.css">
<!-- Google Consent Mode v2 - alapértelmezetten "denied", amíg a látogató
     el nem fogadja a cookie-consent bannert (assets/js/consent.js). -->
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
    });
    gtag('js', new Date());
    gtag('config', 'G-83X8TCC7KW');
</script>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-83X8TCC7KW"></script>
<script>
    // Minél előbb beállítjuk a mentett témát és nyelvet (localStorage),
    // hogy ne villanjon fel az alapértelmezés, mielőtt app.js lefutna.
    (function () {
        try {
            var savedTheme = localStorage.getItem("jsobf-theme");
            if (savedTheme === "light" || savedTheme === "dark") {
                document.documentElement.setAttribute("data-theme", savedTheme);
            }
        } catch (e) {
            // localStorage nem elérhető (pl. letiltva) - marad az alap sötét téma.
        }
        try {
            var savedLang = localStorage.getItem("jsobf-lang");
            if (savedLang === "hu" || savedLang === "en" || savedLang === "de") {
                document.documentElement.setAttribute("lang", savedLang);
            }
        } catch (e) {
            // localStorage nem elérhető - marad a szerver által meghatározott nyelv.
        }
    })();
</script>
</head>
<body>

<div class="sticky-bar" id="sticky-bar">

    <header class="site-header">
        <div class="site-header__top">
            <h1 data-i18n="header.title"><?php echo htmlspecialchars($obf_text["title"]); ?></h1>
            <div class="site-header__controls">
                <div class="lang-switcher" id="lang-switcher">
                    <button id="btn-lang-toggle" class="lang-switcher__button" type="button"
                            aria-haspopup="listbox" aria-expanded="false"
                            data-i18n-aria-label="header.langToggle.label" aria-label="Nyelv váltása">
                        <span id="lang-flag">🇭🇺</span> <span id="lang-code">HU</span>
                    </button>
                    <ul class="lang-switcher__menu" id="lang-menu" role="listbox" hidden>
                        <li role="option" data-lang="hu"><button type="button">🇭🇺 Magyar</button></li>
                        <li role="option" data-lang="en"><button type="button">🇬🇧 English</button></li>
                        <li role="option" data-lang="de"><button type="button">🇩🇪 Deutsch</button></li>
                    </ul>
                </div>
                <button id="btn-theme-toggle" class="theme-toggle" type="button"
                        data-i18n-aria-label="header.themeToggle.label" aria-label="Világos/sötét téma váltása"
                        data-i18n-title="header.themeToggle.label" title="Világos/sötét téma váltása">🌙</button>
            </div>
        </div>
        <p class="site-header__subtitle" data-i18n="header.subtitle"><?php echo htmlspecialchars($obf_text["description"]); ?></p>
    </header>

    <div class="preset-bar" id="preset-bar">
        <button class="preset-btn" data-preset="default" data-i18n="preset.default">Alapértelmezett</button>
        <button class="preset-btn" data-preset="low-obfuscation" data-i18n="preset.low">Gyors</button>
        <button class="preset-btn" data-preset="medium-obfuscation" data-i18n="preset.medium">Kiegyensúlyozott</button>
        <button class="preset-btn" data-preset="high-obfuscation" data-i18n="preset.high">Erős védelem</button>
        <span class="preset-btn preset-btn--custom" id="preset-custom-indicator" data-i18n="preset.custom" hidden>Egyéni</span>
    </div>

    <main class="layout">

        <section class="panel panel--input">
            <div class="panel__header">
                <h2 data-i18n="panel.input.title">Bemenet</h2>
                <span class="size-indicator" id="input-size">0 B</span>
            </div>
            <textarea id="input-code" class="code-area" spellcheck="false" data-i18n-placeholder="panel.input.placeholder" placeholder="Illeszd be ide a JavaScript kódot..."></textarea>
            <div class="panel__actions">
                <label class="button button--secondary file-upload-label">
                    <span data-i18n="btn.fileUpload">Fájl feltöltése</span>
                    <input type="file" id="file-upload" accept=".js,.txt" hidden>
                </label>
                <button id="btn-reset" class="button button--secondary" data-i18n="btn.reset">Reset</button>
                <button id="btn-obfuscate" class="button button--primary" data-i18n="btn.obfuscate">Obfuszkálás</button>
            </div>
            <p class="error-message" id="error-message" hidden></p>
        </section>

        <section class="panel panel--output">
            <div class="panel__header">
                <h2 data-i18n="panel.output.title">Kimenet</h2>
                <span class="size-indicator" id="output-size">0 B</span>
            </div>
            <textarea id="output-code" class="code-area" readonly spellcheck="false" data-i18n-placeholder="panel.output.placeholder" placeholder="Az obfuszkált kód itt jelenik meg..."></textarea>
            <div class="panel__actions">
                <button id="btn-copy" class="button button--secondary" disabled data-i18n="btn.copy">Másolás</button>
                <button id="btn-download" class="button button--secondary" disabled data-i18n="btn.download">Letöltés</button>
            </div>
        </section>

    </main>

</div>

<section class="options-section">
    <div class="options-section__header">
        <h2 data-i18n="options.header">Opciók</h2>
    </div>

    <div class="options-grid">

        <details class="option-group" open>
            <summary data-i18n="group.renaming">Névátalakítás</summary>

            <div class="option">
                <label class="option__label" for="opt-identifierNamesGenerator" data-i18n="label.identifierNamesGenerator">Névgenerálás módja</label>
                <select id="opt-identifierNamesGenerator">
                    <option value="hexadecimal" selected data-i18n="option.identifierNamesGenerator.hexadecimal">hexadecimal (_0xabc123)</option>
                    <option value="mangled" data-i18n="option.identifierNamesGenerator.mangled">mangled (a, b, c...)</option>
                    <option value="mangled-shuffled" data-i18n="option.identifierNamesGenerator.mangledShuffled">mangled-shuffled</option>
                    <option value="dictionary" data-i18n="option.identifierNamesGenerator.dictionary">dictionary</option>
                </select>
                <p class="option__desc" data-i18n="desc.identifierNamesGenerator">A változó- és függvénynevek generálásának módja.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-renameGlobals">
                    <span data-i18n="label.renameGlobals">Globális nevek átírása</span>
                </label>
                <p class="option__desc" data-i18n="desc.renameGlobals">⚠️ Törheti a kódot, ha más &lt;script&gt; tag vagy inline HTML esemény név szerint hivatkozik rájuk (pl. onclick="fuggveny()").</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-renameProperties">
                    <span data-i18n="label.renameProperties">Objektum-tulajdonságok átírása</span>
                </label>
                <select id="opt-renamePropertiesMode">
                    <option value="safe" selected data-i18n="option.renamePropertiesMode.safe">safe</option>
                    <option value="unsafe" data-i18n="option.renamePropertiesMode.unsafe">unsafe</option>
                </select>
                <p class="option__desc" data-i18n="desc.renameProperties">⚠️ Még "safe" módban is törhet olyan kódot, ami DOM-elemek vagy külső könyvtárak property-jeit stringként éri el.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-identifiersPrefix" data-i18n="label.identifiersPrefix">Azonosító előtag</label>
                <input type="text" id="opt-identifiersPrefix" data-i18n-placeholder="placeholder.identifiersPrefix" placeholder="pl. app_">
                <p class="option__desc" data-i18n="desc.identifiersPrefix">Egyedi előtag minden globális azonosítóhoz. Több, külön obfuszkált fájl esetén hasznos, hogy a generált nevek ne ütközzenek.</p>
            </div>
        </details>

        <details class="option-group" open>
            <summary data-i18n="group.stringProtection">String védelem</summary>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-stringArray" checked>
                    <span data-i18n="label.stringArray">String tömbösítés</span>
                </label>
                <p class="option__desc" data-i18n="desc.stringArray">A szöveges literálokat egy közös tömbbe gyűjti, a kódban csak index-szel hivatkozik rájuk.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-stringArrayThreshold"><span data-i18n="label.stringArrayThreshold">String tömb küszöb</span> (<span id="stringArrayThreshold-value">0.75</span>)</label>
                <input type="range" id="opt-stringArrayThreshold" min="0" max="1" step="0.05" value="0.75">
                <p class="option__desc" data-i18n="desc.stringArrayThreshold">Mekkora eséllyel kerüljön egy adott string a tömbbe. 1 = minden string, 0 = kikapcsolva.</p>
            </div>

            <div class="option">
                <span class="option__label" data-i18n="label.stringArrayEncoding">String kódolás</span>
                <div class="checkbox-group">
                    <label><input type="checkbox" id="opt-stringArrayEncoding-base64"> <span data-i18n="option.stringArrayEncoding.base64">base64</span></label>
                    <label><input type="checkbox" id="opt-stringArrayEncoding-rc4"> <span data-i18n="option.stringArrayEncoding.rc4">rc4</span></label>
                </div>
                <p class="option__desc" data-i18n="desc.stringArrayEncoding">base64: gyors. rc4: erősebb, de kb. 30-50%-kal lassabb futásidőt eredményez. RC4 esetén ajánlott kikapcsolni az unicode escape opciót.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-stringArrayRotate" checked>
                    <span data-i18n="label.stringArrayRotate">String tömb eltolása</span>
                </label>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-stringArrayShuffle" checked>
                    <span data-i18n="label.stringArrayShuffle">String tömb összekeverése</span>
                </label>
                <p class="option__desc" data-i18n="desc.stringArrayShuffle">A string-tömb elemeinek eltolása/összekeverése, hogy a sorrendből ne lehessen visszakövetkeztetni az eredeti helyre.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-stringArrayWrappersCount" data-i18n="label.stringArrayWrappersCount">Csomagolók száma</label>
                <input type="number" id="opt-stringArrayWrappersCount" min="0" max="20" value="1">
                <select id="opt-stringArrayWrappersType">
                    <option value="variable" selected data-i18n="option.stringArrayWrappersType.variable">variable</option>
                    <option value="function" data-i18n="option.stringArrayWrappersType.function">function</option>
                </select>
                <p class="option__desc" data-i18n="desc.stringArrayWrappersCount">Hány és milyen típusú "csomagoló" hívja a string-tömböt. A function típus erősebb védelmet ad, de lassabb.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-splitStrings">
                    <span data-i18n="label.splitStrings">Hosszú stringek darabolása</span>
                </label>
                <input type="number" id="opt-splitStringsChunkLength" min="1" max="100" value="10">
                <p class="option__desc" data-i18n="desc.splitStrings">Hosszú stringeket kisebb darabokra vág és összefűzi.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-unicodeEscapeSequence">
                    <span data-i18n="label.unicodeEscapeSequence">Unicode escape kódolás</span>
                </label>
                <p class="option__desc" data-i18n="desc.unicodeEscapeSequence">⚠️ A stringeket unicode escape formára alakítja (pl. A). Nagyban növeli a fájlméretet, csak kisebb kódrészletekhez ajánlott.</p>
            </div>
        </details>

        <details class="option-group" open>
            <summary data-i18n="group.codeStructure">Kódstruktúra</summary>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-controlFlowFlattening">
                    <span data-i18n="label.controlFlowFlattening">Vezérlési folyamat "ellaposítása"</span>
                </label>
                <input type="range" id="opt-controlFlowFlatteningThreshold" min="0" max="1" step="0.05" value="0.75">
                <span id="controlFlowFlatteningThreshold-value">0.75</span>
                <p class="option__desc" data-i18n="desc.controlFlowFlattening">⚠️ Az if/else, for, while szerkezeteket switch-alapú állapotgéppé alakítja. Akár 1.5x-ös futásidő-lassulást is okozhat.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-deadCodeInjection">
                    <span data-i18n="label.deadCodeInjection">Halott kód beszúrása</span>
                </label>
                <input type="range" id="opt-deadCodeInjectionThreshold" min="0" max="1" step="0.05" value="0.4">
                <span id="deadCodeInjectionThreshold-value">0.4</span>
                <p class="option__desc" data-i18n="desc.deadCodeInjection">⚠️ Véletlenszerű, soha le nem futó kódblokkokat szúr be. Akár 200%-kal is megnövelheti a fájlméretet. Automatikusan bekapcsolja a string tömbösítést.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-numbersToExpressions">
                    <span data-i18n="label.numbersToExpressions">Számok kifejezésekké alakítása</span>
                </label>
                <p class="option__desc" data-i18n="desc.numbersToExpressions">A számliterálokat matematikai kifejezésekké alakítja.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-simplify" checked>
                    <span data-i18n="label.simplify">Egyszerűsítés</span>
                </label>
                <p class="option__desc" data-i18n="desc.simplify">További apró egyszerűsítő/összevonó trükkök. Ajánlott bekapcsolva hagyni.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-transformObjectKeys">
                    <span data-i18n="label.transformObjectKeys">Objektum kulcsok átalakítása</span>
                </label>
                <p class="option__desc" data-i18n="desc.transformObjectKeys">Az objektum kulcsneveit is a string-tömbön keresztüli hivatkozásra cseréli.</p>
            </div>
        </details>

        <details class="option-group" open>
            <summary data-i18n="group.runtimeProtection">Futásidő-védelem</summary>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-selfDefending">
                    <span data-i18n="label.selfDefending">Öndefenzív kód</span>
                </label>
                <p class="option__desc" data-i18n="desc.selfDefending">⚠️ A kimenet ellenáll az utólagos formázásnak/széppé tételnek. Ha bekapcsolod, az obfuszkált kimenetet utólag semmilyen módon ne módosítsd.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-debugProtection">
                    <span data-i18n="label.debugProtection">Debug védelem</span>
                </label>
                <input type="number" id="opt-debugProtectionInterval" min="0" step="500" value="0">
                <p class="option__desc" data-i18n="desc.debugProtection">⚠️ Megnehezíti a Fejlesztői eszközök (F12) használatát. Lefagyaszthatja a böngészőt/lapot, ha valaki megnyitja a DevTools-t. Csak akkor ajánlott, ha éles környezetben biztosan senki nem debugol.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-disableConsoleOutput">
                    <span data-i18n="label.disableConsoleOutput">Konzol kimenet letiltása</span>
                </label>
                <p class="option__desc" data-i18n="desc.disableConsoleOutput">Kikapcsolja a console.log/warn/error hívásokat. Éles build-nél hasznos.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-domainLock" data-i18n="label.domainLock">Domain zárolás</label>
                <textarea id="opt-domainLock" class="option-textarea" rows="2" data-i18n-placeholder="placeholder.domainLock" placeholder="pelda.hu&#10;aldomain.pelda.hu"></textarea>
                <label class="option__label" for="opt-domainLockRedirectUrl" data-i18n="label.domainLockRedirectUrl">Átirányítási URL más domainen</label>
                <input type="text" id="opt-domainLockRedirectUrl" data-i18n-placeholder="placeholder.domainLockRedirectUrl" placeholder="https://pelda.hu">
                <p class="option__desc" data-i18n="desc.domainLock">A kód csak a megadott domain(ek)en fusson; máshol a megadott URL-re irányítja át a böngészőt. Nem működik "node" targettel.</p>
            </div>
        </details>

        <details class="option-group" open>
            <summary data-i18n="group.outputCompat">Kimenet / kompatibilitás</summary>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-compact" checked>
                    <span data-i18n="label.compact">Tömörített kimenet</span>
                </label>
                <p class="option__desc" data-i18n="desc.compact">A kimenetet egy sorba tömöríti, extra szóköz/sortörés nélkül.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-target" data-i18n="label.target">Célkörnyezet</label>
                <select id="opt-target">
                    <option value="browser" selected data-i18n="option.target.browser">browser</option>
                    <option value="browser-no-eval" data-i18n="option.target.browserNoEval">browser-no-eval</option>
                    <option value="node" data-i18n="option.target.node">node</option>
                </select>
                <p class="option__desc" data-i18n="desc.target">browser-no-eval akkor hasznos, ha az oldal szigorú Content-Security-Policy-ja tiltja az eval() használatát.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-seed" data-i18n="label.seed">Véletlen mag (seed)</label>
                <input type="number" id="opt-seed" min="0" value="0">
                <p class="option__desc" data-i18n="desc.seed">Rögzített érték esetén ugyanabból a bemenetből és beállításokból mindig ugyanaz a kimenet születik. 0 = kikapcsolva.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-sourceMap">
                    <span data-i18n="label.sourceMap">Forrástérkép generálása</span>
                </label>
                <p class="option__desc" data-i18n="desc.sourceMap">⚠️ Éles, publikusan elérhető build mellé ne tedd ki &ndash; visszaadja az eredeti, olvasható kódot.</p>
            </div>
        </details>

        <details class="option-group" open>
            <summary data-i18n="group.exclusions">Kizárási lista</summary>

            <div class="option">
                <label class="option__label" for="opt-reservedNames" data-i18n="label.reservedNames">Kizárt nevek (regex, soronként)</label>
                <textarea id="opt-reservedNames" class="option-textarea" rows="3" data-i18n-placeholder="placeholder.reservedNames" placeholder="^_get_&#10;^_set_&#10;publikusFuggveny"></textarea>
                <p class="option__desc" data-i18n="desc.reservedNames">Az ide illeszkedő névvel rendelkező azonosítók nem lesznek átírva/generálva.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-reservedStrings" data-i18n="label.reservedStrings">Kizárt stringek (regex, soronként)</label>
                <textarea id="opt-reservedStrings" class="option-textarea" rows="3" data-i18n-placeholder="placeholder.reservedStrings" placeholder="^API_KEY_PLACEHOLDER$"></textarea>
                <p class="option__desc" data-i18n="desc.reservedStrings">Az ide illeszkedő string-literálok nem kerülnek a string-tömbbe / nem lesznek kódolva.</p>
            </div>
        </details>

    </div>
</section>

<footer class="site-footer">
    <p data-i18n="footer.disclaimer">Az obfuszkálás nem egyenlő titkosítással &mdash; a cél a visszafejtéshez szükséges munka növelése, nem az áttörhetetlenség.</p>
    <p class="site-footer__links"><a href="privacy.php" data-i18n="footer.privacyLink">Adatvédelmi tájékoztató</a></p>
</footer>

<script src="assets/js/vendor/javascript-obfuscator-5.6.0.browser.js"></script>
<script src="assets/js/presets.js"></script>
<script src="assets/js/i18n.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/consent.js"></script>
</body>
</html>
