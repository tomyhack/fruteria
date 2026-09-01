<?php
// Carga la conexión a la base de datos para guardar el nuevo usuario.
require_once "db_connect.php";

// Solo permite que esta página reciba datos enviados por el formulario (POST).
// GET, HEAD, etc., no son procesados.
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtiene y sanitiza el nombre de usuario.
    // htmlspecialchars evita que código HTML se interprete.
    $user = htmlspecialchars($_POST["username"]);
    // Obtiene la contraseña sin sanitizar aún (se cifrará después).
    $pass = $_POST["password"];

    // Valida que la contraseña tenga entre 8 y 16 caracteres.
    // Se repite la regla de JavaScript para que siempre se cumpla en el servidor.
    // Esto evita que se salte la validación desde el navegador.
    if (strlen($pass) < 8 || strlen($pass) > 16) {
        // Redirige con el mensaje de error traducido.
        header("Location: ../html/register.html?error=messages.passwordLength");
        exit();
    }

    // Cifra la contraseña usando el algoritmo bcrypt.
    // No se guarda la contraseña original; se guarda una versión cifrada.
    $hashed_password = password_hash($pass, PASSWORD_BCRYPT);

    // Prepara la consulta SQL para insertar el nuevo usuario.
    // Los signos ? reservan los datos y evitan escribirlos directamente en SQL.
    // Esto previene inyecciones SQL.
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    // Vincula los parámetros ("ss" indica que son dos strings).
    $stmt->bind_param("ss", $user, $hashed_password);

    // Intenta insertar el usuario.
    if ($stmt->execute()) {
        // Si la inserción fue exitosa, redirige al login mostrando el mensaje de éxito.
        header("Location: ../html/login.html?success=messages.registrationSuccess");
        exit();
    }

    // Si hay error (ej: usuario duplicado), muestra un mensaje de error genérico.
    header("Location: ../html/register.html?error=messages.registrationError");
    exit();
}
?>
