<?php
// Recupera la sesión actual del usuario.
session_start();
// Elimina todos los datos guardados en la sesión actual.
// Esto borra la información del usuario conectado.
session_unset();
// Destruye la sesión completamente, eliminando también la cookie de sesión.
session_destroy();

// Redirige al usuario a la página de login con un mensaje de éxito.
header("Location: ../html/login.html?success=messages.logoutSuccess");
// Detiene la ejecución del script.
exit();
?>
