/**
 * MySQL connection pool for external DB (e.g. Vietnix, or any MySQL host).
 * Set DATABASE_URL (e.g. mysql://user:password@host:3306/dbname) to enable.
 */

import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

export function isDatabaseConfigured(): boolean {
  return Boolean(typeof process !== 'undefined' && process.env.DATABASE_URL)
}

function getPool(): mysql.Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set')
    pool = mysql.createPool(url)
  }
  return pool
}

export async function query<T = unknown>(sql: string, params?: unknown[]): Promise<T> {
  const p = getPool()
  const [rows] = await p.execute(sql, params)
  return rows as T
}

export async function initSchema(): Promise<void> {
  if (!isDatabaseConfigured()) return
  const q = query as (sql: string) => Promise<void>
  await q(`
    CREATE TABLE IF NOT EXISTS devices (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      device_key VARCHAR(64) NOT NULL,
      device_name VARCHAR(255) NOT NULL,
      last_heartbeat BIGINT NULL,
      stats TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_device_key (device_key)
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS accounts (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL,
      password TEXT NOT NULL,
      cookie TEXT NOT NULL,
      private_server_link TEXT NULL,
      device_id VARCHAR(255) NULL
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS backups (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      filename VARCHAR(512) NOT NULL,
      format VARCHAR(64) NOT NULL,
      file_size VARCHAR(64) NOT NULL,
      created_at VARCHAR(64) NOT NULL,
      updated_at VARCHAR(64) NOT NULL,
      download_url TEXT NULL
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS pending_restores (
      device_key VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      device_id VARCHAR(255) NOT NULL,
      download_url TEXT NOT NULL,
      name VARCHAR(512) NOT NULL,
      filename VARCHAR(512) NOT NULL
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS device_key_map (
      device_key VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      device_id VARCHAR(255) NOT NULL
    )
  `)
}
