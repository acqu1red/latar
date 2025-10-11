import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Создаем базу данных в корне backend
const db = new Database(join(__dirname, '..', 'planai.db'));

// Включаем поддержку внешних ключей
db.pragma('foreign_keys = ON');

// Создаем таблицы
db.exec(`
  -- Таблица пользователей
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    telegram TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    access_prefix TEXT,
    plans_used INTEGER NOT NULL DEFAULT 0,
    regenerations_used INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Таблица настроек пользователя
  CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, setting_key)
  );

  -- Таблица данных агентства
  CREATE TABLE IF NOT EXISTS agency_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    telegram TEXT,
    whatsapp TEXT,
    vk TEXT,
    status TEXT DEFAULT 'none', -- 'none', 'pending', 'approved'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Таблица URL изображений
  CREATE TABLE IF NOT EXISTS image_urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    image_type TEXT NOT NULL, -- 'user_upload', 'generated_plan', 'generated_cleanup'
    original_filename TEXT NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata TEXT, -- JSON с дополнительными данными
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  -- Индексы для быстрого поиска
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_settings_user_id ON user_settings(user_id);
  CREATE INDEX IF NOT EXISTS idx_agency_user_id ON agency_data(user_id);
  CREATE INDEX IF NOT EXISTS idx_image_urls_user_id ON image_urls(user_id);
  CREATE INDEX IF NOT EXISTS idx_image_urls_type ON image_urls(image_type);
`);

const ensureColumn = (table, column, definition) => {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some(col => col.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

ensureColumn('users', 'role', "TEXT NOT NULL DEFAULT 'user'");
ensureColumn('users', 'access_prefix', 'TEXT');
ensureColumn('users', 'plans_used', 'INTEGER NOT NULL DEFAULT 0');
ensureColumn('users', 'regenerations_used', 'INTEGER NOT NULL DEFAULT 0');

// Функции для работы с пользователями
export const userDB = {
  // Создать пользователя
  create: (username, name, passwordHash, telegram = null) => {
    const stmt = db.prepare(`
      INSERT INTO users (username, name, password_hash, telegram)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(username, name, passwordHash, telegram);
  },

  // Найти пользователя по username
  findByUsername: (username) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  },

  // Найти пользователя по ID
  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Обновить пользователя
  update: (id, data) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    const stmt = db.prepare(`
      UPDATE users 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  setAccessPrefix: (id, prefix) => {
    if (prefix === 'Организация') {
      const stmt = db.prepare(`
        UPDATE users
        SET access_prefix = ?, plans_used = 0, regenerations_used = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      return stmt.run(prefix, id);
    }

    const stmt = db.prepare(`
      UPDATE users
      SET access_prefix = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(prefix, id);
  },

  incrementPlanUsage: (id) => {
    const stmt = db.prepare(`
      UPDATE users
      SET plans_used = plans_used + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(id);
  },

  resetPlanUsage: (id) => {
    const stmt = db.prepare(`
      UPDATE users
      SET plans_used = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(id);
  },

  incrementRegeneration: (id) => {
    const stmt = db.prepare(`
      UPDATE users
      SET regenerations_used = regenerations_used + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(id);
  },

  resetRegeneration: (id) => {
    const stmt = db.prepare(`
      UPDATE users
      SET regenerations_used = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(id);
  },

  getByPrefix: (prefix) => {
    const stmt = db.prepare(`
      SELECT id, username, name, access_prefix, role, created_at
      FROM users
      WHERE access_prefix = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(prefix);
  }
};

// Функции для работы с настройками
export const settingsDB = {
  // Получить все настройки пользователя
  getAll: (userId) => {
    const stmt = db.prepare('SELECT setting_key, setting_value FROM user_settings WHERE user_id = ?');
    const rows = stmt.all(userId);
    const settings = {};
    rows.forEach(row => {
      try {
        settings[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        settings[row.setting_key] = row.setting_value;
      }
    });
    return settings;
  },

  // Получить одну настройку
  get: (userId, key) => {
    const stmt = db.prepare('SELECT setting_value FROM user_settings WHERE user_id = ? AND setting_key = ?');
    const row = stmt.get(userId, key);
    if (!row) return null;
    try {
      return JSON.parse(row.setting_value);
    } catch {
      return row.setting_value;
    }
  },

  // Установить настройку
  set: (userId, key, value) => {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const stmt = db.prepare(`
      INSERT INTO user_settings (user_id, setting_key, setting_value)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, setting_key) 
      DO UPDATE SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
    `);
    return stmt.run(userId, key, stringValue, stringValue);
  },

  // Установить несколько настроек
  setMany: (userId, settings) => {
    const transaction = db.transaction((userId, settings) => {
      for (const [key, value] of Object.entries(settings)) {
        settingsDB.set(userId, key, value);
      }
    });
    return transaction(userId, settings);
  },

  // Удалить настройку
  delete: (userId, key) => {
    const stmt = db.prepare('DELETE FROM user_settings WHERE user_id = ? AND setting_key = ?');
    return stmt.run(userId, key);
  }
};

// Функции для работы с данными агентства
export const agencyDB = {
  // Получить данные агентства
  get: (userId) => {
    const stmt = db.prepare('SELECT * FROM agency_data WHERE user_id = ?');
    return stmt.get(userId);
  },

  // Создать или обновить данные агентства
  upsert: (userId, data) => {
    const existing = agencyDB.get(userId);
    if (existing) {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = Object.values(data);
      const stmt = db.prepare(`
        UPDATE agency_data 
        SET ${fields}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);
      return stmt.run(...values, userId);
    } else {
      const fields = ['user_id', ...Object.keys(data)].join(', ');
      const placeholders = ['?', ...Object.keys(data).map(() => '?')].join(', ');
      const values = [userId, ...Object.values(data)];
      const stmt = db.prepare(`
        INSERT INTO agency_data (${fields})
        VALUES (${placeholders})
      `);
      return stmt.run(...values);
    }
  }
};

// Функции для работы с URL изображений
export const imageUrlsDB = {
  // Сохранить URL изображения
  save: (userId, imageType, originalFilename, imageUrl, thumbnailUrl = null, metadata = {}) => {
    const stmt = db.prepare(`
      INSERT INTO image_urls (user_id, image_type, original_filename, image_url, thumbnail_url, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(userId, imageType, originalFilename, imageUrl, thumbnailUrl, JSON.stringify(metadata));
  },

  // Получить изображения пользователя
  getByUser: (userId, imageType = null) => {
    let query = 'SELECT * FROM image_urls WHERE user_id = ?';
    let params = [userId];
    
    if (imageType) {
      query += ' AND image_type = ?';
      params.push(imageType);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = db.prepare(query);
    return stmt.all(...params);
  },

  // Получить изображение по ID
  getById: (id) => {
    const stmt = db.prepare('SELECT * FROM image_urls WHERE id = ?');
    return stmt.get(id);
  },

  // Удалить изображение
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM image_urls WHERE id = ?');
    return stmt.run(id);
  },

  // Получить статистику
  getStats: () => {
    const stmt = db.prepare(`
      SELECT 
        image_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM image_urls 
      GROUP BY image_type
    `);
    return stmt.all();
  },

  // Получить общую статистику
  getTotalStats: () => {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_images,
        COUNT(DISTINCT user_id) as total_users,
        COUNT(CASE WHEN image_type = 'generated_plan' THEN 1 END) as plans_generated,
        COUNT(CASE WHEN image_type = 'generated_cleanup' THEN 1 END) as cleanups_generated
      FROM image_urls
    `);
    return stmt.get();
  }
};

const directorUsername = 'developers';
const directorPassword = 'developers1488PLAN';

try {
  const existingDirector = userDB.findByUsername(directorUsername);
  if (!existingDirector) {
    const passwordHash = bcrypt.hashSync(directorPassword, 10);
    const result = userDB.create(directorUsername, 'Директор', passwordHash);
    const directorId = result.lastInsertRowid;
    userDB.update(directorId, { role: 'director' });
    console.log('✅ Директорский аккаунт создан: developers');
  } else if (existingDirector.role !== 'director') {
    userDB.update(existingDirector.id, { role: 'director' });
  }
} catch (err) {
  console.error('❌ Ошибка при инициализации аккаунта директора:', err);
}

export default db;

