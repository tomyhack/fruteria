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

// Checks the registration fields before the form is sent to PHP.
const configurarValidacionRegistro = () => {
    const formularioRegistro = document.getElementById("formulario-registro");

    if (!formularioRegistro) {
        return;
    }

    formularioRegistro.addEventListener("submit", (evento) => {
        const nombreUsuario = document.getElementById("usuario").value;
        const contrasena = document.getElementById("contrasena").value;
        const tieneSoloLetrasYNumeros = /^[a-zA-Z0-9]+$/.test(nombreUsuario);
        const tieneLetra = /[a-zA-Z]/.test(nombreUsuario);
        const tieneNumero = /[0-9]/.test(nombreUsuario);
        const longitudUsuarioValida = nombreUsuario.length >= 6 && nombreUsuario.length <= 12;

        if (!tieneSoloLetrasYNumeros || !tieneLetra || !tieneNumero || !longitudUsuarioValida) {
            evento.preventDefault();
            mostrarMensajeFormulario(obtenerMensajeTraducido("errorUsuario"), "mensaje-error");
            return;
        }

        const longitudContrasenaValida = contrasena.length >= 6 && contrasena.length <= 12;
        const tieneMinuscula = /[a-z]/.test(contrasena);
        const tieneMayuscula = /[A-Z]/.test(contrasena);
        const tieneDigito = /[0-9]/.test(contrasena);
        const tieneCaracterEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(contrasena);

        if (!longitudContrasenaValida || !tieneMinuscula || !tieneMayuscula || !tieneDigito || !tieneCaracterEspecial) {
            evento.preventDefault();
            mostrarMensajeFormulario(obtenerMensajeTraducido("errorContrasena"), "mensaje-error");
        }
    });
};

// Switches the password field between hidden and visible text.
const actualizarBotonContrasena = () => {
    const campoContrasena = document.getElementById("contrasena");
    const boton = document.getElementById("boton-mostrar-contrasena");

    if (campoContrasena.type === "text") {
        boton.textContent = obtenerMensajeTraducido("ocultarContrasena");
        boton.setAttribute("aria-pressed", "true");
    } else {
        boton.textContent = obtenerMensajeTraducido("mostrarContrasena");
        boton.setAttribute("aria-pressed", "false");
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

// Starts the authentication page after its HTML and translations are ready.
document.addEventListener("DOMContentLoaded", async () => {
    await traduccionesCargadas;
    configurarValidacionRegistro();

    const botonMostrarContrasena = document.getElementById("boton-mostrar-contrasena");
    botonMostrarContrasena.addEventListener("click", alternarVisibilidadContrasena);
});

// Shows the same feedback again after the page text changes language.
document.addEventListener("traduccionesActualizadas", () => {
    mostrarMensajesUrl();
    actualizarBotonContrasena();
});
