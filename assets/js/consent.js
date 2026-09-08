/**
 * JS Obfuszkátor - cookie-consent banner (Google Consent Mode v2).
 *
 * A <head>-ben (index.php) a gtag consent alapértelmezettje "denied",
 * ezért a Google Analytics egészen addig nem gyűjt adatot, amíg a
 * látogató itt kifejezetten el nem fogadja. Ez a script:
 *  - első látogatáskor megjeleníti a bannert,
 *  - eltárolja a döntést localStorage-ban (a jsobf-theme/jsobf-lang
 *    mintáját követve),
 *  - Elfogadás esetén frissíti a Consent Mode állapotot "granted"-re,
 *  - visszatérő látogatónál (mentett döntéssel) nem jelenít meg semmit,
 *    és ha korábban elfogadás történt, azonnal grantel.
 */
(function () {
    "use strict";

    var CONSENT_STORAGE_KEY = "jsobf-consent";

    function gtagUpdate(granted) {
        if (typeof window.gtag !== "function") {
            return;
        }
        window.gtag('consent', 'update', {
            'analytics_storage': granted ? 'granted' : 'denied'
        });
    }

    function getSavedConsent() {
        try {
            return localStorage.getItem(CONSENT_STORAGE_KEY);
        } catch (e) {
            // localStorage nem elérhető - úgy tekintjük, mintha még nem lenne döntés.
            return null;
        }
    }

    function saveConsent(value) {
        try {
            localStorage.setItem(CONSENT_STORAGE_KEY, value);
        } catch (e) {
            // localStorage nem elérhető - a választás csak erre az oldalbetöltésre érvényes.
        }
    }

    function currentLang() {
        var lang = document.documentElement.getAttribute("lang");
        if (window.OBF_I18N && window.OBF_I18N.isSupported(lang)) {
            return lang;
        }
        return (window.OBF_I18N && window.OBF_I18N.DEFAULT_LANG) || "hu";
    }

    function buildBanner() {
        var banner = document.createElement("div");
        banner.className = "consent-banner";
        banner.id = "consent-banner";
        banner.setAttribute("role", "dialog");
        banner.setAttribute("aria-live", "polite");

        var textWrap = document.createElement("p");
        textWrap.className = "consent-banner__text";

        var textSpan = document.createElement("span");
        textSpan.setAttribute("data-i18n", "consent.text");
        textWrap.appendChild(textSpan);
        textWrap.appendChild(document.createTextNode(" "));

        var link = document.createElement("a");
        link.href = "privacy.php";
        link.setAttribute("data-i18n", "consent.privacyLink");
        textWrap.appendChild(link);

        var actions = document.createElement("div");
        actions.className = "consent-banner__actions";

        var btnReject = document.createElement("button");
        btnReject.type = "button";
        btnReject.className = "button button--secondary";
        btnReject.id = "consent-reject";
        btnReject.setAttribute("data-i18n", "consent.reject");

        var btnAccept = document.createElement("button");
        btnAccept.type = "button";
        btnAccept.className = "button button--primary";
        btnAccept.id = "consent-accept";
        btnAccept.setAttribute("data-i18n", "consent.accept");

        actions.appendChild(btnReject);
        actions.appendChild(btnAccept);

        banner.appendChild(textWrap);
        banner.appendChild(actions);

        btnReject.addEventListener("click", function () {
            saveConsent("denied");
            gtagUpdate(false);
            removeBanner(banner);
        });

        btnAccept.addEventListener("click", function () {
            saveConsent("granted");
            gtagUpdate(true);
            removeBanner(banner);
        });

        return banner;
    }

    function removeBanner(banner) {
        if (banner && banner.parentNode) {
            banner.parentNode.removeChild(banner);
        }
    }

    function showBanner() {
        var banner = buildBanner();
        document.body.appendChild(banner);
        if (window.OBF_I18N) {
            window.OBF_I18N.apply(currentLang());
        }
    }

    function init() {
        var saved = getSavedConsent();
        if (saved === "granted") {
            gtagUpdate(true);
            return;
        }
        if (saved === "denied") {
            return;
        }
        showBanner();
    }

    init();
})();
