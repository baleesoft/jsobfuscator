# JS Obfuszkátor

Saját hosztolású, PHP + vanilla JS + AJAX alapú JavaScript obfuszkáló eszköz. A tényleges kód-obfuszkálás teljes egészében a böngészőben fut (a nyílt forráskódú [`javascript-obfuscator`](https://github.com/javascript-obfuscator/javascript-obfuscator) motor vendorolt, böngészőbe ágyazható build-jével) — a védendő forráskód soha nem hagyja el a klienst hálózaton keresztül.

A részletes tervet lásd itt: [docs/js-obfuszkator-specifikacio.md](docs/js-obfuszkator-specifikacio.md)

## Telepítés

1. Töltsd fel a projekt tartalmát a PHP 8.1+ tárhelyedre (tetszőleges alkönyvtárba, minden útvonal relatív).
2. Hozd létre az adatbázist a [db/schema.sql](db/schema.sql) alapján.
3. Másold a [config.php.example](config.php.example) fájlt `config.php` néven a projekt gyökerébe, és töltsd ki a saját MySQL adataiddal. (A `config.php` .gitignore-olva van, soha nem kerül verziókezelőbe.)

## Állapot

- **1-2. fázis kész:** kliensoldali obfuszkáló UI, teljes opciólista, beépített presetek, kizárási lista, reszponzív elrendezés, Reset gomb.
- **3. fázis kész:** saját presetek mentése/betöltése/törlése PHP + MySQL AJAX végponton (`api/presets.php`) — kizárólag az opció-beállítások JSON-je kerül a szerverre, a forráskód soha.
- Lásd a specifikáció 10. pontját (fejlesztési lépések / roadmap) a további, opcionális lépésekhez.
