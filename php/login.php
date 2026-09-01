<?php
// Inicia la sesión para recordar al usuario entre páginas.
session_start();
require_once "db_connect.php";

// Solo procesa el login si el formulario se envió por POST.
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input_user = $_POST["username"];
    $input_pass = $_POST["password"];

    // La consulta preparada evita inyecciones SQL.
    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $input_user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // Verifica la contraseña contra el hash guardado en la base.
        if (password_verify($input_pass, $user["password"])) {
            $_SESSION["username"] = $user["username"];
            header("Location: welcome.php");
            exit();
        }
    }

    // Si falla, vuelve al login con un mensaje traducido.
    header("Location: ../html/login.html?error=messages.invalidCredentials");
    exit();
}
?>
