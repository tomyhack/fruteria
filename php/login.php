<?php
// La sesión permite recordar al usuario después de iniciar sesión.
session_start();
require_once "db_connect.php";

// Solo se procesan los datos que llegan desde el formulario.
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user = trim($_POST["username"]);
    $pass = $_POST["password"];

    if ($user === "" || $pass === "") {
        header("Location: ../html/login.html?error=datos_incompletos");
        exit();
    }

    // La consulta busca el usuario sin escribir sus datos dentro del SQL.
    $stmt = $conn->prepare("SELECT username, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();

        // password_verify compara la contraseña escrita con la contraseña cifrada.
        if (password_verify($pass, $row["password"])) {
            $_SESSION["username"] = $row["username"];
            header("Location: ../html/index.html");
            exit();
        }
    }

    // Si el usuario no existe o la contraseña no coincide, vuelve al formulario.
    header("Location: ../html/login.html?error=credenciales_incorrectas");
    exit();
}

header("Location: ../html/login.html");
exit();
?>
