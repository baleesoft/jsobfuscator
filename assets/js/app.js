/**
 * JS Obfuszkátor - UI logika (MVP fázis).
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

    var optIdentifierNamesGenerator = document.getElementById("opt-identifierNamesGenerator");
    var optStringArray = document.getElementById("opt-stringArray");
    var optControlFlowFlattening = document.getElementById("opt-controlFlowFlattening");
    var optSelfDefending = document.getElementById("opt-selfDefending");
    var optCompact = document.getElementById("opt-compact");

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

    function buildOptions() {
        return {
            identifierNamesGenerator: optIdentifierNamesGenerator.value,
            stringArray: optStringArray.checked,
            controlFlowFlattening: optControlFlowFlattening.checked,
            selfDefending: optSelfDefending.checked,
            compact: optCompact.checked
        };
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

    inputEl.addEventListener("input", updateInputSize);
    btnObfuscate.addEventListener("click", runObfuscation);
    btnCopy.addEventListener("click", copyOutput);
    btnDownload.addEventListener("click", downloadOutput);
    fileUploadEl.addEventListener("change", handleFileUpload);

    updateInputSize();
    updateOutputSize();
})();
