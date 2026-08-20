<?php
session_start();
session_unset();
session_destroy();

header("Location: ../html/login.html?success=Sesión cerrada correctamente");
exit();
?>
