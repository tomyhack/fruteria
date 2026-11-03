// Stores the current user and the products shown in the cart.
let catalogoProductos = {};

async function cargarProductos() {
    const respuesta = await fetch("../json/productos.json");
    catalogoProductos = await respuesta.json();
}

const productosCargados = cargarProductos();

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
function mostrarMensajeCarrito(mensaje, esError) {
    const mensajeCarrito = document.getElementById("mensaje-carrito");

    if (mensajeCarrito) {
        mensajeCarrito.textContent = mensaje;
        mensajeCarrito.className = "aviso-carrito aviso-visible";

        if (esError) {
            mensajeCarrito.className += " aviso-error";
        }
    }
}

// Asks PHP if the visitor has an active session.
async function obtenerSesion() {
    const respuesta = await fetch("../php/session.php", {
        cache: "no-store"
    });

    return respuesta.json();
}

// Updates the number beside the cart icon.
function actualizarContadorCarrito() {
    const contadorCarrito = document.getElementById("contador-carrito");
    contadorCarrito.textContent = estadoTienda.carrito.length;
}

// Shows profile links that match whether the visitor is signed in or not.
function actualizarInterfazCuenta() {
    const botonMenuPerfil = document.getElementById("boton-menu-perfil");
    const listaMenuPerfil = document.getElementById("lista-menu-perfil");

    if (estadoTienda.usuario) {
        botonMenuPerfil.textContent = "👤 " + estadoTienda.usuario.usuario;
        const enlaceCerrarSesion = crearElemento("a", "", obtenerMensajeTraducido("cerrarSesion"));
        enlaceCerrarSesion.href = "../php/logout.php";
        listaMenuPerfil.textContent = "";
        listaMenuPerfil.appendChild(enlaceCerrarSesion);
        return;
    }

    botonMenuPerfil.textContent = "👤 " + obtenerDatosTraduccion("perfil");
    const enlaceIniciarSesion = crearElemento("a", "", obtenerMensajeTraducido("iniciarSesion"));
    const enlaceRegistro = crearElemento("a", "", obtenerMensajeTraducido("registrarse"));
    enlaceIniciarSesion.href = "login.html";
    enlaceRegistro.href = "register.html";
    listaMenuPerfil.textContent = "";
    listaMenuPerfil.appendChild(enlaceIniciarSesion);
    listaMenuPerfil.appendChild(enlaceRegistro);
}

// Saves the session response so the page knows which account is active.
async function actualizarSesion() {
    const sesion = await obtenerSesion();

    if (sesion.autenticado) {
        estadoTienda.usuario = sesion;
    } else {
        estadoTienda.usuario = null;
    }

    actualizarInterfazCuenta();
}

// Sends every cart request to PHP and returns the saved cart information.
async function solicitarCarrito(ruta, metodo, producto) {
    const opciones = {
        method: metodo
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

        throw new Error(datos.mensaje);
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
        estadoTienda.carrito = datos.productos;
    } catch (error) {
        estadoTienda.carrito = [];
        mostrarMensajeCarrito(obtenerMensajeTraducido("errorCargarCarrito"), true);
        console.error(error);
    }

    actualizarContadorCarrito();
    renderizarCarrito();
}

// Creates product cards from the product catalog.
function renderizarTarjetasProductos() {
    const cuadriculaProductos = document.getElementById("cuadricula-productos");
    const listaProductos = catalogoProductos[idiomaActual];

    if (!cuadriculaProductos) {
        return;
    }

    cuadriculaProductos.textContent = "";

    for (let indice = 0; indice < listaProductos.length; indice++) {
        const producto = listaProductos[indice];
        const tarjeta = crearElemento("article", "tarjeta-producto");
        const imagen = document.createElement("img");
        imagen.className = "imagen-producto";
        imagen.src = producto.imagen;

        const contenido = crearElemento("div", "contenido-producto");
        const nombre = crearElemento("h2", "", producto.nombre);
        const pie = crearElemento("div", "pie-producto");
        const precio = crearElemento("span", "precio-producto", "$" + producto.precio + " " + producto.unidad);
        const botonAgregar = crearElemento("button", "boton-principal boton-agregar-producto", obtenerMensajeTraducido("agregar"));
        botonAgregar.type = "button";
        botonAgregar.setAttribute("data-nombre", producto.nombre);
        botonAgregar.setAttribute("data-precio", producto.precio);
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
            obtenerMensajeTraducido("requiereInicioSesion"),
            "login.html",
            obtenerMensajeTraducido("iniciarSesion")
        );
        resumenCarrito.style.display = "none";
        return;
    }

    if (estadoTienda.carrito.length === 0) {
        mostrarCarritoVacio(
            listaCarrito,
            obtenerMensajeTraducido("carritoVacio"),
            "store.html",
            obtenerMensajeTraducido("irATienda")
        );
        resumenCarrito.style.display = "none";
        return;
    }

    let total = 0;
    listaCarrito.textContent = "";

    for (let indice = 0; indice < estadoTienda.carrito.length; indice++) {
        const producto = estadoTienda.carrito[indice];
        total = total + Number(producto.precio);
        const articulo = crearElemento("article", "producto-carrito");
        const datosProducto = crearElemento("div");
        const nombre = crearElemento("h2", "", producto.nombre);
        const precio = crearElemento("p", "", obtenerMensajeTraducido("precio") + ": $" + producto.precio);
        const botonQuitar = crearElemento("button", "boton-principal boton-quitar-producto", obtenerMensajeTraducido("quitar"));
        botonQuitar.type = "button";
        botonQuitar.setAttribute("data-id-producto", producto.id);
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
        mostrarMensajeCarrito(obtenerMensajeTraducido("requiereInicioSesion"), true);
        return;
    }

    // Sends these Spanish keys in the JSON format expected by cart.php.
    const producto = {
        nombre: boton.getAttribute("data-nombre"),
        precio: boton.getAttribute("data-precio")
    };

    boton.disabled = true;

    try {
        const datos = await solicitarCarrito("", "POST", producto);
        estadoTienda.carrito = datos.productos;
        actualizarContadorCarrito();
        mostrarMensajeCarrito(producto.nombre + " " + obtenerMensajeTraducido("agregadoAlCarrito"));
    } catch (error) {
        mostrarMensajeCarrito(error.message, true);
    } finally {
        boton.disabled = false;
    }
}

// Removes one saved product and then redraws the cart.
async function quitarProductoDelCarrito(boton) {
    const idProducto = boton.getAttribute("data-id-producto");
    boton.disabled = true;

    try {
        const datos = await solicitarCarrito("?id_producto=" + encodeURIComponent(idProducto), "DELETE");
        estadoTienda.carrito = datos.productos;
        actualizarContadorCarrito();
        renderizarCarrito();
    } catch (error) {
        mostrarMensajeCarrito(error.message, true);
    } finally {
        boton.disabled = false;
    }
}

// Clears the saved cart after the visitor chooses to buy everything.
async function completarCompra() {
    if (!estadoTienda.usuario) {
        mostrarMensajeCarrito(obtenerMensajeTraducido("requiereInicioSesion"), true);
        return;
    }

    try {
        const datos = await solicitarCarrito("", "POST", { accion: "vaciar" });
        estadoTienda.carrito = datos.productos;
        actualizarContadorCarrito();
        renderizarCarrito();
        mostrarMensajeCarrito(obtenerMensajeTraducido("compraCompletada"));
    } catch (error) {
        mostrarMensajeCarrito(error.message, true);
    }
}

// Opens or closes the profile menu when its button is pressed.
function alternarMenuPerfil() {
    const listaMenuPerfil = document.getElementById("lista-menu-perfil");

    if (listaMenuPerfil.classList.contains("menu-perfil-visible")) {
        listaMenuPerfil.classList.remove("menu-perfil-visible");
    } else {
        listaMenuPerfil.classList.add("menu-perfil-visible");
    }
}

// Closes the profile menu when the click happens outside it.
function cerrarMenuPerfil() {
    const listaMenuPerfil = document.getElementById("lista-menu-perfil");

    listaMenuPerfil.classList.remove("menu-perfil-visible");
}

// Starts products, account information, and cart data in the right order.
async function inicializarTienda() {
    await traduccionesCargadas;
    await productosCargados;
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

    botonMenuPerfil.addEventListener("click", alternarMenuPerfil);

    document.addEventListener("click", function (evento) {
        const listaMenuPerfil = document.getElementById("lista-menu-perfil");

        if (!botonMenuPerfil.contains(evento.target) && !listaMenuPerfil.contains(evento.target)) {
            cerrarMenuPerfil();
        }
    });

    inicializarTienda();
});

// Redraws translated content without reloading the session or cart.
document.addEventListener("traduccionesActualizadas", async function () {
    await productosCargados;
    renderizarTarjetasProductos();
    actualizarInterfazCuenta();
    renderizarCarrito();
});
