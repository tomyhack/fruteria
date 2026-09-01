<?php
// Protege la página para que solo puedan entrar usuarios autenticados.
session_start();

if (!isset($_SESSION["username"])) {
    header("Location: ../html/login.html?error=messages.loginRequired");
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
            <div class="auth-language-control">
                <button class="language-toggle" type="button" data-language-toggle aria-label="Cambiar idioma a Inglés" title="Cambiar idioma a Inglés">EN</button>
            </div>
            <!-- El nombre del usuario se escapa para evitar HTML injection. -->
            <h1 data-i18n="welcome.heading" data-i18n-param-username="<?php echo htmlspecialchars($_SESSION["username"]); ?>">Bienvenido, <?php echo htmlspecialchars($_SESSION["username"]); ?>.</h1>
            <p>Has iniciado sesión correctamente.</p>
            <a class="primary-btn" href="../html/main.html">Ir a la tienda</a>
            <a class="logout-link" href="logout.php">Cerrar sesión</a>
        </div>
    </main>
    <script src="../js/translate.js"></script>
</body>
</html>
