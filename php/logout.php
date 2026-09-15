<?php
// Se eliminan los datos de sesión al cerrar sesión.
session_start();
session_unset();
session_destroy();

header("Location: ../html/login.html?success=sesion_cerrada");
exit();
?>