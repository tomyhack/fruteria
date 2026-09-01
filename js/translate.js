// Configuración base para cargar traducciones y recordar el idioma elegido.
(() => {
    const DEFAULT_LANGUAGE = "es";
    const STORAGE_KEY = "fruteria-language";
    const TRANSLATIONS_URL = new URL("../json/translate.json", document.currentScript.src);

    let translations = null;
    let currentLanguage = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
    let valueKeys = new Map();

    // Busca un valor dentro de un objeto anidado usando notación de puntos.
    function getValue(object, key) {
        return key.split(".").reduce((value, part) => value && value[part], object);
    }

    // Sustituye placeholders como {nombre} por los valores reales que recibe la función.
    function format(value, parameters = {}) {
        return value.replace(/\{(\w+)\}/g, (_, name) => parameters[name] ?? `{${name}}`);
    }

    // Traduce una clave del JSON y reemplaza los parámetros si existen.
    function translate(key, parameters = {}, fallback = key) {
        const value = translations && getValue(translations[currentLanguage], key);
        return typeof value === "string" ? format(value, parameters) : fallback;
    }

    // Genera un mapa para relacionar texto original con su clave de traducción.
    function addValues(object, prefix = "") {
        Object.entries(object).forEach(([name, value]) => {
            const key = prefix ? `${prefix}.${name}` : name;

            if (typeof value === "string") {
                const normalized = value.trim();
                if (normalized && !valueKeys.has(normalized)) {
                    valueKeys.set(normalized, key);
                }
                return;
            }

            if (value && typeof value === "object") {
                addValues(value, key);
            }
        });
    }

    // Reconstruye el índice cada vez que se cargan nuevas traducciones.
    function buildValueKeys() {
        valueKeys = new Map();
        Object.values(translations).forEach((language) => addValues(language));
    }

    // Traduce texto literal sin perder espacios al inicio o al final.
    function translateValue(value) {
        if (typeof value !== "string") return value;

        const leadingWhitespace = value.match(/^\s*/)[0];
        const trailingWhitespace = value.match(/\s*$/)[0];
        const key = valueKeys.get(value.trim());

        return key ? `${leadingWhitespace}${translate(key)}${trailingWhitespace}` : value;
    }

    // Recorre los nodos de texto para traducir el contenido visible de la página.
    function translateTextNodes(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const nodes = [];
        let node;

        while ((node = walker.nextNode())) {
            if (!node.parentElement?.closest("script, style")) {
                nodes.push(node);
            }
        }

        nodes.forEach((textNode) => {
            textNode.nodeValue = translateValue(textNode.nodeValue);
        });
    }

    // Traduce atributos que muestran textos, como placeholders, títulos y labels.
    function translateAttributes(root) {
        const attributes = ["alt", "aria-label", "placeholder", "title", "value"];
        const elements = [];

        if (root instanceof Element && root.matches("[alt], [aria-label], [placeholder], [title], [value]")) {
            elements.push(root);
        }
        const matchingElements = root.querySelectorAll
            ? root.querySelectorAll("[alt], [aria-label], [placeholder], [title], [value]")
            : [];
        elements.push(...matchingElements);

        elements.forEach((element) => {
            attributes.forEach((attribute) => {
                if (element.hasAttribute(attribute)) {
                    element.setAttribute(attribute, translateValue(element.getAttribute(attribute)));
                }
            });
        });
    }

    // Traduce elementos con data-i18n y aplica parámetros si existen.
    function translateKeyedElements(root) {
        const elements = [];

        if (root instanceof Element && root.matches("[data-i18n]")) elements.push(root);
        const keyedElements = root.querySelectorAll ? root.querySelectorAll("[data-i18n]") : [];
        elements.push(...keyedElements);

        elements.forEach((element) => {
            const parameters = {};
            Array.from(element.attributes).forEach((attribute) => {
                const prefix = "data-i18n-param-";
                if (attribute.name.startsWith(prefix)) {
                    parameters[attribute.name.slice(prefix.length)] = attribute.value;
                }
            });
            element.textContent = translate(element.dataset.i18n, parameters, element.textContent);
        });
    }

    // Actualiza los botones de idioma para reflejar el siguiente idioma disponible.
    function updateLanguageButtons() {
        const nextLanguage = currentLanguage === "es" ? "en" : "es";
        const nextLanguageName = translate(`common.languages.${nextLanguage}`);

        document.querySelectorAll("[data-language-toggle]").forEach((button) => {
            button.textContent = nextLanguage.toUpperCase();
            button.setAttribute("aria-label", translate("common.switchLanguage", { language: nextLanguageName }));
            button.title = translate("common.switchLanguage", { language: nextLanguageName });
        });
    }

    // Aplica todas las traducciones a la página actual.
    function applyTranslations(root = document) {
        if (!translations) return;

        document.documentElement.lang = currentLanguage;
        document.title = translateValue(document.title);
        translateKeyedElements(root);
        translateTextNodes(root);
        translateAttributes(root);
        updateLanguageButtons();
    }

    // Cambia el idioma activo y guarda la preferencia del usuario.
    function setLanguage(language) {
        if (!translations?.[language]) return;

        currentLanguage = language;
        localStorage.setItem(STORAGE_KEY, language);
        applyTranslations();
        window.dispatchEvent(new CustomEvent("languagechange", { detail: { language } }));
    }

    // Vincula cada botón de cambio de idioma con el alternado de idioma.
    function bindLanguageButtons() {
        document.querySelectorAll("[data-language-toggle]").forEach((button) => {
            button.addEventListener("click", () => {
                setLanguage(currentLanguage === "es" ? "en" : "es");
            });
        });
    }

    // API pública para usar la traducción desde otros scripts.
    window.i18n = {
        t: translate,
        translateValue,
        translateElement: applyTranslations,
        get language() {
            return currentLanguage;
        },
        get locale() {
            return translations?.[currentLanguage]?.locale || "es-UY";
        }
    };

    // Carga el JSON de idiomas y prepara la interfaz para usarlo.
    window.i18nReady = fetch(TRANSLATIONS_URL)
        .then((response) => {
            if (!response.ok) throw new Error("No se pudo cargar el archivo de traducciones.");
            return response.json();
        })
        .then((data) => {
            translations = data;
            if (!translations[currentLanguage]) currentLanguage = DEFAULT_LANGUAGE;
            buildValueKeys();
            applyTranslations();
            bindLanguageButtons();
        })
        .catch((error) => {
            console.error("Error al cargar las traducciones:", error);
        });
})()
