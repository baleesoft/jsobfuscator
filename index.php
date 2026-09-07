<?php
/**
 * JS Obfuszkátor - fő oldal.
 *
 * Ez a fájl (MVP fázisban) kizárólag statikus HTML-t szolgál ki.
 * Az obfuszkálás teljes egészében a böngészőben, kliensoldali JS-ben
 * fut (assets/js/app.js + assets/js/vendor/javascript-obfuscator-*.browser.js) -
 * a beillesztett forráskód soha nem kerül ehhez a PHP fájlhoz vagy
 * bármilyen szerveroldali végponthoz.
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
        </div>
    </section>

    <section class="panel panel--options">
        <div class="panel__header">
            <h2>Opciók</h2>
        </div>

        <div class="option">
            <label class="option__label" for="opt-identifierNamesGenerator">Névgenerálás módja</label>
            <select id="opt-identifierNamesGenerator">
                <option value="hexadecimal" selected>hexadecimal (_0xabc123)</option>
                <option value="mangled">mangled (a, b, c...)</option>
                <option value="mangled-shuffled">mangled-shuffled</option>
            </select>
            <p class="option__desc">A változó- és függvénynevek generálásának módja.</p>
        </div>

        <div class="option option--checkbox">
            <label class="option__label">
                <input type="checkbox" id="opt-stringArray" checked>
                String tömbösítés
            </label>
            <p class="option__desc">A szöveges literálokat egy közös tömbbe gyűjti, a kódban csak index-szel hivatkozik rájuk.</p>
        </div>

        <div class="option option--checkbox">
            <label class="option__label">
                <input type="checkbox" id="opt-controlFlowFlattening">
                Vezérlési folyamat "ellaposítása"
            </label>
            <p class="option__desc">⚠️ Az if/else, for, while szerkezeteket switch-alapú állapotgéppé alakítja. Akár 1.5x-ös futásidő-lassulást is okozhat.</p>
        </div>

        <div class="option option--checkbox">
            <label class="option__label">
                <input type="checkbox" id="opt-selfDefending">
                Öndefenzív kód
            </label>
            <p class="option__desc">⚠️ A kimenet ellenáll az utólagos formázásnak/széppé tételnek. Ha bekapcsolod, az obfuszkált kimenetet utólag semmilyen módon ne módosítsd.</p>
        </div>

        <div class="option option--checkbox">
            <label class="option__label">
                <input type="checkbox" id="opt-compact" checked>
                Tömörített kimenet
            </label>
            <p class="option__desc">A kimenetet egy sorba tömöríti, extra szóköz/sortörés nélkül.</p>
        </div>

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
<script src="assets/js/app.js"></script>
</body>
</html>
