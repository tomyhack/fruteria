<?php
// Recupera la sesión creada en login.php.
session_start();

// Protege esta página: sin sesión, el usuario vuelve al inicio de sesión.
if (!isset($_SESSION["username"])) {
    header("Location: ../html/login.html?error=Inicia sesión primero");
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
            <!-- htmlspecialchars evita que un nombre de usuario se interprete como HTML. -->
            <h1>Bienvenido, <?php echo htmlspecialchars($_SESSION["username"]); ?>.</h1>
            <p>Has iniciado sesión correctamente.</p>
            <a class="primary-btn" href="../html/main.html">Ir a la tienda</a>
            <a class="logout-link" href="logout.php">Cerrar sesión</a>
        </div>
    </main>
</body>
</html>
