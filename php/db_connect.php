<?php
// Configuración de la base de datos.
// Estos son los datos por defecto de XAMPP.
// servername: Dirección del servidor MySQL (localhost = esta computadora).
$servername = "localhost";
// username: Usuario de acceso a MySQL (root = administrador predeterminado).
$username = "root";
// password: Contraseña del usuario (vacía por defecto en XAMPP).
$password = "";
// dbname: Nombre de la base de datos a usar.
$dbname = "fruteria";

// Crea una conexión a la base de datos usando MySQLi (MySQL Improved).
// Esta variable se usa en login.php y register.php para consultar la base.
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica si hubo un error de conexión.
if ($conn->connect_error) {
    // Si hay error, muestra el mensaje y detiene la ejecución.
    die("Error de conexión: " . $conn->connect_error);
}
?>
