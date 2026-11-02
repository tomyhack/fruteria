<?php
session_start();

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

function responder($codigoEstado, $datos) {
    http_response_code($codigoEstado);
    echo json_encode($datos);
    exit();
}

if (!isset($_SESSION["id_usuario"])) {
    responder(401, ["mensaje" => "Primero tienes que iniciar sesión."]);
}

require_once "db_connect.php";

$idUsuario = (int) $_SESSION["id_usuario"];

function obtenerProductosCarrito($conexion, $idUsuario) {
    $consulta = $conexion->prepare(
        "SELECT id, nombre, precio
         FROM productos_carrito
         WHERE id_usuario = ?
         ORDER BY id"
    );
    $consulta->bind_param("i", $idUsuario);
    $consulta->execute();

    $resultado = $consulta->get_result();
    $productos = [];

    while ($producto = $resultado->fetch_assoc()) {
        $productos[] = $producto;
    }

    return $productos;
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    responder(200, ["productos" => obtenerProductosCarrito($conexion, $idUsuario)]);
}

if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    $idProducto = filter_input(INPUT_GET, "id_producto", FILTER_VALIDATE_INT);

    if (!$idProducto) {
        responder(422, ["mensaje" => "Producto inválido."]);
    }

    $consulta = $conexion->prepare("DELETE FROM productos_carrito WHERE id = ? AND id_usuario = ?");
    $consulta->bind_param("ii", $idProducto, $idUsuario);
    $consulta->execute();

    responder(200, ["productos" => obtenerProductosCarrito($conexion, $idUsuario)]);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(405, ["mensaje" => "Método no permitido."]);
}

$datosRecibidos = json_decode(file_get_contents("php://input"), true);

if (!is_array($datosRecibidos)) {
    responder(422, ["mensaje" => "Datos inválidos."]);
}

if (isset($datosRecibidos["accion"]) && $datosRecibidos["accion"] === "vaciar") {
    $consulta = $conexion->prepare("DELETE FROM productos_carrito WHERE id_usuario = ?");
    $consulta->bind_param("i", $idUsuario);
    $consulta->execute();

    responder(200, ["productos" => []]);
}

$nombre = "";
$precio = null;

if (isset($datosRecibidos["nombre"]) && is_string($datosRecibidos["nombre"])) {
    $nombre = trim($datosRecibidos["nombre"]);
}

if (isset($datosRecibidos["precio"])) {
    $precio = $datosRecibidos["precio"];
}

if (
    $nombre === "" || strlen($nombre) > 100 || !is_numeric($precio) || (float) $precio < 0
) {
    responder(422, ["mensaje" => "Datos de producto inválidos."]);
}

$precio = (float) $precio;
$consulta = $conexion->prepare(
    "INSERT INTO productos_carrito (id_usuario, nombre, precio)
     VALUES (?, ?, ?)"
);
$consulta->bind_param("isd", $idUsuario, $nombre, $precio);
$consulta->execute();

responder(201, ["productos" => obtenerProductosCarrito($conexion, $idUsuario)]);
?>
