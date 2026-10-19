<?php
session_start();

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

if (!isset($_SESSION["user_id"], $_SESSION["username"])) {
    echo json_encode(["authenticated" => false]);
    exit();
}

echo json_encode([
    "authenticated" => true,
    "username" => $_SESSION["username"]
]);
?>
