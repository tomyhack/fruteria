<?php
// Connection settings for the local fruit shop database.
$servidor = "localhost";
$usuarioBase = "root";
$contrasenaBase = "";
$nombreBase = "fruteria";

$conn = new mysqli($servidor, $usuarioBase, $contrasenaBase, $nombreBase);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

?>
