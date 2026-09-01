<?php
// Recupera la sesión creada en login.php para acceder a los datos del usuario.
session_start();

// Protege esta página: sin sesión activa, el usuario no puede acceder.
// Si alguien intenta acceder directamente sin iniciar sesión, es redirigido.
if (!isset($_SESSION["username"])) {
    // Redirige al login con un mensaje de error.
    header("Location: ../html/login.html?error=messages.loginRequired");
    // Detiene la ejecución del script.
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frutería Nancy | Bienvenido</title>
    <link rel="stylesheet" href="../css/login.css">
    <link rel="stylesheet" href="../css/media.css">
</head>
<body>
    <main class="auth-page">
        <div class="auth-card welcome-card">
            <!-- Sección de control de idioma: botón para cambiar entre español e inglés -->
            <div class="auth-language-control">
                <!-- Botón que alterna el idioma. El atributo data-language-toggle lo vincula con el script de traducción -->
                <button class="language-toggle" type="button" data-language-toggle aria-label="Cambiar idioma a Inglés" title="Cambiar idioma a Inglés">EN</button>
            </div>
            <!-- Encabezado de bienvenida con el nombre del usuario -->
            <!-- htmlspecialchars evita que un nombre de usuario se interprete como HTML. -->
            <!-- data-i18n permite que el texto se traduzca automáticamente -->
            <!-- data-i18n-param-username pasa el nombre de usuario como parámetro para la traducción -->
            <h1 data-i18n="welcome.heading" data-i18n-param-username="<?php echo htmlspecialchars($_SESSION["username"]); ?>">Bienvenido, <?php echo htmlspecialchars($_SESSION["username"]); ?>.</h1>
            <!-- Mensaje de confirmación de inicio de sesión -->
            <p>Has iniciado sesión correctamente.</p>
            <!-- Botón para ir a la tienda principal -->
            <a class="primary-btn" href="../html/main.html">Ir a la tienda</a>
            <!-- Enlace para cerrar sesión -->
            <a class="logout-link" href="logout.php">Cerrar sesión</a>
        </div>
    </main>
    <!-- Carga el script de traducción para traducir la página automáticamente -->
    <script src="../js/translate.js"></script>
</body>
</html>
