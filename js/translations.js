let translations = {};
let currentLang = "es";

fetch("../json/translations.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        translations = data;
        console.log("Translations loaded successfully.");
    })
    .catch(error => {
        console.error("Failed to load translation file:", error);
    });

function toggleLanguage() {
    if (Object.keys(translations).length === 0) {
        alert("Translation data is still loading. Please try again in a moment.");
        return;
    }

    currentLang = (currentLang === "es") ? "en" : "es";

    const btn = document.getElementById("lang-btn");
    btn.textContent = translations[currentLang]["buttonText"];

    const blocks = document.querySelectorAll("[data-i18n-block]");

    blocks.forEach(block => {
        const key = block.getAttribute("data-i18n-block");
        block.innerHTML = translations[currentLang][key];
    });
}
