<?php
session_start();

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

if (!isset($_SESSION["id_usuario"], $_SESSION["usuario"])) {
    echo json_encode(["autenticado" => false]);
    exit();
}

echo json_encode([
    "autenticado" => true,
    "usuario" => $_SESSION["usuario"]
]);
?>
