/**
 * JS Obfuszkátor - UI logika.
 *
 * A tényleges obfuszkálás kizárólag a böngészőben, a vendorolt
 * JavaScriptObfuscator motor segítségével történik. Ez a fájl soha
 * nem küldi el a bemeneti kódot semmilyen hálózati végpontnek.
 */
(function () {
    "use strict";

    var inputEl = document.getElementById("input-code");
    var outputEl = document.getElementById("output-code");
    var inputSizeEl = document.getElementById("input-size");
    var outputSizeEl = document.getElementById("output-size");
    var errorEl = document.getElementById("error-message");
    var fileUploadEl = document.getElementById("file-upload");

    var btnObfuscate = document.getElementById("btn-obfuscate");
    var btnCopy = document.getElementById("btn-copy");
    var btnDownload = document.getElementById("btn-download");
    var btnReset = document.getElementById("btn-reset");

    var stickyBar = document.getElementById("sticky-bar");

    var presetBar = document.getElementById("preset-bar");
    var presetCustomIndicator = document.getElementById("preset-custom-indicator");
    var savedPresetBar = document.getElementById("saved-preset-bar");
    var savedPresetList = document.getElementById("saved-preset-list");
    var savePresetNameEl = document.getElementById("save-preset-name");
    var btnSavePreset = document.getElementById("btn-save-preset");
    var savePresetStatusEl = document.getElementById("save-preset-status");

    // Az API végpont relatív útvonala - alkönyvtárba telepítve is működik,
    // mert az aktuális oldalhoz (index.php) képest relatív.
    var PRESETS_API_URL = "api/presets.php";

    // Szerverről betöltött, felhasználó által mentett presetek (id -> {nev, opciok}).
    var savedPresets = {};

    // Minden UI-vezérlő, amelyet egy preset betöltésekor frissítünk, és
    // amelynek változása "Egyéni" módba lépteti a felületet.
    var controlIds = [
        "opt-identifierNamesGenerator", "opt-renameGlobals", "opt-renameProperties",
        "opt-renamePropertiesMode", "opt-identifiersPrefix",
        "opt-stringArray", "opt-stringArrayThreshold",
        "opt-stringArrayEncoding-base64", "opt-stringArrayEncoding-rc4",
        "opt-stringArrayRotate", "opt-stringArrayShuffle",
        "opt-stringArrayWrappersCount", "opt-stringArrayWrappersType",
        "opt-splitStrings", "opt-splitStringsChunkLength", "opt-unicodeEscapeSequence",
        "opt-controlFlowFlattening", "opt-controlFlowFlatteningThreshold",
        "opt-deadCodeInjection", "opt-deadCodeInjectionThreshold",
        "opt-numbersToExpressions", "opt-simplify", "opt-transformObjectKeys",
        "opt-selfDefending", "opt-debugProtection", "opt-debugProtectionInterval",
        "opt-disableConsoleOutput", "opt-domainLock", "opt-domainLockRedirectUrl",
        "opt-compact", "opt-target", "opt-seed", "opt-sourceMap"
    ];

    var currentPreset = "default";
    var suppressCustomDetection = false;

    /** Emberi olvasásra formázott fájlméret (B/KB/MB). */
    function formatSize(byteLength) {
        if (byteLength < 1024) {
            return byteLength + " B";
        }
        if (byteLength < 1024 * 1024) {
            return (byteLength / 1024).toFixed(1) + " KB";
        }
        return (byteLength / (1024 * 1024)).toFixed(2) + " MB";
    }

    /** UTF-8 byte-hossz stringből (a JS .length karakterszámot ad, nem byte-ot). */
    function byteLength(str) {
        return new Blob([str]).size;
    }

    function updateInputSize() {
        inputSizeEl.textContent = formatSize(byteLength(inputEl.value));
    }

    function updateOutputSize() {
        var outSize = byteLength(outputEl.value);
        outputSizeEl.textContent = formatSize(outSize);
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.hidden = !message;
    }

    /** Soronkénti textarea-tartalmat regex-tömbbé alakít, üres sorokat kihagyva. */
    function parseRegexLines(text) {
        return text
            .split("\n")
            .map(function (line) { return line.trim(); })
            .filter(function (line) { return line.length > 0; });
    }

    /** Soronkénti domain-listát tömbbé alakít, üres sorokat kihagyva. */
    function parseLines(text) {
        return text
            .split("\n")
            .map(function (line) { return line.trim(); })
            .filter(function (line) { return line.length > 0; });
    }

    function buildOptions() {
        var stringArrayEncoding = [];
        if (document.getElementById("opt-stringArrayEncoding-base64").checked) {
            stringArrayEncoding.push("base64");
        }
        if (document.getElementById("opt-stringArrayEncoding-rc4").checked) {
            stringArrayEncoding.push("rc4");
        }

        var options = {
            identifierNamesGenerator: document.getElementById("opt-identifierNamesGenerator").value,
            renameGlobals: document.getElementById("opt-renameGlobals").checked,
            renameProperties: document.getElementById("opt-renameProperties").checked,
            renamePropertiesMode: document.getElementById("opt-renamePropertiesMode").value,
            identifiersPrefix: document.getElementById("opt-identifiersPrefix").value,

            stringArray: document.getElementById("opt-stringArray").checked,
            stringArrayThreshold: parseFloat(document.getElementById("opt-stringArrayThreshold").value),
            stringArrayEncoding: stringArrayEncoding,
            stringArrayRotate: document.getElementById("opt-stringArrayRotate").checked,
            stringArrayShuffle: document.getElementById("opt-stringArrayShuffle").checked,
            stringArrayWrappersCount: parseInt(document.getElementById("opt-stringArrayWrappersCount").value, 10) || 0,
            stringArrayWrappersType: document.getElementById("opt-stringArrayWrappersType").value,
            splitStrings: document.getElementById("opt-splitStrings").checked,
            splitStringsChunkLength: parseInt(document.getElementById("opt-splitStringsChunkLength").value, 10) || 10,
            unicodeEscapeSequence: document.getElementById("opt-unicodeEscapeSequence").checked,

            controlFlowFlattening: document.getElementById("opt-controlFlowFlattening").checked,
            controlFlowFlatteningThreshold: parseFloat(document.getElementById("opt-controlFlowFlatteningThreshold").value),
            deadCodeInjection: document.getElementById("opt-deadCodeInjection").checked,
            deadCodeInjectionThreshold: parseFloat(document.getElementById("opt-deadCodeInjectionThreshold").value),
            numbersToExpressions: document.getElementById("opt-numbersToExpressions").checked,
            simplify: document.getElementById("opt-simplify").checked,
            transformObjectKeys: document.getElementById("opt-transformObjectKeys").checked,

            selfDefending: document.getElementById("opt-selfDefending").checked,
            debugProtection: document.getElementById("opt-debugProtection").checked,
            debugProtectionInterval: parseInt(document.getElementById("opt-debugProtectionInterval").value, 10) || 0,
            disableConsoleOutput: document.getElementById("opt-disableConsoleOutput").checked,
            domainLock: parseLines(document.getElementById("opt-domainLock").value),
            domainLockRedirectUrl: document.getElementById("opt-domainLockRedirectUrl").value || "about:blank",

            compact: document.getElementById("opt-compact").checked,
            target: document.getElementById("opt-target").value,
            seed: parseInt(document.getElementById("opt-seed").value, 10) || 0,
            sourceMap: document.getElementById("opt-sourceMap").checked,

            reservedNames: parseRegexLines(document.getElementById("opt-reservedNames").value),
            reservedStrings: parseRegexLines(document.getElementById("opt-reservedStrings").value)
        };

        // Üres domainLock esetén a motor elvárása szerint ne küldjünk üres tömböt
        // felesleges domainLockRedirectUrl-lel együtt - de üres tömb önmagában
        // biztonságos default (nincs zárolás).
        return options;
    }

    function runObfuscation() {
        showError("");
        var code = inputEl.value;

        if (!code.trim()) {
            showError("Nincs bemeneti kód.");
            return;
        }

        if (typeof JavaScriptObfuscator === "undefined") {
            showError("Az obfuszkáló motor nem töltődött be.");
            return;
        }

        try {
            var result = JavaScriptObfuscator.obfuscate(code, buildOptions());
            var obfuscatedCode = result.getObfuscatedCode();
            outputEl.value = obfuscatedCode;
            updateOutputSize();
            btnCopy.disabled = false;
            btnDownload.disabled = false;
        } catch (err) {
            showError("Hiba az obfuszkálás közben: " + err.message);
            outputEl.value = "";
            updateOutputSize();
            btnCopy.disabled = true;
            btnDownload.disabled = true;
        }
    }

    function copyOutput() {
        if (!outputEl.value) {
            return;
        }
        navigator.clipboard.writeText(outputEl.value).then(function () {
            var original = btnCopy.textContent;
            btnCopy.textContent = "Másolva!";
            setTimeout(function () {
                btnCopy.textContent = original;
            }, 1500);
        }).catch(function () {
            showError("A vágólapra másolás nem sikerült.");
        });
    }

    function downloadOutput() {
        if (!outputEl.value) {
            return;
        }
        var blob = new Blob([outputEl.value], { type: "application/javascript" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "obfuscated.js";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleFileUpload(event) {
        var file = event.target.files[0];
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            inputEl.value = e.target.result;
            updateInputSize();
        };
        reader.onerror = function () {
            showError("A fájl beolvasása nem sikerült.");
        };
        reader.readAsText(file);
    }

    /** Csak a bemeneti és kimeneti dobozok tartalmát törli - az opciókat/presetet nem érinti. */
    function resetBoxes() {
        inputEl.value = "";
        outputEl.value = "";
        fileUploadEl.value = "";
        showError("");
        updateInputSize();
        updateOutputSize();
        btnCopy.disabled = true;
        btnDownload.disabled = true;
        inputEl.focus();
    }

    // --- Presetek kezelése ---

    function updatePresetButtonsUI() {
        var buttons = presetBar.querySelectorAll(".preset-btn[data-preset]");
        buttons.forEach(function (btn) {
            btn.classList.toggle("preset-btn--active", btn.getAttribute("data-preset") === currentPreset);
        });
        presetCustomIndicator.hidden = currentPreset !== window.OBF_CUSTOM_PRESET_KEY;

        if (savedPresetList) {
            savedPresetList.querySelectorAll(".preset-btn[data-saved-id]").forEach(function (btn) {
                btn.classList.toggle("preset-btn--active", currentPreset === "saved:" + btn.getAttribute("data-saved-id"));
            });
        }
    }

    function applyPreset(presetKey) {
        var preset = window.OBF_PRESETS[presetKey];
        if (!preset) {
            return;
        }
        applyOptions(preset.options);
        currentPreset = presetKey;
        updatePresetButtonsUI();
    }

    /** Egy mentett preset (szerverről jött, hiányos mezőkkel is lehet) betöltése. */
    function applySavedPreset(presetId) {
        var preset = savedPresets[presetId];
        if (!preset) {
            return;
        }
        // A mentett opciókat a "default" preset tetejére fektetjük, hogy
        // ha a szerveren régebbi, hiányos opció-JSON lenne, a hiányzó
        // mezők biztonságos alapértéket kapjanak.
        var merged = Object.assign({}, window.OBF_PRESETS["default"].options, preset.opciok);
        applyOptions(merged);
        currentPreset = "saved:" + presetId;
        updatePresetButtonsUI();
    }

    /** A megadott opció-objektumot minden UI-vezérlőre alkalmazza. */
    function applyOptions(opts) {
        suppressCustomDetection = true;

        setValue("opt-identifierNamesGenerator", opts.identifierNamesGenerator);
        setChecked("opt-renameGlobals", opts.renameGlobals);
        setChecked("opt-renameProperties", opts.renameProperties);
        setValue("opt-renamePropertiesMode", opts.renamePropertiesMode);
        setValue("opt-identifiersPrefix", opts.identifiersPrefix);

        setChecked("opt-stringArray", opts.stringArray);
        setValue("opt-stringArrayThreshold", opts.stringArrayThreshold);
        document.getElementById("stringArrayThreshold-value").textContent = opts.stringArrayThreshold;
        setChecked("opt-stringArrayEncoding-base64", opts.stringArrayEncoding.indexOf("base64") !== -1);
        setChecked("opt-stringArrayEncoding-rc4", opts.stringArrayEncoding.indexOf("rc4") !== -1);
        setChecked("opt-stringArrayRotate", opts.stringArrayRotate);
        setChecked("opt-stringArrayShuffle", opts.stringArrayShuffle);
        setValue("opt-stringArrayWrappersCount", opts.stringArrayWrappersCount);
        setValue("opt-stringArrayWrappersType", opts.stringArrayWrappersType);
        setChecked("opt-splitStrings", opts.splitStrings);
        setValue("opt-splitStringsChunkLength", opts.splitStringsChunkLength);
        setChecked("opt-unicodeEscapeSequence", opts.unicodeEscapeSequence);

        setChecked("opt-controlFlowFlattening", opts.controlFlowFlattening);
        setValue("opt-controlFlowFlatteningThreshold", opts.controlFlowFlatteningThreshold);
        document.getElementById("controlFlowFlatteningThreshold-value").textContent = opts.controlFlowFlatteningThreshold;
        setChecked("opt-deadCodeInjection", opts.deadCodeInjection);
        setValue("opt-deadCodeInjectionThreshold", opts.deadCodeInjectionThreshold);
        document.getElementById("deadCodeInjectionThreshold-value").textContent = opts.deadCodeInjectionThreshold;
        setChecked("opt-numbersToExpressions", opts.numbersToExpressions);
        setChecked("opt-simplify", opts.simplify);
        setChecked("opt-transformObjectKeys", opts.transformObjectKeys);

        setChecked("opt-selfDefending", opts.selfDefending);
        setChecked("opt-debugProtection", opts.debugProtection);
        setValue("opt-debugProtectionInterval", opts.debugProtectionInterval);
        setChecked("opt-disableConsoleOutput", opts.disableConsoleOutput);
        setValue("opt-domainLock", (opts.domainLock || []).join("\n"));
        setValue("opt-domainLockRedirectUrl", opts.domainLockRedirectUrl || "");

        setChecked("opt-compact", opts.compact);
        setValue("opt-target", opts.target);
        setValue("opt-seed", opts.seed);
        setChecked("opt-sourceMap", opts.sourceMap);

        suppressCustomDetection = false;
    }

    function setValue(id, value) {
        document.getElementById(id).value = value;
    }

    function setChecked(id, checked) {
        document.getElementById(id).checked = !!checked;
    }

    function markCustom() {
        if (suppressCustomDetection) {
            return;
        }
        if (currentPreset !== window.OBF_CUSTOM_PRESET_KEY) {
            currentPreset = window.OBF_CUSTOM_PRESET_KEY;
            updatePresetButtonsUI();
        }
    }

    function initPresetBar() {
        presetBar.addEventListener("click", function (event) {
            var btn = event.target.closest(".preset-btn[data-preset]");
            if (btn) {
                applyPreset(btn.getAttribute("data-preset"));
            }
        });

        controlIds.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) {
                el.addEventListener("input", markCustom);
                el.addEventListener("change", markCustom);
            }
        });

        applyPreset("default");
    }

    // --- Mentett presetek (PHP/MySQL AJAX, csak opció-JSON) ---

    /** A mentett presetek gombsorát rerendereli a savedPresets alapján. */
    function renderSavedPresets() {
        var ids = Object.keys(savedPresets);
        savedPresetBar.hidden = ids.length === 0;
        savedPresetList.innerHTML = "";

        ids.forEach(function (id) {
            var preset = savedPresets[id];

            var wrapper = document.createElement("span");
            wrapper.className = "saved-preset-item";

            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "preset-btn";
            btn.setAttribute("data-saved-id", id);
            btn.textContent = preset.nev;
            btn.addEventListener("click", function () {
                applySavedPreset(id);
            });

            var del = document.createElement("button");
            del.type = "button";
            del.className = "saved-preset-delete";
            del.setAttribute("aria-label", "Preset törlése: " + preset.nev);
            del.textContent = "×";
            del.addEventListener("click", function (event) {
                event.stopPropagation();
                deleteSavedPreset(id, preset.nev);
            });

            wrapper.appendChild(btn);
            wrapper.appendChild(del);
            savedPresetList.appendChild(wrapper);
        });

        updatePresetButtonsUI();
    }

    /** Mentett presetek betöltése a szerverről (csak opció-JSON, nem forráskód). */
    function loadSavedPresets() {
        fetch(PRESETS_API_URL + "?action=list")
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (!data.ok) {
                    return;
                }
                savedPresets = {};
                data.presets.forEach(function (preset) {
                    savedPresets[preset.id] = preset;
                });
                renderSavedPresets();
            })
            .catch(function () {
                // A mentett presetek nélkül is teljes értékű az eszköz
                // (pl. ha még nincs beállítva az adatbázis) - csendben
                // elnyeljük, nem zavarjuk az obfuszkálási funkciót.
            });
    }

    function showSaveStatus(message, isError) {
        savePresetStatusEl.textContent = message;
        savePresetStatusEl.classList.toggle("save-preset-status--error", !!isError);
        if (message) {
            setTimeout(function () {
                savePresetStatusEl.textContent = "";
            }, 3000);
        }
    }

    function saveCurrentAsPreset() {
        var nev = savePresetNameEl.value.trim();
        if (!nev) {
            showSaveStatus("Adj nevet a presetnek.", true);
            savePresetNameEl.focus();
            return;
        }

        var body = new URLSearchParams();
        body.set("action", "save");
        body.set("nev", nev);
        body.set("opciok_json", JSON.stringify(buildOptions()));

        btnSavePreset.disabled = true;
        fetch(PRESETS_API_URL, { method: "POST", body: body })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (!data.ok) {
                    showSaveStatus(data.error || "A mentés nem sikerült.", true);
                    return;
                }
                savedPresets[data.preset.id] = data.preset;
                renderSavedPresets();
                savePresetNameEl.value = "";
                showSaveStatus("Preset elmentve.", false);
            })
            .catch(function () {
                showSaveStatus("A mentés nem sikerült (hálózati hiba).", true);
            })
            .finally(function () {
                btnSavePreset.disabled = false;
            });
    }

    function deleteSavedPreset(id, nev) {
        if (!window.confirm('Törlöd a(z) "' + nev + '" presetet?')) {
            return;
        }

        var body = new URLSearchParams();
        body.set("action", "delete");
        body.set("id", id);

        fetch(PRESETS_API_URL, { method: "POST", body: body })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (!data.ok) {
                    showSaveStatus(data.error || "A törlés nem sikerült.", true);
                    return;
                }
                delete savedPresets[id];
                if (currentPreset === "saved:" + id) {
                    applyPreset("default");
                } else {
                    renderSavedPresets();
                }
            })
            .catch(function () {
                showSaveStatus("A törlés nem sikerült (hálózati hiba).", true);
            });
    }

    // --- Csúszka-érték kijelzők ---

    function initRangeDisplays() {
        var pairs = [
            ["opt-stringArrayThreshold", "stringArrayThreshold-value"],
            ["opt-controlFlowFlatteningThreshold", "controlFlowFlatteningThreshold-value"],
            ["opt-deadCodeInjectionThreshold", "deadCodeInjectionThreshold-value"]
        ];
        pairs.forEach(function (pair) {
            var input = document.getElementById(pair[0]);
            var display = document.getElementById(pair[1]);
            input.addEventListener("input", function () {
                display.textContent = input.value;
            });
        });
    }

    // --- Görgetéskor zsugorodó sticky sáv ---

    /**
     * A sticky-bar "is-scrolled" állapotát kapcsolja az oldal görgetési
     * pozíciója alapján (a fejléc/preset sorok/be-ki dobozok ekkor
     * kisebbre zsugorodnak CSS-átmenettel - lásd style.css).
     */
    function initStickyShrink() {
        if (!stickyBar) {
            return;
        }

        // A zsugorodás/visszanyúlás maga is megváltoztatja az oldal
        // magasságát, ami az állapotváltás pillanatában megugratja a
        // scrollY-t - ez egyetlen küszöbnél, sőt hiszterézissel is
        // remegést okozhat a határon. Ezért két külön küszöb (hiszterézis)
        // MELLÉ egy rövid "hűtési" időt is teszünk: egy váltás után a CSS
        // átmenet (0.2s) idejére nem engedünk újabb váltást, hogy a
        // méretváltozás okozta scroll-ugrás ne tudjon azonnal visszaváltani.
        var SHRINK_AT = 120;
        var EXPAND_AT = 20;
        var TRANSITION_COOLDOWN_MS = 250;
        var ticking = false;
        var coolingDown = false;

        function updateShrinkState() {
            ticking = false;
            if (coolingDown) {
                return;
            }

            var y = window.scrollY;
            var isScrolled = stickyBar.classList.contains("is-scrolled");

            if (!isScrolled && y > SHRINK_AT) {
                stickyBar.classList.add("is-scrolled");
            } else if (isScrolled && y < EXPAND_AT) {
                stickyBar.classList.remove("is-scrolled");
            } else {
                return;
            }

            coolingDown = true;
            setTimeout(function () {
                coolingDown = false;
            }, TRANSITION_COOLDOWN_MS);
        }

        window.addEventListener("scroll", function () {
            if (!ticking) {
                window.requestAnimationFrame(updateShrinkState);
                ticking = true;
            }
        }, { passive: true });
    }

    inputEl.addEventListener("input", updateInputSize);
    btnObfuscate.addEventListener("click", runObfuscation);
    btnCopy.addEventListener("click", copyOutput);
    btnDownload.addEventListener("click", downloadOutput);
    fileUploadEl.addEventListener("change", handleFileUpload);
    btnReset.addEventListener("click", resetBoxes);
    btnSavePreset.addEventListener("click", saveCurrentAsPreset);

    initPresetBar();
    initRangeDisplays();
    initStickyShrink();
    updateInputSize();
    updateOutputSize();
    loadSavedPresets();
})();
