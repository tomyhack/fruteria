<?php
session_start();

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

function respond($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

if (!isset($_SESSION["user_id"])) {
    respond(401, ["message" => "Primero tienes que iniciar sesión."]);
}

require_once "db_connect.php";

$userId = (int) $_SESSION["user_id"];

function getCartItems($conn, $userId) {
    $stmt = $conn->prepare(
        "SELECT id, nombre AS name, precio AS price
         FROM productos_carrito
         WHERE id_usuario = ?
         ORDER BY id"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();

    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    respond(200, ["items" => getCartItems($conn, $userId)]);
}

if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    $itemId = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);

    if (!$itemId) {
        respond(422, ["message" => "Producto inválido."]);
    }

    $stmt = $conn->prepare("DELETE FROM productos_carrito WHERE id = ? AND id_usuario = ?");
    $stmt->bind_param("ii", $itemId, $userId);
    $stmt->execute();

    respond(200, ["items" => getCartItems($conn, $userId)]);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(405, ["message" => "Método no permitido."]);
}

$payload = json_decode(file_get_contents("php://input"), true);

if (!is_array($payload)) {
    respond(422, ["message" => "Datos inválidos."]);
}

if (($payload["action"] ?? "") === "clear") {
    $stmt = $conn->prepare("DELETE FROM productos_carrito WHERE id_usuario = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();

    respond(200, ["items" => []]);
}

$name = trim((string) ($payload["name"] ?? ""));
$price = $payload["price"] ?? null;
if (
    $name === "" || strlen($name) > 100 || !is_numeric($price) || (float) $price < 0
) {
    respond(422, ["message" => "Datos de producto inválidos."]);
}

$price = (float) $price;
$stmt = $conn->prepare(
    "INSERT INTO productos_carrito (id_usuario, nombre, precio)
     VALUES (?, ?, ?)"
);
$stmt->bind_param("isd", $userId, $name, $price);
$stmt->execute();

respond(201, ["items" => getCartItems($conn, $userId)]);
?>
