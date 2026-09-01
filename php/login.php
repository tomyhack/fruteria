<?php
// Recupera la sesión creada en login.php para recordar al usuario entre páginas.
session_start();
// Incluye el archivo de conexión a la base de datos.
require_once "db_connect.php";

// Solo procesa si el formulario se envía por POST.
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtiene los datos del formulario.
    $input_user = $_POST["username"];
    $input_pass = $_POST["password"];

    // La consulta preparada busca el usuario sin insertar su texto directamente en SQL.
    // Esto previene inyecciones SQL.
    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    // Vincula el parámetro ("s" indica que es un string).
    $stmt->bind_param("s", $input_user);
    // Ejecuta la consulta.
    $stmt->execute();
    // Obtiene el resultado.
    $result = $stmt->get_result();

    // Si se encontró exactamente un usuario con ese nombre.
    if ($result->num_rows === 1) {
        // Obtiene los datos del usuario como un array asociativo.
        $user = $result->fetch_assoc();

        // Compara la contraseña escrita con la versión cifrada guardada en la base.
        if (password_verify($input_pass, $user["password"])) {
            // Guarda el nombre de usuario en la sesión para futuras páginas.
            $_SESSION["username"] = $user["username"];
            // Redirige al usuario a la página de bienvenida.
            header("Location: welcome.php");
            // Detiene la ejecución del script.
            exit();
        }
    }

    // Si no coinciden los datos, vuelve al formulario sin revelar cuál dato fue incorrecto.
    // Esto es una buena práctica de seguridad: no da pistas a atacantes.
    header("Location: ../html/login.html?error=messages.invalidCredentials");
    exit();
}
?>
