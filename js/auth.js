document.addEventListener("DOMContentLoaded", function () {
    var feedback = document.getElementById("feedback");
    // Lee los mensajes que envía PHP en la URL después de registrar o iniciar sesión.
    var params = new URLSearchParams(window.location.search);

    if (params.has("error")) {
        feedback.textContent = params.get("error");
        feedback.className = "message error";
    } else if (params.has("success")) {
        feedback.textContent = params.get("success");
        feedback.className = "message success";
    }

    var registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            var password = document.getElementById("password").value;

            // Esta validación avisa antes de enviar el formulario.
            // PHP repite la regla para que no se pueda saltar desde el navegador.
            if (password.length < 8 || password.length > 16) {
                event.preventDefault();
                feedback.textContent = "La contraseña debe tener entre 8 y 16 caracteres.";
                feedback.className = "message error";
            }
        });
    }
});
