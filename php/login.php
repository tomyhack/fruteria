<?php
session_start();
require_once "db_connect.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input_user = $_POST["username"];
    $input_pass = $_POST["password"];

    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $input_user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        if (password_verify($input_pass, $user["password"])) {
            $_SESSION["username"] = $user["username"];
            header("Location: welcome.php");
            exit();
        }
    }

    header("Location: ../html/login.html?error=Usuario o contraseña incorrectos");
    exit();
}
?>
