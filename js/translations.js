let translations = {};
let currentLanguage = "es";

function getTranslationData(key, defaultValue = "") {
    const currentTranslations = translations[currentLanguage];

    if (!currentTranslations || !currentTranslations[key]) {
        return defaultValue;
    }

    return currentTranslations[key];
}

function getTranslatedMessage(key, defaultValue) {
    const messages = getTranslationData("messages", {});
    return messages[key] || defaultValue;
}

function renderTranslations() {
    const blocks = document.querySelectorAll("[data-i18n-block]");
    const pageTitle = document.querySelector("[data-i18n-title]");

    blocks.forEach((block) => {
        const key = block.getAttribute("data-i18n-block");
        block.innerHTML = getTranslationData(key, block.innerHTML);
    });

    if (pageTitle) {
        pageTitle.textContent = getTranslationData(pageTitle.getAttribute("data-i18n-title"), pageTitle.textContent);
    }

    document.documentElement.lang = currentLanguage;
    document.dispatchEvent(new Event("translationsUpdated"));
}

fetch("../json/translations.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error("No se pudo cargar el archivo de traducciones.");
        }

        return response.json();
    })
    .then((data) => {
        translations = data;
        renderTranslations();
    })
    .catch((error) => {
        console.error(error);
    });

function cambiarIdioma() {
    if (Object.keys(translations).length === 0) {
        return;
    }

    currentLanguage = currentLanguage === "es" ? "en" : "es";
    renderTranslations();
}
