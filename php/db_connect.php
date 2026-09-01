<?php
// Configuración de conexión a la base de datos de XAMPP.
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "fruteria";

// Se reutiliza en login.php y register.php para consultar y guardar usuarios.
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>
