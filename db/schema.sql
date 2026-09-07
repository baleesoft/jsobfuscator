-- JS Obfuszkátor - adatbázis-séma
--
-- Csak a felhasználói presetek opció-JSON-jét tárolja - a védendő
-- JavaScript forráskód soha nem kerül ide, lásd
-- docs/js-obfuszkator-specifikacio.md 7. pont.

CREATE TABLE IF NOT EXISTS obf_presets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nev VARCHAR(100) NOT NULL,
  opciok_json JSON NOT NULL,
  letrehozva DATETIME DEFAULT CURRENT_TIMESTAMP,
  modositva DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
