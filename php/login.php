<?php
session_start();
require_once "db_connect.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user = trim($_POST["username"]);
    $pass = $_POST["password"];

    if ($user === "" || $pass === "") {
        header("Location: ../html/login.html?error=" . urlencode("Completa el usuario y la contraseña."));
        exit();
    }

    $stmt = $conn->prepare(
        "SELECT id, nombre_usuario, contrasena
         FROM usuarios
         WHERE nombre_usuario = ?"
    );
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();

        if (!password_verify($pass, $row["contrasena"])) {
            header("Location: ../html/login.html?error=" . urlencode("Usuario o contraseña incorrectos."));
            exit();
        }

        session_regenerate_id(true);
        $_SESSION["user_id"] = (int) $row["id"];
        $_SESSION["username"] = $row["nombre_usuario"];
        header("Location: ../html/index.html");
        exit();
    }

    header("Location: ../html/login.html?error=" . urlencode("Usuario o contraseña incorrectos."));
    exit();
}

header("Location: ../html/login.html");
exit();
?>
