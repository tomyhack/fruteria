// Se ejecuta cuando el DOM está completamente cargado.
document.addEventListener("DOMContentLoaded", function () {
    // Espera a que las traducciones se carguen antes de ejecutar el código.
    window.i18nReady.then(function () {
        // Obtiene el elemento donde se mostrarán los mensajes de error o éxito.
        var feedback = document.getElementById("feedback");
        // Lee los mensajes que envía PHP en la URL después de registrar o iniciar sesión.
        var params = new URLSearchParams(window.location.search);

        // Traduce un mensaje. Si comienza con "messages.", busca la traducción.
        // Si no, busca el valor directo en los idiomas.
        function translateMessage(message) {
            if (message && message.startsWith("messages.")) {
                // Obtiene la traducción usando la clave (ej: "messages.invalidCredentials").
                return window.i18n.t(message);
            }
            // Para valores literales, busca en el archivo de traducciones.
            return window.i18n.translateValue(message);
        }

        // Si hay un error en la URL, lo muestra en rojo.
        if (params.has("error")) {
            feedback.textContent = translateMessage(params.get("error"));
            feedback.className = "message error";
        } 
        // Si hay un mensaje de éxito, lo muestra en verde.
        else if (params.has("success")) {
            feedback.textContent = translateMessage(params.get("success"));
            feedback.className = "message success";
        }

        // Obtiene el formulario de registro si existe en esta página.
        var registerForm = document.getElementById("registerForm");

        // Solo agrega validación si el formulario de registro está presente.
        if (registerForm) {
            // Al enviar el formulario, valida la contraseña.
            registerForm.addEventListener("submit", function (event) {
                // Obtiene la contraseña ingresada por el usuario.
                var password = document.getElementById("password").value;

                // Valida que la contraseña tenga entre 8 y 16 caracteres.
                // Esta validación avisa antes de enviar el formulario.
                // PHP repite la regla para que no se pueda saltar desde el navegador.
                if (password.length < 8 || password.length > 16) {
                    // Cancela el envío del formulario si la contraseña no es válida.
                    event.preventDefault();
                    // Muestra el mensaje de error traducido.
                    feedback.textContent = window.i18n.t("messages.passwordLength");
                    feedback.className = "message error";
                }
            });
        }
    });
});
