<?php
// Elimina los datos de la sesión actual antes de volver al login.
session_start();
session_unset();
session_destroy();

header("Location: ../html/login.html?success=Sesión cerrada correctamente");
exit();
?>
