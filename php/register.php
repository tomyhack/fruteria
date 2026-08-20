<?php
require_once "db_connect.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = htmlspecialchars($_POST["username"]);
    $pass = $_POST["password"];

    if (strlen($pass) < 8 || strlen($pass) > 16) {
        header("Location: ../html/register.html?error=La contraseña debe tener entre 8 y 16 caracteres");
        exit();
    }

    $hashed_password = password_hash($pass, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $user, $hashed_password);

    if ($stmt->execute()) {
        header("Location: ../html/login.html?success=Registro realizado. Ya puedes iniciar sesión.");
        exit();
    }

    header("Location: ../html/register.html?error=No se pudo registrar el usuario.");
    exit();
}
?>
