const showAuthenticationFeedback = (message, messageClass) => {
    const feedback = document.getElementById("feedback");

    if (feedback) {
        feedback.textContent = message;
        feedback.className = `feedback-message ${messageClass}`;
    }
};

const showUrlFeedback = () => {
    const parameters = new URLSearchParams(window.location.search);

    if (parameters.has("error")) {
        showAuthenticationFeedback(parameters.get("error"), "error-message");
    } else if (parameters.has("success")) {
        showAuthenticationFeedback(parameters.get("success"), "success-message");
    }
};

const configureRegistrationValidation = () => {
    const registrationForm = document.getElementById("registration-form");

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
            showAuthenticationFeedback(getTranslatedMessage("usernameValidation", "El usuario debe tener al menos una letra y un número."), "error-message");
            return;
        }

        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password);

        if (!hasLowercase || !hasUppercase || !hasDigit || !hasSpecialCharacter) {
            event.preventDefault();
            showAuthenticationFeedback(getTranslatedMessage("passwordValidation", "La contraseña debe tener una minúscula, una mayúscula, un número y un carácter especial."), "error-message");
        }
    });

    registrationForm.dataset.validationConfigured = "true";
};

document.addEventListener("DOMContentLoaded", () => {
    showUrlFeedback();
    configureRegistrationValidation();
});

document.addEventListener("translationsUpdated", showUrlFeedback);
