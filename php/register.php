<?php
require_once "db_connect.php";

// Solo se procesan los datos enviados desde el formulario de registro.
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user = trim($_POST["username"]);
    $pass = $_POST["password"];

    if ($user === "" || $pass === "") {
        header("Location: ../html/register.html?error=datos_incompletos");
        exit();
    }

    // Esta regla también se comprueba en PHP para que no pueda evitarse desde el navegador.
    if (strlen($pass) < 8 || strlen($pass) > 16) {
        header("Location: ../html/register.html?error=contrasena_longitud");
        exit();
    }

    // Se revisa primero si ya existe un usuario con el mismo nombre.
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        header("Location: ../html/register.html?error=usuario_existente");
        exit();
    }

    // La contraseña se cifra antes de guardarla en la base de datos.
    $hashedPassword = password_hash($pass, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $user, $hashedPassword);

    if ($stmt->execute()) {
        header("Location: ../html/login.html?success=registro_correcto");
        exit();
    }

    // Este mensaje aparece si ocurre otro error al guardar la cuenta.
    header("Location: ../html/register.html?error=registro_error");
    exit();
}

header("Location: ../html/register.html");
exit();
?>