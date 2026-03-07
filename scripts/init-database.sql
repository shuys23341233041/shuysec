-- sHuysSec: Schema + sample data for MySQL (Vietnix / any host)
-- Import this in phpMyAdmin or cPanel MySQL after creating the database.
-- User accounts (sHuys / sHuys1) are defined in app code, not in DB.

-- ========== 1. TABLES (schema) ==========

CREATE TABLE IF NOT EXISTS devices (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  device_key VARCHAR(64) NOT NULL,
  device_name VARCHAR(255) NOT NULL,
  last_heartbeat BIGINT NULL,
  stats TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_device_key (device_key)
);

CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password TEXT NOT NULL,
  cookie TEXT NOT NULL,
  private_server_link TEXT NULL,
  device_id VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS backups (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  filename VARCHAR(512) NOT NULL,
  format VARCHAR(64) NOT NULL,
  file_size VARCHAR(64) NOT NULL,
  created_at VARCHAR(64) NOT NULL,
  updated_at VARCHAR(64) NOT NULL,
  download_url TEXT NULL
);

CREATE TABLE IF NOT EXISTS pending_restores (
  device_key VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  download_url TEXT NOT NULL,
  name VARCHAR(512) NOT NULL,
  filename VARCHAR(512) NOT NULL
);

CREATE TABLE IF NOT EXISTS device_key_map (
  device_key VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  device_id VARCHAR(255) NOT NULL
);

-- ========== 2. SAMPLE DATA (optional – delete if you want empty DB) ==========
-- Login: sHuys / 123456789 (admin) or sHuys1 / 123456789 (user)

-- 1 device for user sHuys
INSERT IGNORE INTO devices (id, user_id, device_key, device_name, last_heartbeat, stats) VALUES
('device_sample_001', 'sHuys', 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', 'Device 1', NULL, NULL);

-- 1 unassigned account for sHuys (device_id = NULL)
INSERT IGNORE INTO accounts (id, user_id, username, password, cookie, private_server_link, device_id) VALUES
('acc_sample_001', 'sHuys', 'sample_user', 'sample_pass', 'sample_cookie_data_here', NULL, NULL);

-- Global map: device_key → user + device (for Tool Click.py auth)
INSERT IGNORE INTO device_key_map (device_key, user_id, device_id) VALUES
('a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', 'sHuys', 'device_sample_001');

-- 1 backup for sHuys
INSERT IGNORE INTO backups (id, user_id, filename, format, file_size, created_at, updated_at, download_url) VALUES
('backup_sample_001', 'sHuys', 'sample_backup.ldbk', 'LDPlayer', '0 MB', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', NULL);

-- ========== Done ==========
-- After import: set DATABASE_URL in Vercel and redeploy. App will use this DB.
