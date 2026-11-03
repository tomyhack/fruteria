// Shows a clear success or error message below the authentication form.
const mostrarMensajeFormulario = (mensaje, claseMensaje) => {
    const mensajeFormulario = document.getElementById("mensaje-formulario");
    mensajeFormulario.textContent = mensaje;
    mensajeFormulario.className = `mensaje-formulario ${claseMensaje}`;
};

// Reads messages added to the URL by the PHP login and registration files.
const mostrarMensajesUrl = () => {
    const parametros = new URLSearchParams(window.location.search);

    if (parametros.has("error")) {
        mostrarMensajeFormulario(parametros.get("error"), "mensaje-error");
    } else if (parametros.has("exito")) {
        mostrarMensajeFormulario(parametros.get("exito"), "mensaje-exito");
    }
};

// Switches the password field between hidden and visible text.
const actualizarBotonContrasena = () => {
    const campoContrasena = document.getElementById("contrasena");
    const boton = document.getElementById("boton-mostrar-contrasena");

    if (campoContrasena.type === "text") {
        boton.textContent = obtenerMensajeTraducido("ocultarContrasena");
    } else {
        boton.textContent = obtenerMensajeTraducido("mostrarContrasena");
    }
};

// Switches the password field between hidden and visible text.
const alternarVisibilidadContrasena = () => {
    const campoContrasena = document.getElementById("contrasena");

    if (campoContrasena.type === "password") {
        campoContrasena.type = "text";
    } else {
        campoContrasena.type = "password";
    }
    actualizarBotonContrasena();
};

// Connects the password button after the HTML is ready.
document.addEventListener("DOMContentLoaded", () => {
    const botonMostrarContrasena = document.getElementById("boton-mostrar-contrasena");
    botonMostrarContrasena.addEventListener("click", alternarVisibilidadContrasena);
});

// Shows the same feedback again after the page text changes language.
document.addEventListener("traduccionesActualizadas", () => {
    mostrarMensajesUrl();
    actualizarBotonContrasena();
});
