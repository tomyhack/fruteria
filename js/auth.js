// Shows a clear success or error message below the authentication form.
const mostrarRetroalimentacionAutenticacion = (mensaje, claseMensaje) => {
    const retroalimentacion = document.getElementById("retroalimentacion");

    if (retroalimentacion) {
        retroalimentacion.textContent = mensaje;
        retroalimentacion.className = `mensaje-retroalimentacion ${claseMensaje}`;
    }
};

// Reads messages added to the URL by the PHP login and registration files.
const mostrarRetroalimentacionUrl = () => {
    const parametros = new URLSearchParams(window.location.search);

    if (parametros.has("error")) {
        mostrarRetroalimentacionAutenticacion(parametros.get("error"), "mensaje-error");
    } else if (parametros.has("success")) {
        mostrarRetroalimentacionAutenticacion(parametros.get("success"), "mensaje-exito");
    }
};

// Checks the registration fields before the form is sent to PHP.
const configurarValidacionRegistro = () => {
    const formularioRegistro = document.getElementById("formulario-registro");

    if (!formularioRegistro) {
        return;
    }

    formularioRegistro.addEventListener("submit", (evento) => {
        const nombreUsuario = document.getElementById("username").value;
        const contrasena = document.getElementById("password").value;
        const tieneSoloLetrasYNumeros = /^[a-zA-Z0-9]+$/.test(nombreUsuario);
        const tieneLetra = /[a-zA-Z]/.test(nombreUsuario);
        const tieneNumero = /[0-9]/.test(nombreUsuario);
        const longitudUsuarioValida = nombreUsuario.length >= 6 && nombreUsuario.length <= 12;

        if (!tieneSoloLetrasYNumeros || !tieneLetra || !tieneNumero || !longitudUsuarioValida) {
            evento.preventDefault();
            mostrarRetroalimentacionAutenticacion(obtenerMensajeTraducido("usernameValidation", "El usuario debe tener entre 6 y 12 caracteres, usar solo letras y números, e incluir al menos una letra y un número."), "mensaje-error");
            return;
        }

        const longitudContrasenaValida = contrasena.length >= 6 && contrasena.length <= 12;
        const tieneMinuscula = /[a-z]/.test(contrasena);
        const tieneMayuscula = /[A-Z]/.test(contrasena);
        const tieneDigito = /[0-9]/.test(contrasena);
        const tieneCaracterEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(contrasena);

        if (!longitudContrasenaValida || !tieneMinuscula || !tieneMayuscula || !tieneDigito || !tieneCaracterEspecial) {
            evento.preventDefault();
            mostrarRetroalimentacionAutenticacion(obtenerMensajeTraducido("passwordValidation", "La contraseña debe tener entre 6 y 12 caracteres, una minúscula, una mayúscula, un número y un carácter especial."), "mensaje-error");
        }
    });
};

// Switches the password field between hidden and visible text.
const actualizarBotonContrasena = () => {
    const campoContrasena = document.getElementById("password");
    const boton = document.getElementById("boton-mostrar-contrasena");

    if (!campoContrasena || !boton) {
        return;
    }

    if (campoContrasena.type === "text") {
        boton.textContent = obtenerMensajeTraducido("hidePassword", "Ocultar contraseña");
        boton.setAttribute("aria-pressed", "true");
    } else {
        boton.textContent = obtenerMensajeTraducido("showPassword", "Mostrar contraseña");
        boton.setAttribute("aria-pressed", "false");
    }
};

// Switches the password field between hidden and visible text.
const alternarVisibilidadContrasena = () => {
    const campoContrasena = document.getElementById("password");

    if (!campoContrasena) {
        return;
    }

    if (campoContrasena.type === "password") {
        campoContrasena.type = "text";
    } else {
        campoContrasena.type = "password";
    }
    actualizarBotonContrasena();
};

// Starts the authentication page after its HTML is ready.
document.addEventListener("DOMContentLoaded", () => {
    mostrarRetroalimentacionUrl();
    configurarValidacionRegistro();
    actualizarBotonContrasena();

    const botonMostrarContrasena = document.getElementById("boton-mostrar-contrasena");

    if (botonMostrarContrasena) {
        botonMostrarContrasena.addEventListener("click", alternarVisibilidadContrasena);
    }
});

// Shows the same feedback again after the page text changes language.
document.addEventListener("translationsUpdated", () => {
    mostrarRetroalimentacionUrl();
    actualizarBotonContrasena();
});
