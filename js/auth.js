document.addEventListener("DOMContentLoaded", () => {
    const feedback = document.getElementById("feedback");
    const params = new URLSearchParams(window.location.search);

    if (params.has("error")) {
        feedback.textContent = params.get("error");
        feedback.className = "error";
    } else if (params.has("success")) {
        feedback.textContent = params.get("success");
        feedback.className = "success";
    }

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function(event) {
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            const hasLetter = /[a-zA-Z]/.test(username);
            const hasNumber = /[0-9]/.test(username);

            if (!hasLetter || !hasNumber) {
                event.preventDefault();
                feedback.textContent = "El usuario debe contener al menos una letra y un número.";
                feedback.className = "error";
                return;
            }

            const hasLowercase = /[a-z]/.test(password);
            const hasUppercase = /[A-Z]/.test(password);
            const hasDigit = /[0-9]/.test(password);
            const hasSpecialChar = /[!@#\$%\^&\*\(\)_\+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

            if (!hasLowercase || !hasUppercase || !hasDigit || !hasSpecialChar) {
                event.preventDefault();
                feedback.textContent = "La contraseña debe contener una minúscula, una mayúscula, un número y un carácter especial.";
                feedback.className = "error";
                return;
            }
        });
    }
});
