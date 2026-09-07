# Saját hosztolású JavaScript Obfuszkátor – Specifikáció

> Cél: a `javascriptobfuscator.com` online eszközéhez hasonló funkciójú, de **teljesen saját kézben tartott**, PHP + vanilla JS + AJAX alapú belső eszköz, amivel a **baziv2** (és más) projektjeid JS kódját tudod védeni anélkül, hogy a forráskódot bármilyen külső szolgáltatásnak elküldenéd.

---

## 1. Alapelv és motorválasztás

A `javascriptobfuscator.com` maga is egy kereskedelmi termék: az ingyenes "Online Obfuscator" oldala a beillesztett kódot **a saját szerverükre küldi** feldolgozásra, 16–32 KB-os korláttal, és a komolyabb funkciók (VM bytecode védelem, "Runtime Defense", "JSO AI") fizetős API-mögé vannak zárva. Ez pontosan az, amit el szeretnél kerülni.

**Javaslat:** ne próbáljuk újraírni az obfuszkáló motort PHP-ban (egy JS parser/AST-transzformátor PHP-ban irreális vállalkozás lenne) – hanem építsük az alkalmazást a **`javascript-obfuscator`** nevű, nyílt forráskódú (BSD-2-Clause licenc), ~16 ezer GitHub csillaggal rendelkező, heti 1 millió+ npm letöltésű motorra. Ez az a motor, amire a `obfuscator.io` (a `javascriptobfuscator.com`-hoz hasonló, de más cég által üzemeltetett szolgáltatás) is épül.

Kulcsfontosságú tény: ennek a könyvtárnak van **böngészőbe ágyazható build-je**:

```html
<script src="./assets/js/vendor/javascript-obfuscator.browser.js"></script>
```

Ezt a fájlt **egyszer letöltöd** (pl. `https://cdn.jsdelivr.net/npm/javascript-obfuscator/dist/index.browser.js` innen), **bekerül a saját szerveredre**, és onnantól:

- **A forráskódod soha nem hagyja el a géped/szervered** – az obfuszkálás teljesen a böngészőben, kliensoldali JS-ben fut le, nincs hozzá hálózati hívás.
- Nincs szükség Node.js-re a szerveren (ami PHP-s megosztott tárhelyen amúgy sem biztos, hogy elérhető).
- Auditálható, nyílt forráskódú motor – pontosan látod, mi történik a kóddal, nincs "fekete doboz" harmadik féltől.
- A VM bytecode / Pro API funkciókat (`vmObfuscation`, `parseHtml`, stb.) **szándékosan kihagyjuk** a specifikációból: ezek csak az `obfuscator.io` fizetős felhős API-ján keresztül érhetők el, API-tokent igényelnek, tehát pont az ellenkezője annak, amit szeretnél.

---

## 2. Architektúra

```
┌─────────────────────────────────────────────────────┐
│  Böngésző (kliens)                                   │
│  ┌─────────────┐   ┌────────────────────────────────┐ │
│  │  app.js     │──▶│ javascript-obfuscator.browser │ │
│  │ (UI logika) │   │   .js (vendorolt, statikus)   │ │
│  └─────────────┘   └────────────────────────────────┘ │
│   a tényleges obfuszkálás itt fut, hálózat nélkül    │
└─────────────────┬─────────────────────────────────────┘
                  │ AJAX (csak metaadat: presetek, előzmények)
                  ▼
┌─────────────────────────────────────────────────────┐
│  PHP backend (saját hosting)                         │
│  - oldal kiszolgálása                                │
│  - preset CRUD (MySQL)                               │
│  - opcionális futtatás-előzmény (csak metaadat)       │
└─────────────────────────────────────────────────────┘
```

Az AJAX/PHP réteg tehát **nem az obfuszkálásért felel**, hanem a kényelmi funkciókért: beállítás-presetek mentése/betöltése, opcionális előzmény, fájlkezelés. Ez azért fontos elvi döntés, mert így garantált, hogy a védendő forráskód sosem megy PHP-n vagy AJAX-on keresztül a szerverre, ha ezt nem szeretnéd (kivéve, ha explicit módon bekapcsolod a "history mentése kóddal együtt" opciót – lásd 7. pont).

---

## 3. Javasolt fájlstruktúra (VSCode projekthez)

```
js-obfuszkator/
├── index.php                     # fő oldal (UI)
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js                # UI logika, kapcsolók kezelése, AJAX hívások
│   │   ├── presets.js            # a beépített (default/low/medium/high) presetek definíciói
│   │   └── vendor/
│   │       └── javascript-obfuscator.browser.js   # vendorolt, verziózott motor
├── api/
│   ├── presets.php                # AJAX: preset lista / mentés / törlés
│   └── history.php                # AJAX: futtatás-előzmény mentése (opcionális, csak metaadat)
├── includes/
│   ├── db.php                     # PDO kapcsolat
│   └── config.php
└── db/
    └── schema.sql
```

---

## 4. UI elrendezés (a mintaoldalhoz hasonlóan)

- **Fejléc**: cím + preset gombok: `Gyors` / `Kiegyensúlyozott` / `Erős védelem` / `Egyéni`
- **Bal panel – Bemenet**
  - `<textarea>` (vagy később CodeMirror/Ace szintaxiskiemeléssel)
  - "Fájl feltöltése" gomb (`.js` / `.txt`)
  - méretkijelző (KB)
- **Jobb panel – Kimenet**
  - readonly kimeneti mező
  - `Másolás` és `Letöltés` gomb
  - méretkijelző + "hányszorosára nőtt a fájl" arány
- **Alsó/oldalsó panel – Opciók**, csoportokba rendezve (ld. 5. pont), mindegyik checkbox mellett egy rövid magyar leírás (pl. `(i)` ikon tooltipben vagy közvetlenül a checkbox alatt kisbetűvel)
- **Kizárási lista** mező: soronként egy reguláris kifejezés (regex), amire illeszkedő névvel/stringgel rendelkező elem **nem** lesz átalakítva
- **"Obfuszkálás"** gomb (nem kell submit/postback, tisztán kliensoldali JS hívás)
- **"Mentés presetként"** gomb – AJAX a PHP backend felé

---

## 5. Opciók / kapcsolók (a valós `javascript-obfuscator` motor alapján)

> Minden alábbi opció a motor tényleges, dokumentált opciója – nem kitalált vagy marketing célú funkció. A táblázat a checkbox melletti magyar leírás alapja.

### 5.1 Névátalakítás (rename / mangle)

| Opció (motor) | UI vezérlő | Magyar leírás | Alapérték | Megjegyzés |
|---|---|---|---|---|
| `identifierNamesGenerator` | legördülő: `hexadecimal` / `mangled` / `mangled-shuffled` / `dictionary` | A változó- és függvénynevek generálásának módja. `hexadecimal`: `_0xabc123` jellegű nevek (a legkevésbé olvasható). `mangled`: rövid `a`, `b`, `c` nevek (kisebb fájlméret, kicsit könnyebben olvasható minta). `dictionary`: saját szólistából generált nevek. | `hexadecimal` | – |
| `renameGlobals` | checkbox | A globális (fájlon kívülről is elérhető) változók és függvények nevét is átírja. | ki | ⚠️ Törheti a kódot, ha más `<script>` tag vagy inline HTML esemény név szerint hivatkozik rájuk (pl. `onclick="regisztral()"`). |
| `renameProperties` + `renamePropertiesMode` | checkbox + legördülő (`safe`/`unsafe`) | Objektum-tulajdonságok (pl. `obj.szamlaszam`) nevének átírása is. | ki, `safe` | ⚠️ Még `safe` módban is törhet olyan kódot, ami DOM-elemek vagy külső könyvtárak property-jeit stringként (`obj["szamlaszam"]`) éri el. |
| `identifiersPrefix` | szövegmező | Egyedi előtag minden globális azonosítóhoz. | üres | Több, külön obfuszkált fájl esetén hasznos, hogy a generált nevek ne ütközzenek. |
| `reservedNames` | textarea (regex, soronként) | Ezekre a mintákra illeszkedő neveket **nem** írja át (pl. publikusan hívott API-függvények). | üres | Ez a "Kizárási lista" mező tartalma. |

### 5.2 String védelem

| Opció | UI vezérlő | Magyar leírás | Alapérték | Megjegyzés |
|---|---|---|---|---|
| `stringArray` | checkbox | A kódban lévő szöveges literálokat kigyűjti egy közös tömbbe, és a kódban csak index-szel hivatkozik rájuk. Ez az alapvédelem, ami miatt a stringek nem olvashatók ki egyszerű Ctrl+F-fel. | be | – |
| `stringArrayThreshold` | csúszka (0–1) | Mekkora eséllyel kerüljön egy adott string a tömbbe. `1` = minden string, `0` = kikapcsolva. | 0.75 | – |
| `stringArrayEncoding` | checkbox-csoport: `base64`, `rc4` | A tömbbe került stringek további kódolása. `base64`: gyors. `rc4`: erősebb (nehezebb egyben visszafejteni), de kb. 30–50%-kal lassabb futásidőt eredményez. | egyik sincs | RC4 esetén ajánlott kikapcsolni az `unicodeEscapeSequence` opciót (lásd lent), mert együtt nagyon megnöveli a fájlméretet. |
| `stringArrayRotate` / `stringArrayShuffle` | checkbox (mindkettő) | A string-tömb elemeinek eltolása, illetve véletlenszerű összekeverése, hogy a sorrendből ne lehessen visszakövetkeztetni az eredeti helyre. | be | – |
| `stringArrayWrappersCount` + `stringArrayWrappersType` | szám + legördülő (`variable`/`function`) | Hány és milyen típusú "csomagoló" hívja a string-tömböt. `function` típus erősebb védelmet ad, de lassabb, mint a `variable`. | 1, `variable` | – |
| `splitStrings` + `splitStringsChunkLength` | checkbox + szám | Hosszú stringeket kisebb darabokra vág és összefűzi (pl. `"abcdefg"` → `"ab"+"cd"+"ef"+"g"`). | ki, 10 | – |
| `unicodeEscapeSequence` | checkbox | A stringeket unicode escape formára alakítja (pl. `A`). | ki | ⚠️ Nagyban növeli a fájlméretet, csak kisebb kódrészletekhez ajánlott. |

### 5.3 Kódstruktúra / vezérlési folyamat

| Opció | UI vezérlő | Magyar leírás | Alapérték | Megjegyzés |
|---|---|---|---|---|
| `controlFlowFlattening` + `controlFlowFlatteningThreshold` | checkbox + csúszka (0–1) | Az `if/else`, `for`, `while` szerkezeteket egy `switch`-alapú "állapotgéppé" alakítja, ami rendkívül megnehezíti a kód logikájának követését. | ki, 0.75 | ⚠️ Akár **1.5×-ös lassulást** is okozhat futásidőben – a threshold csúszkával szabályozható, hány %-ára alkalmazza a kódnak. |
| `deadCodeInjection` + `deadCodeInjectionThreshold` | checkbox + csúszka (0–1) | Véletlenszerű, soha le nem futó "látszat" kódblokkokat szúr be, hogy megzavarja az elemzést. | ki, 0.4 | ⚠️ Akár **200%-kal** is megnövelheti a kimeneti fájl méretét. Automatikusan bekapcsolja a `stringArray` opciót. |
| `numbersToExpressions` | checkbox | A számliterálokat matematikai kifejezésekké alakítja (pl. `1234` helyett egy hosszú összeadás-kivonás lánc jelenik meg). | ki | – |
| `simplify` | checkbox | További apró egyszerűsítő/összevonó trükkök (pl. `if/else` összevonása). | be | Ajánlott bekapcsolva hagyni, teljesítményre gyakorlatilag nincs hatással. |
| `transformObjectKeys` | checkbox | Az objektum kulcsneveit is a string-tömbön keresztüli hivatkozásra cseréli. | ki | – |

### 5.4 Futásidő-védelem / anti-debug

| Opció | UI vezérlő | Magyar leírás | Alapérték | Megjegyzés |
|---|---|---|---|---|
| `selfDefending` | checkbox | A kimenet "ellenáll" az utólagos formázásnak/széppé tételnek – ha valaki egy JS beautifierrel megpróbálja olvashatóvá tenni, a kód leáll. | ki | ⚠️ Az obfuszkált kimenetet **utólag semmilyen módon** (pl. külön minifierrel) ne módosítsd, mert ez kiváltja a védelmet és a kód leállhat. Automatikusan `compact: true`-t is beállít. |
| `debugProtection` + `debugProtectionInterval` | checkbox + szám (ms) | Megnehezíti a böngésző Fejlesztői eszközeinek (F12) `debugger` funkcióját. | ki, 0 | ⚠️ **Lefagyaszthatja a böngészőt/lapot**, ha valaki (akár te magad, teszteléskor) megnyitja a DevTools-t. Csak akkor ajánlott, ha biztosan tudod, hogy éles környezetben senkinek nem kell debugolnia a lapot. |
| `disableConsoleOutput` | checkbox | Kikapcsolja a `console.log`, `console.warn`, `console.error` stb. hívásokat (üres függvényre cseréli őket globálisan, minden scriptre). | ki | Éles build-nél hasznos, hogy ne szivárogjon infó a böngésző konzoljába. |
| `domainLock` + `domainLockRedirectUrl` | textarea (domainek, soronként) + szövegmező | A kód csak a megadott domain(ek)en/aldomaineken fusson; máshol a megadott URL-re irányítja át a böngészőt. | üres | Hasznos, ha attól tartasz, hogy valaki egyszerűen lemásolja és máshova tölti fel a fájlt. Nem működik `node` targettel. |

### 5.5 Kimenet / kompatibilitás / méret

| Opció | UI vezérlő | Magyar leírás | Alapérték | Megjegyzés |
|---|---|---|---|---|
| `compact` | checkbox | A kimenetet egy sorba tömöríti (nincs extra szóköz/sortörés). | be | Kisebb fájlméret. |
| `target` | legördülő: `browser` / `browser-no-eval` / `node` | Célkörnyezet. `browser-no-eval` akkor hasznos, ha az oldal szigorú Content-Security-Policy-ja (`script-src` `unsafe-eval` nélkül) tiltja az `eval()` használatát. | `browser` | Mindhárom cél kompatibilis a modern böngészőkkel (Chrome, Firefox, Edge, Safari); `browser-no-eval` a legszélesebb körben kompatibilis szigorú CSP mellett is. |
| `seed` | szövegmező/szám | Rögzített "véletlen mag" érték – ugyanabból a bemenetből és beállításokból mindig ugyanaz a kimenet születik. | `0` (kikapcsolva) | Hasznos reprodukálható build-ekhez, verziókövetéshez. |
| `sourceMap` | checkbox | Forrástérkép generálása debug célra. | ki | ⚠️ Éles, publikusan elérhető build mellé **ne** tedd ki – a forrástérkép gyakorlatilag visszaadja az eredeti, olvasható kódot. |

### 5.6 Kizárási lista

| Opció | UI vezérlő | Magyar leírás |
|---|---|---|
| `reservedNames` | textarea, soronként egy regex minta | Az ide illeszkedő névvel rendelkező azonosítók **nem** lesznek átírva/generálva (pl. `^_get_`, `^_set_`, egy publikus API-függvény pontos neve). |
| `reservedStrings` | textarea, soronként egy regex minta | Az ide illeszkedő string-literálok **nem** kerülnek a string-tömbbe / nem lesznek kódolva. |

---

## 6. Beépített presetek

A motor hivatalos, tesztelt preset-kombinációi (ezeket érdemes 1:1 átvenni gombokként, nem újra kitalálni):

- **Alapértelmezett** (`default`) – gyors, minimális védelem, `stringArray` be, semmi más agresszív opció.
- **Gyenge obfuszkálás, jó teljesítmény** (`low-obfuscation`) – `stringArray` + kódolás nélkül, `selfDefending` be, agresszívabb transzformációk (control flow flattening, dead code) kikapcsolva.
- **Közepes obfuszkálás, kiegyensúlyozott teljesítmény** (`medium-obfuscation`) – `controlFlowFlattening`, `deadCodeInjection`, `stringArrayEncoding: base64`, `selfDefending` mind bekapcsolva, mérsékelt threshold-okkal.
- **Erős obfuszkálás, gyengébb teljesítmény** (`high-obfuscation`) – minden agresszív opció maximumon (`controlFlowFlatteningThreshold: 1`, `deadCodeInjectionThreshold: 1`, `stringArrayEncoding: rc4`, `debugProtection` be, stb.) – érezhetően lassabb futású kódot eredményez, de a legnehezebben visszafejthető.

Ezeket a preseteket egy `presets.js` fájlban, JS objektumként definiáljuk (a fenti táblázatok opciónevei alapján), a felület pedig ezeket tölti be alapállapotnak, amit utána a felhasználó egyedi kapcsolókkal felülírhat ("Egyéni" mód).

---

## 7. AJAX / PHP réteg

### 7.1 Adatbázis-séma (MySQL)

```sql
CREATE TABLE obf_presets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nev VARCHAR(100) NOT NULL,
  opciok_json JSON NOT NULL,
  letrehozva DATETIME DEFAULT CURRENT_TIMESTAMP,
  modositva DATETIME ON UPDATE CURRENT_TIMESTAMP
);

-- opcionális: csak metaadat, NEM a védendő forráskód
CREATE TABLE obf_elozmenyek (
  id INT AUTO_INCREMENT PRIMARY KEY,
  preset_id INT NULL,
  bemenet_meret_byte INT,
  kimenet_meret_byte INT,
  opciok_json JSON NOT NULL,
  letrehozva DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (preset_id) REFERENCES obf_presets(id) ON DELETE SET NULL
);
```

### 7.2 Végpontok

- `GET  /api/presets.php?action=list` – mentett presetek listája
- `POST /api/presets.php?action=save` – új preset mentése (`nev`, `opciok_json`)
- `POST /api/presets.php?action=delete` – preset törlése
- `POST /api/history.php?action=log` – opcionális: egy futtatás metaadatainak naplózása (**alapból a tényleges kód nem kerül bele**, csak méretadatok és a használt opciók – ha mégis szeretnéd tárolni magát a kódot is összehasonlításhoz, az egy külön, explicit módon bekapcsolható opció legyen, hogy tudatos döntés maradjon)

Fontos elvi szabály, amit érdemes kódkommentben is rögzíteni a projektben: **az `api/*.php` végpontok soha nem kapják meg a nyers forráskódot obfuszkálásra** – az kizárólag a böngészőben, a vendorolt `javascript-obfuscator.browser.js` segítségével történik.

---

## 8. Adatfolyam (működés lépésről lépésre)

1. `index.php` betöltéskor lekéri AJAX-on a mentett preseteket, és beszúrja őket a fejléc gombjai közé.
2. Felhasználó beilleszti vagy feltölti a JS kódot a bal panelbe.
3. Kiválaszt egy presetet, vagy manuálisan állítja a kapcsolókat (5. pont).
4. "Obfuszkálás" gombra kattintva `app.js` összeállítja az opciók objektumát, és meghívja `JavaScriptObfuscator.obfuscate(kod, opciok)`-ot – ez tisztán kliensoldali, szinkron hívás.
5. Az eredmény (`getObfuscatedCode()`) megjelenik a jobb panelben, a méretkijelzők frissülnek.
6. Opcionálisan: "Mentés presetként" – AJAX POST a PHP backend felé, csak az opciók JSON-je kerül mentésre.
7. "Letöltés" gomb: kliensoldali Blob + `<a download>` trükkel menti ki `.js` fájlként, szerverre nem megy semmi.

---

## 9. Gyakorlati / biztonsági megjegyzések

- Az obfuszkálás **nem egyenlő titkosítással**: megnehezíti, de nem lehetetleníti el a visszafejtést – a böngészőnek végre kell tudnia hajtania a kódot, tehát elméletileg mindig kinyerhető, amit ő is végre tud hajtani. A cél a "belefektetett munka" drasztikus növelése, nem az áttörhetetlenség.
- API-kulcsokat, jelszavakat, üzleti szempontból kritikus titkokat **soha ne** bízz kliensoldali kódra pusztán obfuszkálással védve.
- A `selfDefending` + `debugProtection` kombináció komoly UX-kockázatot hordoz – csak olyan lapon/scriptnél használd, ahol biztosan tudod, hogy éles környezetben senkinek nem lesz szüksége böngésző-oldali debugolásra.
- A vendorolt `javascript-obfuscator.browser.js` fájlt érdemes verziózva tárolni (pl. fájlnévben vagy commit-üzenetben jelezve, melyik npm verzióból származik), és frissítéskor mindig lefuttatni rajta a saját teszt-JS-edet is, mert egy-egy verzióváltás módosíthatja az alapértelmezett preset-összeállításokat.

---

## 10. Fejlesztési lépések (roadmap)

**1. fázis – MVP**
- Statikus HTML/CSS/JS oldal, vendorolt motor, alap kapcsolók (`stringArray`, `compact`, `identifierNamesGenerator`, `controlFlowFlattening`, `selfDefending`), "Obfuszkálás" + "Másolás" + "Letöltés" gombok.

**2. fázis**
- Preset gombok (6. pont), teljes opció-lista (5. pont), kizárási lista mező, fájl feltöltés.

**3. fázis**
- PHP + MySQL preset mentés/lekérés AJAX-on (7. pont).

**4. fázis (opcionális, ha igény lesz rá)**
- Több fájl / mappa kötegelt feldolgozása böngészőben (pl. JSZip segítségével csomagolva letölthető kimenet), `domainLock` UI, előzmény-nézet.

---

## 11. Amit szándékosan kihagytunk

- **VM bytecode obfuszkálás / Pro API** (`vmObfuscation`, `parseHtml` és az összes `vm*` opció) – ezek kizárólag az `obfuscator.io` fizetős felhős API-ján keresztül érhetők el, API-tokent és hálózati hívást igényelnek. Ez pontosan az a külső függőség, amit el szeretnél kerülni.
- **HTML-be ágyazott inline script parse-olása** – később, külön igény esetén hozzáadható, de az MVP-ben a bemenet tiszta `.js` fájl/kód.
- **Forrástérkép (`sourceMap`) éles build-en** – biztonsági kockázat, mert visszaadja az eredeti, olvasható kódot; csak fejlesztői/debug módban legyen elérhető, alapból kikapcsolva.
