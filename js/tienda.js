// Stores the current user and the products shown in the cart.
const estadoTienda = {
    usuario: null,
    carrito: []
};

// Creates one page element and optionally gives it a class and visible text.
function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);

    if (clase) {
        elemento.className = clase;
    }

    elemento.textContent = texto || "";
    return elemento;
}

// Shows a success or error message near the cart content.
function mostrarConfirmacion(mensaje, esError) {
    const retroalimentacionCarrito = document.getElementById("retroalimentacion-carrito");

    if (retroalimentacionCarrito) {
        retroalimentacionCarrito.textContent = mensaje;
        retroalimentacionCarrito.className = "mensaje-confirmacion mensaje-confirmacion-visible";

        if (esError) {
            retroalimentacionCarrito.className += " mensaje-confirmacion-error";
        }
    }
}

// Asks PHP if the visitor has an active session.
async function obtenerSesion() {
    try {
        const respuesta = await fetch("../php/session.php", {
            credentials: "same-origin",
            cache: "no-store"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo consultar la sesión.");
        }

        return respuesta.json();
    } catch (error) {
        console.error(error);
        return { authenticated: false };
    }
}

// Updates the number beside the cart icon.
function actualizarContadorCarrito() {
    const contadorCarrito = document.getElementById("contador-carrito");

    if (contadorCarrito) {
        contadorCarrito.textContent = estadoTienda.carrito.length;
    }
}

// Shows profile links that match whether the visitor is signed in or not.
function actualizarInterfazCuenta() {
    const botonMenuPerfil = document.getElementById("boton-menu-perfil");
    const listaMenuPerfil = document.getElementById("lista-menu-perfil");

    if (!botonMenuPerfil || !listaMenuPerfil) {
        return;
    }

    if (estadoTienda.usuario) {
        botonMenuPerfil.textContent = "👤 " + estadoTienda.usuario.username;
        botonMenuPerfil.setAttribute("aria-label", obtenerMensajeTraducido("profile", "Perfil") + ": " + estadoTienda.usuario.username);
        const enlaceCerrarSesion = crearElemento("a", "", obtenerMensajeTraducido("logOut", "Cerrar sesión"));
        enlaceCerrarSesion.href = "../php/logout.php";
        listaMenuPerfil.textContent = "";
        listaMenuPerfil.appendChild(enlaceCerrarSesion);
        return;
    }

    botonMenuPerfil.textContent = "👤 " + obtenerMensajeTraducido("profile", "Perfil");
    botonMenuPerfil.setAttribute("aria-label", obtenerMensajeTraducido("profile", "Perfil"));
    const enlaceIniciarSesion = crearElemento("a", "", obtenerMensajeTraducido("logIn", "Iniciar sesión"));
    const enlaceRegistro = crearElemento("a", "", obtenerMensajeTraducido("signUp", "Registrarte"));
    enlaceIniciarSesion.href = "login.html";
    enlaceRegistro.href = "register.html";
    listaMenuPerfil.textContent = "";
    listaMenuPerfil.appendChild(enlaceIniciarSesion);
    listaMenuPerfil.appendChild(enlaceRegistro);
}

// Saves the session response so the page knows which account is active.
async function actualizarSesion() {
    const sesion = await obtenerSesion();

    if (sesion.authenticated) {
        estadoTienda.usuario = sesion;
    } else {
        estadoTienda.usuario = null;
    }

    actualizarInterfazCuenta();
}

// Sends every cart request to PHP and returns the saved cart information.
async function solicitarCarrito(ruta, metodo, producto) {
    const opciones = {
        method: metodo,
        credentials: "same-origin"
    };

    if (producto) {
        opciones.headers = { "Content-Type": "application/json" };
        opciones.body = JSON.stringify(producto);
    }

    const respuesta = await fetch("../php/cart.php" + ruta, opciones);

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        if (respuesta.status === 401) {
            estadoTienda.usuario = null;
            estadoTienda.carrito = [];
            actualizarInterfazCuenta();
        }

        throw new Error(datos.message || obtenerMensajeTraducido("cartSaveError", "No se pudo actualizar el carrito."));
    }

    return datos;
}

// Loads the saved cart for the signed-in user and refreshes the page.
async function cargarCarrito() {
    if (!estadoTienda.usuario) {
        estadoTienda.carrito = [];
        actualizarContadorCarrito();
        renderizarCarrito();
        return;
    }

    try {
        const datos = await solicitarCarrito("", "GET");
        estadoTienda.carrito = datos.items || [];
    } catch (error) {
        estadoTienda.carrito = [];
        mostrarConfirmacion(obtenerMensajeTraducido("cartLoadError", "No se pudo cargar el carrito."), true);
        console.error(error);
    }

    actualizarContadorCarrito();
    renderizarCarrito();
}

// Creates product cards from the list stored in the translation file.
function renderizarTarjetasProductos() {
    const cuadriculaProductos = document.getElementById("cuadricula-productos");
    const productos = obtenerDatosTraduccion("products", []);

    if (!cuadriculaProductos || !Array.isArray(productos)) {
        return;
    }

    cuadriculaProductos.textContent = "";

    for (let indice = 0; indice < productos.length; indice++) {
        const producto = productos[indice];
        const tarjeta = crearElemento("article", "tarjeta-producto");
        const imagen = document.createElement("img");
        imagen.className = "imagen-producto";
        imagen.src = producto.image;
        imagen.alt = producto.name;

        const contenido = crearElemento("div", "contenido-producto");
        const nombre = crearElemento("h2", "", producto.name);
        const pie = crearElemento("div", "pie-producto");
        const precio = crearElemento("span", "precio-producto", "$" + producto.price + " " + producto.unit);
        const botonAgregar = crearElemento("button", "boton-principal boton-agregar-producto", obtenerMensajeTraducido("addProduct", "Agregar"));
        botonAgregar.type = "button";
        botonAgregar.setAttribute("data-name", producto.name);
        botonAgregar.setAttribute("data-price", producto.price);
        botonAgregar.addEventListener("click", function () {
            agregarProductoAlCarrito(botonAgregar);
        });

        pie.appendChild(precio);
        pie.appendChild(botonAgregar);
        contenido.appendChild(nombre);
        contenido.appendChild(pie);
        tarjeta.appendChild(imagen);
        tarjeta.appendChild(contenido);
        cuadriculaProductos.appendChild(tarjeta);
    }
}

// Shows a message and a link when the visitor has no cart products to display.
function mostrarCarritoVacio(listaCarrito, mensajeTexto, ruta, textoEnlace) {
    const contenedor = crearElemento("div", "carrito-vacio");
    const mensaje = crearElemento("p", "", mensajeTexto);
    const enlace = crearElemento("a", "boton-principal", textoEnlace);
    enlace.href = ruta;

    contenedor.appendChild(mensaje);
    contenedor.appendChild(enlace);
    listaCarrito.textContent = "";
    listaCarrito.appendChild(contenedor);
}

// Draws the current cart, its total, or the right empty-state message.
function renderizarCarrito() {
    const listaCarrito = document.getElementById("lista-carrito");
    const resumenCarrito = document.getElementById("resumen-carrito");
    const totalCarrito = document.getElementById("total-carrito");

    if (!listaCarrito || !resumenCarrito || !totalCarrito) {
        return;
    }

    if (!estadoTienda.usuario) {
        mostrarCarritoVacio(
            listaCarrito,
            obtenerMensajeTraducido("loginRequired", "Primero tienes que iniciar sesión."),
            "login.html",
            obtenerMensajeTraducido("logIn", "Iniciar sesión")
        );
        resumenCarrito.style.display = "none";
        return;
    }

    if (estadoTienda.carrito.length === 0) {
        mostrarCarritoVacio(
            listaCarrito,
            obtenerMensajeTraducido("emptyCart", "El carrito está vacío."),
            "store.html",
            obtenerMensajeTraducido("goToStore", "Ir a la tienda")
        );
        resumenCarrito.style.display = "none";
        return;
    }

    let total = 0;
    listaCarrito.textContent = "";

    for (let indice = 0; indice < estadoTienda.carrito.length; indice++) {
        const producto = estadoTienda.carrito[indice];
        total = total + Number(producto.price);
        const articulo = crearElemento("article", "producto-carrito");
        const datosProducto = crearElemento("div");
        const nombre = crearElemento("h2", "", producto.name);
        const precio = crearElemento("p", "", obtenerMensajeTraducido("price", "Precio") + ": $" + producto.price);
        const botonQuitar = crearElemento("button", "boton-principal boton-quitar-producto", obtenerMensajeTraducido("removeProduct", "Quitar"));
        botonQuitar.type = "button";
        botonQuitar.setAttribute("data-cart-id", producto.id);
        botonQuitar.addEventListener("click", function () {
            quitarProductoDelCarrito(botonQuitar);
        });

        datosProducto.appendChild(nombre);
        datosProducto.appendChild(precio);
        articulo.appendChild(datosProducto);
        articulo.appendChild(botonQuitar);
        listaCarrito.appendChild(articulo);
    }

    totalCarrito.textContent = total.toFixed(2);
    resumenCarrito.style.display = "block";
}

// Sends the selected product to PHP and refreshes the saved cart.
async function agregarProductoAlCarrito(boton) {
    if (!estadoTienda.usuario) {
        mostrarConfirmacion(obtenerMensajeTraducido("loginRequired", "Primero tienes que iniciar sesión."), true);
        return;
    }

    // Keeps these keys in English because cart.php expects this exact JSON format.
    const producto = {
        name: boton.getAttribute("data-name"),
        price: boton.getAttribute("data-price")
    };

    boton.disabled = true;

    try {
        const datos = await solicitarCarrito("", "POST", producto);
        estadoTienda.carrito = datos.items || [];
        actualizarContadorCarrito();
        mostrarConfirmacion(producto.name + " " + obtenerMensajeTraducido("addedToCart", "fue agregado al carrito."));
    } catch (error) {
        mostrarConfirmacion(error.message, true);
        console.error(error);
    } finally {
        boton.disabled = false;
    }
}

// Removes one saved product and then redraws the cart.
async function quitarProductoDelCarrito(boton) {
    const idProducto = boton.getAttribute("data-cart-id");
    boton.disabled = true;

    try {
        const datos = await solicitarCarrito("?id=" + encodeURIComponent(idProducto), "DELETE");
        estadoTienda.carrito = datos.items || [];
        actualizarContadorCarrito();
        renderizarCarrito();
    } catch (error) {
        mostrarConfirmacion(error.message, true);
        console.error(error);
    } finally {
        boton.disabled = false;
    }
}

// Clears the saved cart after the visitor chooses to buy everything.
async function completarCompra() {
    if (!estadoTienda.usuario) {
        mostrarConfirmacion(obtenerMensajeTraducido("loginRequired", "Primero tienes que iniciar sesión."), true);
        return;
    }

    try {
        const datos = await solicitarCarrito("", "POST", { action: "clear" });
        estadoTienda.carrito = datos.items || [];
        actualizarContadorCarrito();
        renderizarCarrito();
        mostrarConfirmacion(obtenerMensajeTraducido("purchaseCompleted", "Gracias por tu compra."));
    } catch (error) {
        mostrarConfirmacion(error.message, true);
        console.error(error);
    }
}

// Opens or closes the profile menu when its button is pressed.
function alternarMenuPerfil() {
    const botonMenuPerfil = document.getElementById("boton-menu-perfil");
    const listaMenuPerfil = document.getElementById("lista-menu-perfil");

    if (!botonMenuPerfil || !listaMenuPerfil) {
        return;
    }

    if (listaMenuPerfil.classList.contains("menu-perfil-visible")) {
        listaMenuPerfil.classList.remove("menu-perfil-visible");
        botonMenuPerfil.setAttribute("aria-expanded", "false");
    } else {
        listaMenuPerfil.classList.add("menu-perfil-visible");
        botonMenuPerfil.setAttribute("aria-expanded", "true");
    }
}

// Closes the profile menu when the click happens outside it.
function cerrarMenuPerfil() {
    const botonMenuPerfil = document.getElementById("boton-menu-perfil");
    const listaMenuPerfil = document.getElementById("lista-menu-perfil");

    if (botonMenuPerfil && listaMenuPerfil) {
        listaMenuPerfil.classList.remove("menu-perfil-visible");
        botonMenuPerfil.setAttribute("aria-expanded", "false");
    }
}

// Starts products, account information, and cart data in the right order.
async function inicializarTienda() {
    renderizarTarjetasProductos();
    await actualizarSesion();
    await cargarCarrito();
}

// Connects the fixed page buttons after their HTML is ready.
document.addEventListener("DOMContentLoaded", function () {
    const botonComprar = document.getElementById("boton-comprar");
    const botonMenuPerfil = document.getElementById("boton-menu-perfil");

    if (botonComprar) {
        botonComprar.addEventListener("click", completarCompra);
    }

    if (botonMenuPerfil) {
        botonMenuPerfil.addEventListener("click", alternarMenuPerfil);

        document.addEventListener("click", function (evento) {
            const listaMenuPerfil = document.getElementById("lista-menu-perfil");

            if (listaMenuPerfil && !botonMenuPerfil.contains(evento.target) && !listaMenuPerfil.contains(evento.target)) {
                cerrarMenuPerfil();
            }
        });
    }

    inicializarTienda();
});

// Redraws the store after the language file updates the page text.
document.addEventListener("translationsUpdated", inicializarTienda);
