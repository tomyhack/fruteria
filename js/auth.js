document.addEventListener("DOMContentLoaded", function () {
    var feedback = document.getElementById("feedback");
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
            var username = document.getElementById("username").value;
            var password = document.getElementById("password").value;
            var hasLetter = /[a-zA-Z]/.test(username);
            var hasNumber = /[0-9]/.test(username);
            var hasLowercase = /[a-z]/.test(password);
            var hasUppercase = /[A-Z]/.test(password);
            var hasDigit = /[0-9]/.test(password);
            var hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password);

            if (!hasLetter || !hasNumber) {
                event.preventDefault();
                feedback.textContent = "El usuario debe tener una letra y un número.";
                feedback.className = "message error";
                return;
            }

            if (!hasLowercase || !hasUppercase || !hasDigit || !hasSpecialChar) {
                event.preventDefault();
                feedback.textContent = "La contraseña debe tener mayúscula, minúscula, número y símbolo.";
                feedback.className = "message error";
            }
        });
    }
});
