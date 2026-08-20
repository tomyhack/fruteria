<?php
// Carga la conexión para guardar el nuevo usuario.
require_once "db_connect.php";

// Solo permite que esta página reciba datos enviados por el formulario.
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = htmlspecialchars($_POST["username"]);
    $pass = $_POST["password"];

    // Se repite la regla de JavaScript para que siempre se cumpla en el servidor.
    if (strlen($pass) < 8 || strlen($pass) > 16) {
        header("Location: ../html/register.html?error=La contraseña debe tener entre 8 y 16 caracteres");
        exit();
    }

    // No se guarda la contraseña original; se guarda una versión cifrada.
    $hashed_password = password_hash($pass, PASSWORD_BCRYPT);

    // Los signos ? reservan los datos y evitan escribirlos directamente en SQL.
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $user, $hashed_password);

    if ($stmt->execute()) {
        // Vuelve al login mostrando el mensaje de éxito.
        header("Location: ../html/login.html?success=Registro realizado. Ya puedes iniciar sesión.");
        exit();
    }

    header("Location: ../html/register.html?error=No se pudo registrar el usuario.");
    exit();
}
?>
