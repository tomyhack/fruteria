<?php
require_once "db_connect.php";

// Solo procesa registros enviados por formulario POST.
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = htmlspecialchars($_POST["username"]);
    $pass = $_POST["password"];

    // Se valida de nuevo en el servidor para evitar saltarse la regla del cliente.
    if (strlen($pass) < 8 || strlen($pass) > 16) {
        header("Location: ../html/register.html?error=messages.passwordLength");
        exit();
    }

    // Se guarda la contraseña cifrada con bcrypt, nunca en texto plano.
    $hashed_password = password_hash($pass, PASSWORD_BCRYPT);

    // La consulta preparada evita inyecciones SQL.
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $user, $hashed_password);

    if ($stmt->execute()) {
        header("Location: ../html/login.html?success=messages.registrationSuccess");
        exit();
    }

    header("Location: ../html/register.html?error=messages.registrationError");
    exit();
}
?>
