// Espera a que la traducción esté lista y luego procesa mensajes del servidor.
document.addEventListener("DOMContentLoaded", function () {
    window.i18nReady.then(function () {
        var feedback = document.getElementById("feedback");
        var params = new URLSearchParams(window.location.search);

        function translateMessage(message) {
            if (message && message.startsWith("messages.")) {
                return window.i18n.t(message);
            }
            return window.i18n.translateValue(message);
        }

        if (params.has("error")) {
            feedback.textContent = translateMessage(params.get("error"));
            feedback.className = "message error";
        } else if (params.has("success")) {
            feedback.textContent = translateMessage(params.get("success"));
            feedback.className = "message success";
        }

        var registerForm = document.getElementById("registerForm");

        if (registerForm) {
            registerForm.addEventListener("submit", function (event) {
                var password = document.getElementById("password").value;

                if (password.length < 8 || password.length > 16) {
                    event.preventDefault();
                    feedback.textContent = window.i18n.t("messages.passwordLength");
                    feedback.className = "message error";
                }
            });
        }
    });
});
