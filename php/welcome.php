<?php
session_start();

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
</head>
<body>
    <main class="auth-page">
        <div class="auth-card welcome-card">
            <h1>Bienvenido, <?php echo htmlspecialchars($_SESSION["username"]); ?>.</h1>
            <p>Has iniciado sesión correctamente.</p>
            <a class="primary-btn" href="../html/main.html">Ir a la tienda</a>
            <a class="logout-link" href="logout.php">Cerrar sesión</a>
        </div>
    </main>
</body>
</html>
