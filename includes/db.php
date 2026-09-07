<?php
/**
 * PDO adatbázis-kapcsolat.
 *
 * Betölti a projekt gyökerében lévő config.php-t (lásd
 * config.php.example), és egy megosztott PDO példányt ad vissza a
 * get_db_connection() függvényen keresztül.
 */

require_once __DIR__ . '/../config.php';

/**
 * @return PDO
 * @throws PDOException ha a kapcsolódás sikertelen
 */
function get_db_connection(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            DB_HOST,
            DB_NAME,
            DB_CHARSET
        );

        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }

    return $pdo;
}
