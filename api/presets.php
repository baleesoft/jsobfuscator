<?php
/**
 * AJAX végpont: mentett obfuszkálási presetek lista / mentés / törlés.
 *
 * FONTOS ELVI SZABÁLY: ez a végpont soha nem kap és soha nem lát
 * védendő JavaScript forráskódot - kizárólag a motor opció-objektumát
 * (opciok_json) fogadja és adja vissza. Az obfuszkálás maga kizárólag
 * a böngészőben, a vendorolt javascript-obfuscator.browser.js
 * segítségével történik (lásd assets/js/app.js).
 *
 * Végpontok:
 *   GET  /api/presets.php?action=list
 *   POST /api/presets.php?action=save    (nev, opciok_json)
 *   POST /api/presets.php?action=delete  (id)
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json; charset=utf-8');

/** Egységes JSON válasz és leállás. */
function json_response(array $data, int $httpStatus = 200): void
{
    http_response_code($httpStatus);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $httpStatus = 400): void
{
    json_response(['ok' => false, 'error' => $message], $httpStatus);
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    $pdo = get_db_connection();
} catch (PDOException $e) {
    json_error('Adatbázis-kapcsolódási hiba.', 500);
    exit;
}

switch ($action) {
    case 'list':
        handle_list($pdo);
        break;

    case 'save':
        handle_save($pdo);
        break;

    case 'delete':
        handle_delete($pdo);
        break;

    default:
        json_error('Ismeretlen action.', 400);
}

/** GET ?action=list - mentett presetek listája. */
function handle_list(PDO $pdo): void
{
    $stmt = $pdo->query('SELECT id, nev, opciok_json, letrehozva, modositva FROM obf_presets ORDER BY nev ASC');
    $rows = $stmt->fetchAll();

    $presets = array_map(static function (array $row): array {
        return [
            'id' => (int) $row['id'],
            'nev' => $row['nev'],
            'opciok' => json_decode($row['opciok_json'], true),
            'letrehozva' => $row['letrehozva'],
            'modositva' => $row['modositva'],
        ];
    }, $rows);

    json_response(['ok' => true, 'presets' => $presets]);
}

/** POST action=save - új preset mentése. Csak POST-on keresztül, CSRF-védelem nélkül (belső eszköz). */
function handle_save(PDO $pdo): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_error('A mentéshez POST szükséges.', 405);
    }

    $nev = trim((string) ($_POST['nev'] ?? ''));
    $opciokRaw = (string) ($_POST['opciok_json'] ?? '');

    if ($nev === '') {
        json_error('A preset neve kötelező.');
    }
    if (mb_strlen($nev) > 100) {
        json_error('A preset neve legfeljebb 100 karakter lehet.');
    }

    $opciok = json_decode($opciokRaw, true);
    if (!is_array($opciok) || json_last_error() !== JSON_ERROR_NONE) {
        json_error('Érvénytelen opciók JSON.');
    }

    // Csak a motor opció-objektumát tároljuk - forráskódot (pl. "code"
    // vagy hasonló mező) szándékosan nem fogadunk el ezen a végponton.
    unset($opciok['code'], $opciok['sourceCode'], $opciok['input']);

    $opciokJson = json_encode($opciok, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $stmt = $pdo->prepare('INSERT INTO obf_presets (nev, opciok_json) VALUES (:nev, :opciok_json)');
    $stmt->execute([
        'nev' => $nev,
        'opciok_json' => $opciokJson,
    ]);

    json_response([
        'ok' => true,
        'preset' => [
            'id' => (int) $pdo->lastInsertId(),
            'nev' => $nev,
            'opciok' => $opciok,
        ],
    ]);
}

/** POST action=delete - preset törlése id alapján. */
function handle_delete(PDO $pdo): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_error('A törléshez POST szükséges.', 405);
    }

    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    if (!$id) {
        json_error('Érvénytelen preset azonosító.');
    }

    $stmt = $pdo->prepare('DELETE FROM obf_presets WHERE id = :id');
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_error('Nem található ilyen azonosítójú preset.', 404);
    }

    json_response(['ok' => true, 'id' => $id]);
}
