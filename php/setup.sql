-- Crea la base solo si todavía no existe.
CREATE DATABASE IF NOT EXISTS fruteria;
USE fruteria;

-- Guarda un identificador, el usuario único y la contraseña cifrada.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
