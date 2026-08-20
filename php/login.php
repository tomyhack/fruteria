<?php
// La sesión permite recordar qué usuario inició sesión entre páginas.
session_start();
require_once "db_connect.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input_user = $_POST["username"];
    $input_pass = $_POST["password"];

    // La consulta preparada busca el usuario sin insertar su texto directamente en SQL.
    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $input_user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // Compara la contraseña escrita con la versión cifrada guardada en la base.
        if (password_verify($input_pass, $user["password"])) {
            $_SESSION["username"] = $user["username"];
            header("Location: welcome.php");
            exit();
        }
    }

    // Si no coincide, vuelve al formulario sin revelar cuál dato fue incorrecto.
    header("Location: ../html/login.html?error=Usuario o contraseña incorrectos");
    exit();
}
?>
