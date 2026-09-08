<?php
// Estos datos identifican la base de datos local de la frutería.
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "fruteria";

// Esta conexión se reutiliza en los archivos de inicio y registro.
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>
