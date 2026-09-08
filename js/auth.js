// Este elemento muestra los avisos enviados desde los archivos PHP.
var feedback;

// Busca el texto del mensaje en el idioma actual.
function obtenerMensaje(code) {
    if (translations[currentLang] && translations[currentLang].messages[code]) {
        return translations[currentLang].messages[code];
    }

    return "Ocurrió un problema. Inténtalo nuevamente.";
}

// Muestra un error o una confirmación que llega en la dirección de la página.
function mostrarMensaje() {
    if (!feedback) {
        return;
    }

    var params = new URLSearchParams(window.location.search);

    if (params.has("error")) {
        feedback.textContent = obtenerMensaje(params.get("error"));
        feedback.className = "message error";
    }

    if (params.has("success")) {
        feedback.textContent = obtenerMensaje(params.get("success"));
        feedback.className = "message success";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    feedback = document.getElementById("feedback");
    mostrarMensaje();

    var registerForm = document.getElementById("registerForm");

    // Comprueba la longitud antes de enviar el formulario de registro.
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            var password = document.getElementById("password").value;

            if (password.length < 8 || password.length > 16) {
                event.preventDefault();
                feedback.textContent = obtenerMensaje("contrasena_longitud");
                feedback.className = "message error";
            }
        });
    }
});
