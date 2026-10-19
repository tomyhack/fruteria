const showAuthenticationFeedback = (message, messageClass) => {
    const feedback = document.getElementById("retroalimentacion");

    if (feedback) {
        feedback.textContent = message;
        feedback.className = `mensaje-retroalimentacion ${messageClass}`;
    }
};

const showUrlFeedback = () => {
    const parameters = new URLSearchParams(window.location.search);

    if (parameters.has("error")) {
        showAuthenticationFeedback(parameters.get("error"), "mensaje-error");
    } else if (parameters.has("success")) {
        showAuthenticationFeedback(parameters.get("success"), "mensaje-exito");
    }
};

const configureRegistrationValidation = () => {
    const registrationForm = document.getElementById("formulario-registro");

    if (!registrationForm || registrationForm.dataset.validationConfigured === "true") {
        return;
    }

    registrationForm.addEventListener("submit", (event) => {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const hasLetter = /[a-zA-Z]/.test(username);
        const hasNumber = /[0-9]/.test(username);

        if (!hasLetter || !hasNumber) {
            event.preventDefault();
            showAuthenticationFeedback(getTranslatedMessage("usernameValidation", "El usuario debe tener al menos una letra y un número."), "mensaje-error");
            return;
        }

        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password);

        if (!hasLowercase || !hasUppercase || !hasDigit || !hasSpecialCharacter) {
            event.preventDefault();
            showAuthenticationFeedback(getTranslatedMessage("passwordValidation", "La contraseña debe tener una minúscula, una mayúscula, un número y un carácter especial."), "mensaje-error");
        }
    });

    registrationForm.dataset.validationConfigured = "true";
};

document.addEventListener("DOMContentLoaded", () => {
    showUrlFeedback();
    configureRegistrationValidation();
});

document.addEventListener("translationsUpdated", showUrlFeedback);
