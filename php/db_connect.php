<?php
// Datos de la base creada con setup.sql en phpMyAdmin.
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "fruteria";

// Esta variable se usa en login.php y register.php para consultar la base.
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>
