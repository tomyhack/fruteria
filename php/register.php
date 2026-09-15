<?php
require_once "db_connect.php";

// Solo se procesan los datos enviados desde el formulario de registro.
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user = trim($_POST["username"]);
    $pass = $_POST["password"];

    // Se revisa primero si ya existe un usuario con el mismo nombre.
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        header("Location: ../html/register.html?error=" . urlencode("El usuario ya existe."));
        exit();
    }

    // La contraseña se cifra antes de guardarla en la base de datos.
    $hashedPassword = password_hash($pass, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $user, $hashedPassword);

    if ($stmt->execute()) {
        header("Location: ../html/login.html?success=" . urlencode("Registro realizado. Ya puedes iniciar sesión."));
        exit();
    }

    // Este mensaje aparece si ocurre otro error al guardar la cuenta.
    header("Location: ../html/register.html?error=" . urlencode("No se pudo crear la cuenta."));
    exit();
}

header("Location: ../html/register.html");
exit();
?>
