<?php
require_once "db_connect.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $usuario = trim($_POST["usuario"]);
    $correo = trim($_POST["correo"]);
    $contrasena = $_POST["contrasena"];

    $usuarioValido = preg_match('/^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{6,12}$/', $usuario) === 1;
    $contrasenaValida =
        strlen($contrasena) >= 6 && strlen($contrasena) <= 12 &&
        preg_match('/[a-z]/', $contrasena) &&
        preg_match('/[A-Z]/', $contrasena) &&
        preg_match('/[0-9]/', $contrasena) &&
        preg_match('/[^A-Za-z0-9]/', $contrasena);

    if (!$usuarioValido || !$contrasenaValida || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        header("Location: ../html/register.html?error=" . urlencode("Completa los datos correctamente."));
        exit();
    }

    $consulta = $conexion->prepare(
        "SELECT id FROM usuarios
         WHERE nombre_usuario = ? OR correo_electronico = ?"
    );
    $consulta->bind_param("ss", $usuario, $correo);
    $consulta->execute();
    $resultado = $consulta->get_result();

    if ($resultado->num_rows > 0) {
        header("Location: ../html/register.html?error=" . urlencode("El usuario o el correo ya existe."));
        exit();
    }

    $claveCifrada = password_hash($contrasena, PASSWORD_BCRYPT);
    $consulta = $conexion->prepare(
        "INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena)
         VALUES (?, ?, ?)"
    );
    $consulta->bind_param("sss", $usuario, $correo, $claveCifrada);

    if (!$consulta->execute()) {
        header("Location: ../html/register.html?error=" . urlencode("No se pudo crear la cuenta."));
        exit();
    }

    header("Location: ../html/login.html?exito=" . urlencode("Cuenta creada. Ya puedes iniciar sesión."));
    exit();
}

header("Location: ../html/register.html");
exit();
?>
