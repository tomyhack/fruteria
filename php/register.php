<?php
require_once "db_connect.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = htmlspecialchars($_POST["username"]);
    $pass = $_POST["password"];
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
