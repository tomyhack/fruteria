// IIFE (Immediately Invoked Function Expression) para encapsular el código.
(() => {
    // Idioma predeterminado si no hay uno guardado en el almacenamiento local.
    const DEFAULT_LANGUAGE = "es";
    // Clave para guardar el idioma seleccionado en localStorage.
    const STORAGE_KEY = "fruteria-language";
    // URL al archivo JSON que contiene todas las traducciones.
    const TRANSLATIONS_URL = new URL("../json/translate.json", document.currentScript.src);

    // Objeto que almacena todas las traducciones cargadas desde JSON.
    let translations = null;
    // Idioma actual, recuperado del localStorage o usando el predeterminado.
    let currentLanguage = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
    // Mapa para buscar rápidamente traducciones por su valor (texto literal).
    let valueKeys = new Map();

    // Obtiene un valor anidado de un objeto usando una ruta separada por puntos.
    // Ejemplo: getValue(obj, "common.language.es") -> obtiene obj.common.language.es
    function getValue(object, key) {
        return key.split(".").reduce((value, part) => value && value[part], object);
    }

    // Reemplaza marcadores de posición en un valor con parámetros reales.
    // Ejemplo: format("Hola {nombre}", {nombre: "Juan"}) -> "Hola Juan"
    function format(value, parameters = {}) {
        return value.replace(/\{(\w+)\}/g, (_, name) => parameters[name] ?? `{${name}}`);
    }

    // Traduce una clave a su valor en el idioma actual.
    // También reemplaza parámetros si se proporcionan.
    // Si no encuentra la traducción, devuelve el valor por defecto (fallback).
    function translate(key, parameters = {}, fallback = key) {
        // Obtiene el valor del idioma actual usando la clave anidada.
        const value = translations && getValue(translations[currentLanguage], key);
        // Si es un string, lo formatea con los parámetros. Si no, devuelve el fallback.
        return typeof value === "string" ? format(value, parameters) : fallback;
    }

    // Añade un valor de texto a un mapa para poder buscarlo posteriormente.
    // Construye claves anidadas usando notación de puntos (ej: "menu.inicio").
    function addValues(object, prefix = "") {
        // Itera sobre cada propiedad del objeto.
        Object.entries(object).forEach(([name, value]) => {
            // Construye la clave completa: si hay prefijo, lo añade separado por punto.
            const key = prefix ? `${prefix}.${name}` : name;

            // Si el valor es un string, lo añade al mapa de búsqueda.
            if (typeof value === "string") {
                const normalized = value.trim();
                // Solo añade si no está vacío y no existe ya en el mapa.
                if (normalized && !valueKeys.has(normalized)) {
                    valueKeys.set(normalized, key);
                }
                return;
            }

            // Si el valor es un objeto, lo procesa recursivamente.
            if (value && typeof value === "object") {
                addValues(value, key);
            }
        });
    }

    // Reconstruye el mapa de valores para búsqueda rápida.
    // Se llama cada vez que se cargan nuevas traducciones.
    function buildValueKeys() {
        // Limpia el mapa anterior.
        valueKeys = new Map();
        // Procesa cada idioma disponible.
        Object.values(translations).forEach((language) => addValues(language));
    }

    // Traduce un valor de texto literal buscando su clave en el mapa.
    // Conserva los espacios en blanco al inicio y final.
    function translateValue(value) {
        // Si no es un string, lo devuelve sin cambios.
        if (typeof value !== "string") return value;

        // Captura los espacios en blanco al inicio.
        const leadingWhitespace = value.match(/^\s*/)[0];
        // Captura los espacios en blanco al final.
        const trailingWhitespace = value.match(/\s*$/)[0];
        // Busca la clave de traducción para el valor sin espacios.
        const key = valueKeys.get(value.trim());

        // Si encuentra una clave, devuelve la traducción con los espacios originales.
        // Si no, devuelve el valor original sin cambios.
        return key ? `${leadingWhitespace}${translate(key)}${trailingWhitespace}` : value;
    }

    // Traduce todos los nodos de texto dentro de un elemento.
    // Excluye el contenido de scripts y styles.
    function translateTextNodes(root) {
        // TreeWalker permite iterar solo sobre nodos de texto.
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const nodes = [];
        let node;

        // Recorre todos los nodos de texto y los almacena en un array.
        // Los almacena primero para evitar problemas al modificar el DOM durante la iteración.
        while ((node = walker.nextNode())) {
            // Ignora nodos dentro de scripts o styles.
            if (!node.parentElement?.closest("script, style")) {
                nodes.push(node);
            }
        }

        // Traduce el contenido de cada nodo de texto.
        nodes.forEach((textNode) => {
            textNode.nodeValue = translateValue(textNode.nodeValue);
        });
    }

    // Traduce los atributos de elementos HTML especificados.
    // Atributos: alt, aria-label, placeholder, title, value.
    function translateAttributes(root) {
        // Lista de atributos que pueden contener textos traducibles.
        const attributes = ["alt", "aria-label", "placeholder", "title", "value"];
        const elements = [];

        // Si el elemento raíz tiene alguno de estos atributos, lo añade.
        if (root instanceof Element && root.matches("[alt], [aria-label], [placeholder], [title], [value]")) {
            elements.push(root);
        }
        // Busca todos los elementos que tengan estos atributos.
        const matchingElements = root.querySelectorAll
            ? root.querySelectorAll("[alt], [aria-label], [placeholder], [title], [value]")
            : [];
        elements.push(...matchingElements);

        // Para cada elemento, traduce todos sus atributos traducibles.
        elements.forEach((element) => {
            attributes.forEach((attribute) => {
                if (element.hasAttribute(attribute)) {
                    // Obtiene el atributo, lo traduce, y lo vuelve a establecer.
                    element.setAttribute(attribute, translateValue(element.getAttribute(attribute)));
                }
            });
        });
    }

    // Traduce elementos que tienen el atributo data-i18n con claves de traducción.
    // También procesa parámetros usando atributos data-i18n-param-*.
    function translateKeyedElements(root) {
        const elements = [];

        // Si el elemento raíz tiene atributo data-i18n, lo añade.
        if (root instanceof Element && root.matches("[data-i18n]")) elements.push(root);
        // Busca todos los elementos con atributo data-i18n.
        const keyedElements = root.querySelectorAll ? root.querySelectorAll("[data-i18n]") : [];
        elements.push(...keyedElements);

        // Para cada elemento data-i18n, traduce usando la clave y los parámetros.
        elements.forEach((element) => {
            // Recorre todos los atributos del elemento.
            const parameters = {};
            Array.from(element.attributes).forEach((attribute) => {
                // Busca atributos que empiezan con "data-i18n-param-".
                const prefix = "data-i18n-param-";
                if (attribute.name.startsWith(prefix)) {
                    // Extrae el nombre del parámetro y lo añade al objeto.
                    parameters[attribute.name.slice(prefix.length)] = attribute.value;
                }
            });
            // Traduce el elemento usando la clave data-i18n y los parámetros.
            element.textContent = translate(element.dataset.i18n, parameters, element.textContent);
        });
    }

    // Actualiza el texto de los botones de cambio de idioma.
    // Muestra el idioma siguiente en mayúsculas.
    function updateLanguageButtons() {
        // Calcula el siguiente idioma (opuesto al actual).
        const nextLanguage = currentLanguage === "es" ? "en" : "es";
        // Obtiene el nombre del siguiente idioma en el idioma actual.
        const nextLanguageName = translate(`common.languages.${nextLanguage}`);

        // Actualiza todos los botones de cambio de idioma.
        document.querySelectorAll("[data-language-toggle]").forEach((button) => {
            // Muestra el código del idioma siguiente (EN o ES).
            button.textContent = nextLanguage.toUpperCase();
            // Actualiza el atributo aria-label para accesibilidad.
            button.setAttribute("aria-label", translate("common.switchLanguage", { language: nextLanguageName }));
            // Actualiza el título al pasar el ratón.
            button.title = translate("common.switchLanguage", { language: nextLanguageName });
        });
    }

    // Aplica todas las traducciones a un elemento y sus hijos.
    // Se llama cuando se carga la página o cuando cambia el idioma.
    function applyTranslations(root = document) {
        // Solo procede si las traducciones están cargadas.
        if (!translations) return;

        // Establece el atributo lang del HTML al idioma actual.
        document.documentElement.lang = currentLanguage;
        // Traduce el título de la página.
        document.title = translateValue(document.title);
        // Traduce elementos con claves (data-i18n).
        translateKeyedElements(root);
        // Traduce nodos de texto.
        translateTextNodes(root);
        // Traduce atributos de elementos.
        translateAttributes(root);
        // Actualiza los botones de cambio de idioma.
        updateLanguageButtons();
    }

    // Cambia el idioma actual y aplica las traducciones.
    function setLanguage(language) {
        // Valida que el idioma existe en las traducciones cargadas.
        if (!translations?.[language]) return;

        // Establece el nuevo idioma.
        currentLanguage = language;
        // Guarda el idioma en localStorage para mantenerlo en futuras visitas.
        localStorage.setItem(STORAGE_KEY, language);
        // Aplica todas las traducciones con el nuevo idioma.
        applyTranslations();
        // Dispara un evento personalizado para que otras partes del código sepan del cambio.
        window.dispatchEvent(new CustomEvent("languagechange", { detail: { language } }));
    }

    // Vincula el evento click de los botones de cambio de idioma.
    // Cada click cambia entre español e inglés.
    function bindLanguageButtons() {
        document.querySelectorAll("[data-language-toggle]").forEach((button) => {
            button.addEventListener("click", () => {
                // Alterna el idioma: si es español, cambia a inglés, y viceversa.
                setLanguage(currentLanguage === "es" ? "en" : "es");
            });
        });
    }

    // Objeto público que expone las funciones de traducción al resto de la aplicación.
    window.i18n = {
        // Función para traducir usando una clave.
        t: translate,
        // Función para traducir un valor literal.
        translateValue,
        // Función para traducir un elemento del DOM.
        translateElement: applyTranslations,
        // Propiedad que devuelve el idioma actual.
        get language() {
            return currentLanguage;
        },
        // Propiedad que devuelve la configuración regional del idioma actual.
        get locale() {
            return translations?.[currentLanguage]?.locale || "es-UY";
        }
    };

    // Promise que se resuelve cuando las traducciones se han cargado correctamente.
    // Se utiliza en otros scripts para esperar a que el sistema de traducción esté listo.
    window.i18nReady = fetch(TRANSLATIONS_URL)
        .then((response) => {
            // Verifica que la respuesta sea correcta (código 200).
            if (!response.ok) throw new Error("No se pudo cargar el archivo de traducciones.");
            // Parsea el JSON de traducciones.
            return response.json();
        })
        .then((data) => {
            // Almacena todas las traducciones cargadas.
            translations = data;
            // Si el idioma guardado no existe en las traducciones, usa el predeterminado.
            if (!translations[currentLanguage]) currentLanguage = DEFAULT_LANGUAGE;
            // Construye el mapa de valores para búsqueda rápida.
            buildValueKeys();
            // Aplica las traducciones a la página actual.
            applyTranslations();
            // Vincula los botones de cambio de idioma.
            bindLanguageButtons();
        })
        .catch((error) => {
            // Si hay un error, lo muestra en la consola.
            console.error("Error al cargar las traducciones:", error);
        });
})()
