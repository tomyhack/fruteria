<?php
session_start();
require_once "db_connect.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $usuario = trim($_POST["usuario"]);
    $contrasena = $_POST["contrasena"];

    if ($usuario === "" || $contrasena === "") {
        header("Location: ../html/login.html?error=" . urlencode("Completa el usuario y la contraseña."));
        exit();
    }

    $consulta = $conexion->prepare(
        "SELECT id, nombre_usuario, contrasena
         FROM usuarios
         WHERE nombre_usuario = ?"
    );
    $consulta->bind_param("s", $usuario);
    $consulta->execute();
    $resultado = $consulta->get_result();

    if ($resultado->num_rows === 1) {
        $fila = $resultado->fetch_assoc();

        if (!password_verify($contrasena, $fila["contrasena"])) {
            header("Location: ../html/login.html?error=" . urlencode("Usuario o contraseña incorrectos."));
            exit();
        }

        session_regenerate_id(true);
        $_SESSION["id_usuario"] = (int) $fila["id"];
        $_SESSION["usuario"] = $fila["nombre_usuario"];
        header("Location: ../html/index.html");
        exit();
    }

    header("Location: ../html/login.html?error=" . urlencode("Usuario o contraseña incorrectos."));
    exit();
}

header("Location: ../html/login.html");
exit();
?>
