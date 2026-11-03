// Holds the Spanish and English text after the translation file is loaded.
let traducciones = {};

// Keeps track of the language currently shown on the page.
let idiomaActual = "es";

// Gets a value from the currently selected language.
function obtenerDatosTraduccion(clave) {
    return traducciones[idiomaActual][clave];
}

// Gets short messages, such as button labels and validation feedback.
function obtenerMensajeTraducido(clave) {
    return obtenerDatosTraduccion("mensajes")[clave];
}

// Changes the marked page text to the selected language.
function renderizarTraducciones() {
    const textos = document.querySelectorAll("[data-i18n]");
    const tituloPagina = document.querySelector("[data-i18n-title]");

    for (let indice = 0; indice < textos.length; indice++) {
        const elemento = textos[indice];
        const clave = elemento.getAttribute("data-i18n");
        elemento.textContent = obtenerDatosTraduccion(clave);
    }

    const campos = document.querySelectorAll("[data-i18n-placeholder]");

    for (let indice = 0; indice < campos.length; indice++) {
        const elemento = campos[indice];
        const clave = elemento.getAttribute("data-i18n-placeholder");
        elemento.placeholder = obtenerDatosTraduccion(clave);
    }

    const botonIdioma = document.getElementById("boton-idioma");

    if (idiomaActual === "es") {
        botonIdioma.textContent = "EN";
    } else {
        botonIdioma.textContent = "ES";
    }

    tituloPagina.textContent = obtenerDatosTraduccion(tituloPagina.getAttribute("data-i18n-title"));

    document.documentElement.lang = idiomaActual;
    document.dispatchEvent(new Event("traduccionesActualizadas"));
}

// Loads the translation file before the page can switch languages.
async function cargarTraducciones() {
    const respuesta = await fetch("../json/translations.json");
    traducciones = await respuesta.json();
    renderizarTraducciones();
}

const traduccionesCargadas = cargarTraducciones();

// Switches between Spanish and English when the language button is pressed.
function cambiarIdioma() {
    if (!traducciones.es || !traducciones.en) {
        return;
    }

    if (idiomaActual === "es") {
        idiomaActual = "en";
    } else {
        idiomaActual = "es";
    }

    renderizarTraducciones();
}
