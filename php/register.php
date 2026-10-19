<?php
require_once "db_connect.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user = trim($_POST["username"]);
    $email = trim($_POST["email"]);
    $pass = $_POST["password"];

    if ($user === "" || $pass === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: ../html/register.html?error=" . urlencode("Completa los datos correctamente."));
        exit();
    }

    $stmt = $conn->prepare(
        "SELECT id FROM usuarios
         WHERE nombre_usuario = ? OR correo_electronico = ?"
    );
    $stmt->bind_param("ss", $user, $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        header("Location: ../html/register.html?error=" . urlencode("El usuario o el correo ya existe."));
        exit();
    }

    $claveCifrada = password_hash($pass, PASSWORD_BCRYPT);
    $stmt = $conn->prepare(
        "INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena)
         VALUES (?, ?, ?)"
    );
    $stmt->bind_param("sss", $user, $email, $claveCifrada);

    if (!$stmt->execute()) {
        header("Location: ../html/register.html?error=" . urlencode("No se pudo crear la cuenta."));
        exit();
    }

    header("Location: ../html/login.html?success=" . urlencode("Cuenta creada. Ya puedes iniciar sesión."));
    exit();
}

header("Location: ../html/register.html");
exit();
?>
