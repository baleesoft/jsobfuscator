<?php
/**
 * JS Obfuszkátor - Adatvédelmi tájékoztató.
 *
 * Önálló, statikus oldal. Nem futtat Google Analytics-et (nincs rá
 * szükség egy jogi tájékoztató oldalon), és nem fut rajta az obfuszkáló
 * motor sem - kizárólag a meglévő style.css-t használja fel a
 * megjelenéshez, hogy illeszkedjen a főoldalhoz.
 *
 * A nyelv-detektálás logikája megegyezik az index.php-éval, hogy a
 * látogató a főoldalon beállított nyelvén lássa ezt az oldalt is.
 */
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

$OBF_PRIVACY_TEXT = array(
    "hu" => array(
        "title" => "Adatvédelmi tájékoztató – JS Obfuszkátor",
        "back" => "Vissza a főoldalra",
        "heading" => "Adatvédelmi tájékoztató",
        "intro" => "Ez a tájékoztató összefoglalja, milyen adatokat kezel a JS Obfuszkátor weboldal, és milyen sütiket (cookie-kat) használ.",
        "s1_title" => "A forráskódod soha nem hagyja el a böngészőt",
        "s1_body" => "Az oldal fő funkciója - a JavaScript kód obfuszkálása - kizárólag a böngésződben, kliensoldali JavaScript segítségével fut. A beillesztett vagy feltöltött forráskód semmilyen formában nem kerül elküldésre a szerverünkre vagy bármilyen harmadik félnek.",
        "s2_title" => "Funkcionális sütik",
        "s2_body" => "Az oldal a következő, működéshez szükséges sütiket/tárolókat használja, amelyekhez nem szükséges hozzájárulás, mivel nem alkalmasak a látogató nyomon követésére: ",
        "s2_list1" => "jsobf-theme (localStorage) – a választott világos/sötét téma megjegyzése",
        "s2_list2" => "jsobf-lang (localStorage) és jsobf_lang (cookie) – a választott nyelv megjegyzése",
        "s2_list3" => "jsobf-consent (localStorage) – a cookie-consent bannerben hozott döntésed megjegyzése",
        "s3_title" => "Google Analytics (csak hozzájárulás esetén)",
        "s3_body" => "Az oldal Google Analytics 4 (GA4) szolgáltatást használ névtelen látogatottsági statisztikák gyűjtésére (pl. látogatások száma, hozzávetőleges földrajzi hely, használt böngésző típusa). Ehhez a Google Consent Mode v2 technológiát alkalmazzuk: a mérés alapértelmezetten le van tiltva (\"denied\" állapotban van), és csak akkor aktiválódik, ha a cookie-consent bannerben az \"Elfogadom\" gombra kattintasz. A hozzájárulásod bármikor visszavonható a böngésződ süti-beállításain keresztül, vagy a helyi tárolás (localStorage) törlésével, amivel a banner újra megjelenik.",
        "s3_body2" => "Elfogadás esetén a Google a _ga és _ga_* nevű sütiket helyezheti el a böngésződben. Az adatkezelésről bővebben a Google Adatvédelmi irányelveiben olvashatsz.",
        "s4_title" => "Kapcsolat",
        "s4_body" => "Az adatkezeléssel kapcsolatos kérdéseiddel az alábbi e-mail címen kereshetsz minket:",
    ),
    "en" => array(
        "title" => "Privacy Policy – JS Obfuscator",
        "back" => "Back to the app",
        "heading" => "Privacy Policy",
        "intro" => "This page summarizes what data the JS Obfuscator website processes, and which cookies it uses.",
        "s1_title" => "Your source code never leaves the browser",
        "s1_body" => "The site's main function — obfuscating JavaScript code — runs entirely client-side, in your browser. The source code you paste or upload is never sent to our server or to any third party in any form.",
        "s2_title" => "Functional cookies",
        "s2_body" => "The site uses the following storage items required for basic functionality, which do not require consent since they cannot be used to track visitors: ",
        "s2_list1" => "jsobf-theme (localStorage) – remembers your chosen light/dark theme",
        "s2_list2" => "jsobf-lang (localStorage) and jsobf_lang (cookie) – remembers your chosen language",
        "s2_list3" => "jsobf-consent (localStorage) – remembers the choice you made in the cookie-consent banner",
        "s3_title" => "Google Analytics (only with consent)",
        "s3_body" => "The site uses Google Analytics 4 (GA4) to collect anonymous visitor statistics (e.g. number of visits, approximate location, browser type). We implement this using Google Consent Mode v2: measurement is disabled by default (\"denied\") and only activates once you click \"Accept\" in the cookie-consent banner. You can withdraw consent at any time via your browser's cookie settings, or by clearing local storage, which will show the banner again.",
        "s3_body2" => "Once accepted, Google may set cookies named _ga and _ga_* in your browser. You can read more about how this data is processed in Google's Privacy Policy.",
        "s4_title" => "Contact",
        "s4_body" => "If you have questions about data processing, you can reach us at the following email address:",
    ),
    "de" => array(
        "title" => "Datenschutzerklärung – JS-Obfuskator",
        "back" => "Zurück zur Anwendung",
        "heading" => "Datenschutzerklärung",
        "intro" => "Diese Seite fasst zusammen, welche Daten die JS-Obfuskator-Website verarbeitet und welche Cookies sie verwendet.",
        "s1_title" => "Dein Quellcode verlässt niemals den Browser",
        "s1_body" => "Die Hauptfunktion der Seite – das Obfuskieren von JavaScript-Code – läuft ausschließlich clientseitig in deinem Browser. Der eingefügte oder hochgeladene Quellcode wird in keiner Form an unseren Server oder an Dritte gesendet.",
        "s2_title" => "Funktionale Cookies",
        "s2_body" => "Die Seite verwendet folgende, für die Grundfunktion notwendige Speicherelemente, für die keine Einwilligung erforderlich ist, da sie nicht zur Nachverfolgung von Besuchern geeignet sind: ",
        "s2_list1" => "jsobf-theme (localStorage) – merkt sich den gewählten Hell-/Dunkelmodus",
        "s2_list2" => "jsobf-lang (localStorage) und jsobf_lang (Cookie) – merkt sich die gewählte Sprache",
        "s2_list3" => "jsobf-consent (localStorage) – merkt sich deine Entscheidung im Cookie-Consent-Banner",
        "s3_title" => "Google Analytics (nur mit Einwilligung)",
        "s3_body" => "Die Seite verwendet Google Analytics 4 (GA4), um anonyme Besucherstatistiken zu erfassen (z. B. Besucherzahl, ungefährer Standort, Browsertyp). Dafür setzen wir den Google Consent Mode v2 ein: Die Messung ist standardmäßig deaktiviert (\"denied\") und wird erst aktiviert, wenn du im Cookie-Consent-Banner auf \"Akzeptieren\" klickst. Du kannst deine Einwilligung jederzeit über die Cookie-Einstellungen deines Browsers widerrufen oder den lokalen Speicher löschen, wodurch der Banner erneut angezeigt wird.",
        "s3_body2" => "Nach der Zustimmung kann Google Cookies mit den Namen _ga und _ga_* in deinem Browser setzen. Mehr über die Datenverarbeitung erfährst du in der Datenschutzerklärung von Google.",
        "s4_title" => "Kontakt",
        "s4_body" => "Bei Fragen zur Datenverarbeitung kannst du uns unter folgender E-Mail-Adresse erreichen:",
    ),
);
$OBF_CONTACT_EMAIL = "hello@nemesbalazs.hu";
$t = $OBF_PRIVACY_TEXT[$obf_lang];
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($obf_lang); ?>">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?php echo htmlspecialchars($t["title"]); ?></title>
<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
<link rel="stylesheet" href="assets/css/style.css">
<script>
    // Minél előbb beállítjuk a mentett témát, hogy ne villanjon fel az
    // alapértelmezés, mielőtt a stílus lefutna (lásd index.php).
    (function () {
        try {
            var savedTheme = localStorage.getItem("jsobf-theme");
            if (savedTheme === "light" || savedTheme === "dark") {
                document.documentElement.setAttribute("data-theme", savedTheme);
            }
        } catch (e) {
            // localStorage nem elérhető - marad az alap sötét téma.
        }
    })();
</script>
<style>
    .privacy-page {
        max-width: 720px;
        margin: 0 auto;
        padding: 2rem 1rem 3rem;
    }
    .privacy-page .panel {
        margin-bottom: 1.5rem;
    }
    .privacy-page h1 {
        font-size: 1.4rem;
        margin: 0 0 1rem;
    }
    .privacy-page h2 {
        font-size: 1.05rem;
        margin: 0 0 0.5rem;
    }
    .privacy-page p {
        line-height: 1.55;
        color: var(--color-text);
    }
    .privacy-page ul {
        margin: 0.5rem 0 1rem;
        padding-left: 1.25rem;
        color: var(--color-text);
        line-height: 1.5;
    }
    .privacy-page .back-link {
        display: inline-block;
        margin-bottom: 1.5rem;
        color: var(--color-accent);
        text-decoration: none;
        font-size: 0.9rem;
    }
    .privacy-page .back-link:hover {
        text-decoration: underline;
    }
</style>
</head>
<body>

<div class="privacy-page">
    <a class="back-link" href="index.php">&larr; <?php echo htmlspecialchars($t["back"]); ?></a>

    <div class="panel">
        <h1><?php echo htmlspecialchars($t["heading"]); ?></h1>
        <p><?php echo htmlspecialchars($t["intro"]); ?></p>
    </div>

    <div class="panel">
        <h2><?php echo htmlspecialchars($t["s1_title"]); ?></h2>
        <p><?php echo htmlspecialchars($t["s1_body"]); ?></p>
    </div>

    <div class="panel">
        <h2><?php echo htmlspecialchars($t["s2_title"]); ?></h2>
        <p><?php echo htmlspecialchars($t["s2_body"]); ?></p>
        <ul>
            <li><?php echo htmlspecialchars($t["s2_list1"]); ?></li>
            <li><?php echo htmlspecialchars($t["s2_list2"]); ?></li>
            <li><?php echo htmlspecialchars($t["s2_list3"]); ?></li>
        </ul>
    </div>

    <div class="panel">
        <h2><?php echo htmlspecialchars($t["s3_title"]); ?></h2>
        <p><?php echo htmlspecialchars($t["s3_body"]); ?></p>
        <p><?php echo htmlspecialchars($t["s3_body2"]); ?></p>
    </div>

    <div class="panel">
        <h2><?php echo htmlspecialchars($t["s4_title"]); ?></h2>
        <p><?php echo htmlspecialchars($t["s4_body"]); ?> <a href="mailto:<?php echo htmlspecialchars($OBF_CONTACT_EMAIL); ?>"><?php echo htmlspecialchars($OBF_CONTACT_EMAIL); ?></a></p>
    </div>
</div>

</body>
</html>
