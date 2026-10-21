// Holds the Spanish and English text after the translation file is loaded.
let traducciones = {};

// Keeps track of the language currently shown on the page.
let idiomaActual = "es";

// Gets a translated value and keeps the original value when the key is missing.
function obtenerDatosTraduccion(clave, valorPredeterminado = "") {
    const traduccionesActuales = traducciones[idiomaActual];

    if (!traduccionesActuales || !traduccionesActuales[clave]) {
        return valorPredeterminado;
    }

    return traduccionesActuales[clave];
}

// Gets short messages, such as button labels and validation feedback.
function obtenerMensajeTraducido(clave, valorPredeterminado) {
    const mensajes = obtenerDatosTraduccion("messages", {});
    return mensajes[clave] || valorPredeterminado;
}

// Changes the marked page text to the selected language.
function renderizarTraducciones() {
    const textos = document.querySelectorAll("[data-i18n]");
    const tituloPagina = document.querySelector("[data-i18n-title]");

    for (let indice = 0; indice < textos.length; indice++) {
        const elemento = textos[indice];
        const clave = elemento.getAttribute("data-i18n");
        elemento.textContent = obtenerDatosTraduccion(clave, elemento.textContent);
    }

    const campos = document.querySelectorAll("[data-i18n-placeholder]");

    for (let indice = 0; indice < campos.length; indice++) {
        const elemento = campos[indice];
        const clave = elemento.getAttribute("data-i18n-placeholder");
        elemento.placeholder = obtenerDatosTraduccion(clave, elemento.placeholder);
    }

    const elementosConTitulo = document.querySelectorAll("[data-i18n-title-attr]");

    for (let indice = 0; indice < elementosConTitulo.length; indice++) {
        const elemento = elementosConTitulo[indice];
        const clave = elemento.getAttribute("data-i18n-title-attr");
        elemento.title = obtenerDatosTraduccion(clave, elemento.title);
    }

    const botonIdioma = document.getElementById("boton-idioma");

    if (botonIdioma) {
        if (idiomaActual === "es") {
            botonIdioma.textContent = "EN";
        } else {
            botonIdioma.textContent = "ES";
        }
    }

    if (tituloPagina) {
        tituloPagina.textContent = obtenerDatosTraduccion(tituloPagina.getAttribute("data-i18n-title"), tituloPagina.textContent);
    }

    document.documentElement.lang = idiomaActual;
    document.dispatchEvent(new Event("translationsUpdated"));
}

// Loads the translation file before the page can switch languages.
async function cargarTraducciones() {
    try {
        const respuesta = await fetch("../json/translations.json");

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el archivo de traducciones.");
        }

        traducciones = await respuesta.json();
        renderizarTraducciones();
    } catch (error) {
        console.error(error);
    }
}

cargarTraducciones();

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
