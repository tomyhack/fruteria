<?php
// Connection settings for the local fruit shop database.
$servidor = "localhost";
$usuarioBase = "root";
$contrasenaBase = "";
$nombreBase = "fruteria";

$conexion = new mysqli($servidor, $usuarioBase, $contrasenaBase, $nombreBase);

if ($conexion->connect_error) {
    die("Connection failed: " . $conexion->connect_error);
}

?>
