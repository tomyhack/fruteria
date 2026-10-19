<?php
// Datos de conexión de la base de datos local de la frutería.
$servidor = "localhost";
$usuarioBase = "root";
$contrasenaBase = "";
$nombreBase = "fruteria";

$conn = new mysqli($servidor, $usuarioBase, $contrasenaBase);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
$conn->query("CREATE DATABASE IF NOT EXISTS `$nombreBase` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$conn->select_db($nombreBase);

function existeTabla($conn, $tabla) {
    $stmt = $conn->prepare(
        "SELECT 1 FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name = ?"
    );
    $stmt->bind_param("s", $tabla);
    $stmt->execute();

    return $stmt->get_result()->num_rows === 1;
}

function existeColumna($conn, $tabla, $columna) {
    $stmt = $conn->prepare(
        "SELECT 1 FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?"
    );
    $stmt->bind_param("ss", $tabla, $columna);
    $stmt->execute();

    return $stmt->get_result()->num_rows === 1;
}

function tieneClaveForanea($conn, $tabla) {
    $stmt = $conn->prepare(
        "SELECT 1 FROM information_schema.table_constraints
         WHERE table_schema = DATABASE()
           AND table_name = ?
           AND constraint_type = 'FOREIGN KEY'"
    );
    $stmt->bind_param("s", $tabla);
    $stmt->execute();

    return $stmt->get_result()->num_rows > 0;
}

function ejecutarEsquema($conn, $consulta) {
    if (!$conn->query($consulta)) {
        die("No se pudo preparar la base de datos: " . $conn->error);
    }
}

// Migra instalaciones de la versión anterior sin conservar campos que el
// carrito ya no debe almacenar.
if (!existeTabla($conn, "usuarios") && existeTabla($conn, "users")) {
    ejecutarEsquema($conn, "RENAME TABLE users TO usuarios");
}

ejecutarEsquema(
    $conn,
    "CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
        correo_electronico VARCHAR(100) NOT NULL UNIQUE,
        contrasena VARCHAR(255) NOT NULL
    )"
);

if (existeColumna($conn, "usuarios", "username") && !existeColumna($conn, "usuarios", "nombre_usuario")) {
    ejecutarEsquema($conn, "ALTER TABLE usuarios CHANGE username nombre_usuario VARCHAR(50) NOT NULL");
}

if (existeColumna($conn, "usuarios", "email") && !existeColumna($conn, "usuarios", "correo_electronico")) {
    ejecutarEsquema($conn, "ALTER TABLE usuarios CHANGE email correo_electronico VARCHAR(100) NULL");
}

if (!existeColumna($conn, "usuarios", "correo_electronico")) {
    ejecutarEsquema(
        $conn,
        "ALTER TABLE usuarios
         ADD COLUMN correo_electronico VARCHAR(100) NULL UNIQUE AFTER nombre_usuario"
    );
}

if (existeColumna($conn, "usuarios", "password") && !existeColumna($conn, "usuarios", "contrasena")) {
    ejecutarEsquema($conn, "ALTER TABLE usuarios CHANGE password contrasena VARCHAR(255) NOT NULL");
}

if (!existeTabla($conn, "productos_carrito") && existeTabla($conn, "cart_items")) {
    ejecutarEsquema($conn, "RENAME TABLE cart_items TO productos_carrito");
}

ejecutarEsquema(
    $conn,
    "CREATE TABLE IF NOT EXISTS productos_carrito (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        id_usuario INT NOT NULL,
        CONSTRAINT fk_productos_carrito_usuario
            FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
    )"
);

if (existeColumna($conn, "productos_carrito", "user_id") && !existeColumna($conn, "productos_carrito", "id_usuario")) {
    ejecutarEsquema($conn, "ALTER TABLE productos_carrito CHANGE user_id id_usuario INT NOT NULL");
}

if (existeColumna($conn, "productos_carrito", "product_name") && !existeColumna($conn, "productos_carrito", "nombre")) {
    ejecutarEsquema($conn, "ALTER TABLE productos_carrito CHANGE product_name nombre VARCHAR(100) NOT NULL");
}

if (existeColumna($conn, "productos_carrito", "product_price") && !existeColumna($conn, "productos_carrito", "precio")) {
    ejecutarEsquema($conn, "ALTER TABLE productos_carrito CHANGE product_price precio DECIMAL(10,2) NOT NULL");
}

foreach (["product_unit", "product_image", "created_at"] as $columna) {
    if (existeColumna($conn, "productos_carrito", $columna)) {
        ejecutarEsquema($conn, "ALTER TABLE productos_carrito DROP COLUMN `$columna`");
    }
}

if (!tieneClaveForanea($conn, "productos_carrito")) {
    ejecutarEsquema(
        $conn,
        "ALTER TABLE productos_carrito
         ADD CONSTRAINT fk_productos_carrito_usuario
         FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE"
    );
}
?>
