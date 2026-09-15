// Este objeto guarda los textos que se leen desde el archivo JSON.
var translations = {};
var currentLang = "es";

// Se carga el archivo con los textos antes de cambiar de idioma.
fetch("../json/translations.json")
    .then(function (response) {
        if (!response.ok) {
            throw new Error("No se pudo cargar el archivo de traducciones.");
        }

        return response.json();
    })
    .then(function (data) {
        translations = data;

        // Muestra los mensajes de inicio de sesión cuando ya existen las traducciones.
        if (typeof mostrarMensaje === "function") {
            mostrarMensaje();
        }
    })
    .catch(function (error) {
        console.error("No se pudieron cargar las traducciones:", error);
    });

// Esta función se ejecuta al presionar el botón de idioma.
function toggleLanguage() {
    if (Object.keys(translations).length === 0) {
        alert("Las traducciones se están cargando. Intenta nuevamente en un momento.");
        return;
    }

    // Alterna entre español e inglés.
    if (currentLang === "es") {
        currentLang = "en";
    } else {
        currentLang = "es";
    }

    document.documentElement.lang = currentLang;

    // Cambia el texto de cada bloque marcado en el HTML.
    var blocks = document.querySelectorAll("[data-i18n-block]");

    blocks.forEach(function (block) {
        var key = block.getAttribute("data-i18n-block");
        block.innerHTML = translations[currentLang][key];
    });

    // El botón indica cuál es el idioma disponible al hacer clic.
    var button = document.getElementById("lang-btn");
    button.textContent = translations[currentLang].buttonText;

    // Si hay un mensaje del servidor, también se muestra en el idioma elegido.
    if (typeof mostrarMensaje === "function") {
        mostrarMensaje();
    }
}