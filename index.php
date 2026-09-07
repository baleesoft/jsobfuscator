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
?>
<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>JS Obfuszkátor</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<header class="site-header">
    <h1>JS Obfuszkátor</h1>
    <p class="site-header__subtitle">Saját hosztolású JavaScript kód-védelem &mdash; a forráskód sosem hagyja el a böngészőt.</p>
    <div class="preset-bar" id="preset-bar">
        <button class="preset-btn" data-preset="default">Alapértelmezett</button>
        <button class="preset-btn" data-preset="low-obfuscation">Gyors</button>
        <button class="preset-btn" data-preset="medium-obfuscation">Kiegyensúlyozott</button>
        <button class="preset-btn" data-preset="high-obfuscation">Erős védelem</button>
        <span class="preset-btn preset-btn--custom" id="preset-custom-indicator" hidden>Egyéni</span>
    </div>
    <div class="preset-bar preset-bar--saved" id="saved-preset-bar" hidden>
        <span class="preset-bar__label">Mentett:</span>
        <span id="saved-preset-list"></span>
    </div>
    <div class="save-preset-row">
        <input type="text" id="save-preset-name" placeholder="Új preset neve" maxlength="100">
        <button id="btn-save-preset" class="button button--secondary">Mentés presetként</button>
        <span class="save-preset-status" id="save-preset-status"></span>
    </div>
</header>

<main class="layout">

    <section class="panel panel--input">
        <div class="panel__header">
            <h2>Bemenet</h2>
            <span class="size-indicator" id="input-size">0 B</span>
        </div>
        <textarea id="input-code" class="code-area" spellcheck="false" placeholder="Illeszd be ide a JavaScript kódot..."></textarea>
        <div class="panel__actions">
            <label class="button button--secondary file-upload-label">
                Fájl feltöltése
                <input type="file" id="file-upload" accept=".js,.txt" hidden>
            </label>
            <button id="btn-reset" class="button button--secondary">Reset</button>
        </div>
    </section>

    <section class="panel panel--options">
        <div class="panel__header">
            <h2>Opciók</h2>
        </div>

        <details class="option-group" open>
            <summary>Névátalakítás</summary>

            <div class="option">
                <label class="option__label" for="opt-identifierNamesGenerator">Névgenerálás módja</label>
                <select id="opt-identifierNamesGenerator">
                    <option value="hexadecimal" selected>hexadecimal (_0xabc123)</option>
                    <option value="mangled">mangled (a, b, c...)</option>
                    <option value="mangled-shuffled">mangled-shuffled</option>
                    <option value="dictionary">dictionary</option>
                </select>
                <p class="option__desc">A változó- és függvénynevek generálásának módja.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-renameGlobals">
                    Globális nevek átírása
                </label>
                <p class="option__desc">⚠️ Törheti a kódot, ha más &lt;script&gt; tag vagy inline HTML esemény név szerint hivatkozik rájuk (pl. onclick="fuggveny()").</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-renameProperties">
                    Objektum-tulajdonságok átírása
                </label>
                <select id="opt-renamePropertiesMode">
                    <option value="safe" selected>safe</option>
                    <option value="unsafe">unsafe</option>
                </select>
                <p class="option__desc">⚠️ Még "safe" módban is törhet olyan kódot, ami DOM-elemek vagy külső könyvtárak property-jeit stringként éri el.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-identifiersPrefix">Azonosító előtag</label>
                <input type="text" id="opt-identifiersPrefix" placeholder="pl. app_">
                <p class="option__desc">Egyedi előtag minden globális azonosítóhoz. Több, külön obfuszkált fájl esetén hasznos, hogy a generált nevek ne ütközzenek.</p>
            </div>
        </details>

        <details class="option-group">
            <summary>String védelem</summary>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-stringArray" checked>
                    String tömbösítés
                </label>
                <p class="option__desc">A szöveges literálokat egy közös tömbbe gyűjti, a kódban csak index-szel hivatkozik rájuk.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-stringArrayThreshold">String tömb küszöb (<span id="stringArrayThreshold-value">0.75</span>)</label>
                <input type="range" id="opt-stringArrayThreshold" min="0" max="1" step="0.05" value="0.75">
                <p class="option__desc">Mekkora eséllyel kerüljön egy adott string a tömbbe. 1 = minden string, 0 = kikapcsolva.</p>
            </div>

            <div class="option">
                <span class="option__label">String kódolás</span>
                <div class="checkbox-group">
                    <label><input type="checkbox" id="opt-stringArrayEncoding-base64"> base64</label>
                    <label><input type="checkbox" id="opt-stringArrayEncoding-rc4"> rc4</label>
                </div>
                <p class="option__desc">base64: gyors. rc4: erősebb, de kb. 30-50%-kal lassabb futásidőt eredményez. RC4 esetén ajánlott kikapcsolni az unicode escape opciót.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-stringArrayRotate" checked>
                    String tömb eltolása
                </label>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-stringArrayShuffle" checked>
                    String tömb összekeverése
                </label>
                <p class="option__desc">A string-tömb elemeinek eltolása/összekeverése, hogy a sorrendből ne lehessen visszakövetkeztetni az eredeti helyre.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-stringArrayWrappersCount">Csomagolók száma</label>
                <input type="number" id="opt-stringArrayWrappersCount" min="0" max="20" value="1">
                <select id="opt-stringArrayWrappersType">
                    <option value="variable" selected>variable</option>
                    <option value="function">function</option>
                </select>
                <p class="option__desc">Hány és milyen típusú "csomagoló" hívja a string-tömböt. A function típus erősebb védelmet ad, de lassabb.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-splitStrings">
                    Hosszú stringek darabolása
                </label>
                <input type="number" id="opt-splitStringsChunkLength" min="1" max="100" value="10">
                <p class="option__desc">Hosszú stringeket kisebb darabokra vág és összefűzi.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-unicodeEscapeSequence">
                    Unicode escape kódolás
                </label>
                <p class="option__desc">⚠️ A stringeket unicode escape formára alakítja (pl. A). Nagyban növeli a fájlméretet, csak kisebb kódrészletekhez ajánlott.</p>
            </div>
        </details>

        <details class="option-group">
            <summary>Kódstruktúra</summary>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-controlFlowFlattening">
                    Vezérlési folyamat "ellaposítása"
                </label>
                <input type="range" id="opt-controlFlowFlatteningThreshold" min="0" max="1" step="0.05" value="0.75">
                <span id="controlFlowFlatteningThreshold-value">0.75</span>
                <p class="option__desc">⚠️ Az if/else, for, while szerkezeteket switch-alapú állapotgéppé alakítja. Akár 1.5x-ös futásidő-lassulást is okozhat.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-deadCodeInjection">
                    Halott kód beszúrása
                </label>
                <input type="range" id="opt-deadCodeInjectionThreshold" min="0" max="1" step="0.05" value="0.4">
                <span id="deadCodeInjectionThreshold-value">0.4</span>
                <p class="option__desc">⚠️ Véletlenszerű, soha le nem futó kódblokkokat szúr be. Akár 200%-kal is megnövelheti a fájlméretet. Automatikusan bekapcsolja a string tömbösítést.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-numbersToExpressions">
                    Számok kifejezésekké alakítása
                </label>
                <p class="option__desc">A számliterálokat matematikai kifejezésekké alakítja.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-simplify" checked>
                    Egyszerűsítés
                </label>
                <p class="option__desc">További apró egyszerűsítő/összevonó trükkök. Ajánlott bekapcsolva hagyni.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-transformObjectKeys">
                    Objektum kulcsok átalakítása
                </label>
                <p class="option__desc">Az objektum kulcsneveit is a string-tömbön keresztüli hivatkozásra cseréli.</p>
            </div>
        </details>

        <details class="option-group">
            <summary>Futásidő-védelem</summary>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-selfDefending">
                    Öndefenzív kód
                </label>
                <p class="option__desc">⚠️ A kimenet ellenáll az utólagos formázásnak/széppé tételnek. Ha bekapcsolod, az obfuszkált kimenetet utólag semmilyen módon ne módosítsd.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-debugProtection">
                    Debug védelem
                </label>
                <input type="number" id="opt-debugProtectionInterval" min="0" step="500" value="0">
                <p class="option__desc">⚠️ Megnehezíti a Fejlesztői eszközök (F12) használatát. Lefagyaszthatja a böngészőt/lapot, ha valaki megnyitja a DevTools-t. Csak akkor ajánlott, ha éles környezetben biztosan senki nem debugol.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-disableConsoleOutput">
                    Konzol kimenet letiltása
                </label>
                <p class="option__desc">Kikapcsolja a console.log/warn/error hívásokat. Éles build-nél hasznos.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-domainLock">Domain zárolás</label>
                <textarea id="opt-domainLock" class="option-textarea" rows="2" placeholder="pelda.hu&#10;aldomain.pelda.hu"></textarea>
                <label class="option__label" for="opt-domainLockRedirectUrl">Átirányítási URL más domainen</label>
                <input type="text" id="opt-domainLockRedirectUrl" placeholder="https://pelda.hu">
                <p class="option__desc">A kód csak a megadott domain(ek)en fusson; máshol a megadott URL-re irányítja át a böngészőt. Nem működik "node" targettel.</p>
            </div>
        </details>

        <details class="option-group">
            <summary>Kimenet / kompatibilitás</summary>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-compact" checked>
                    Tömörített kimenet
                </label>
                <p class="option__desc">A kimenetet egy sorba tömöríti, extra szóköz/sortörés nélkül.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-target">Célkörnyezet</label>
                <select id="opt-target">
                    <option value="browser" selected>browser</option>
                    <option value="browser-no-eval">browser-no-eval</option>
                    <option value="node">node</option>
                </select>
                <p class="option__desc">browser-no-eval akkor hasznos, ha az oldal szigorú Content-Security-Policy-ja tiltja az eval() használatát.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-seed">Véletlen mag (seed)</label>
                <input type="number" id="opt-seed" min="0" value="0">
                <p class="option__desc">Rögzített érték esetén ugyanabból a bemenetből és beállításokból mindig ugyanaz a kimenet születik. 0 = kikapcsolva.</p>
            </div>

            <div class="option option--checkbox">
                <label class="option__label">
                    <input type="checkbox" id="opt-sourceMap">
                    Forrástérkép generálása
                </label>
                <p class="option__desc">⚠️ Éles, publikusan elérhető build mellé ne tedd ki &ndash; visszaadja az eredeti, olvasható kódot.</p>
            </div>
        </details>

        <details class="option-group">
            <summary>Kizárási lista</summary>

            <div class="option">
                <label class="option__label" for="opt-reservedNames">Kizárt nevek (regex, soronként)</label>
                <textarea id="opt-reservedNames" class="option-textarea" rows="3" placeholder="^_get_&#10;^_set_&#10;publikusFuggveny"></textarea>
                <p class="option__desc">Az ide illeszkedő névvel rendelkező azonosítók nem lesznek átírva/generálva.</p>
            </div>

            <div class="option">
                <label class="option__label" for="opt-reservedStrings">Kizárt stringek (regex, soronként)</label>
                <textarea id="opt-reservedStrings" class="option-textarea" rows="3" placeholder="^API_KEY_PLACEHOLDER$"></textarea>
                <p class="option__desc">Az ide illeszkedő string-literálok nem kerülnek a string-tömbbe / nem lesznek kódolva.</p>
            </div>
        </details>

        <button id="btn-obfuscate" class="button button--primary">Obfuszkálás</button>
        <p class="error-message" id="error-message" hidden></p>
    </section>

    <section class="panel panel--output">
        <div class="panel__header">
            <h2>Kimenet</h2>
            <span class="size-indicator" id="output-size">0 B</span>
        </div>
        <textarea id="output-code" class="code-area" readonly spellcheck="false" placeholder="Az obfuszkált kód itt jelenik meg..."></textarea>
        <div class="panel__actions">
            <button id="btn-copy" class="button button--secondary" disabled>Másolás</button>
            <button id="btn-download" class="button button--secondary" disabled>Letöltés</button>
        </div>
    </section>

</main>

<footer class="site-footer">
    <p>Az obfuszkálás nem egyenlő titkosítással &mdash; a cél a visszafejtéshez szükséges munka növelése, nem az áttörhetetlenség.</p>
</footer>

<script src="assets/js/vendor/javascript-obfuscator-5.6.0.browser.js"></script>
<script src="assets/js/presets.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>
