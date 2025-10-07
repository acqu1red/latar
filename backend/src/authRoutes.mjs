import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userDB, settingsDB, agencyDB } from './database.mjs';

const router = express.Router();

// Секретный ключ для JWT (в production использовать переменную окружения)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware для проверки токена
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Необходима авторизация' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Неверный токен' });
    }
    req.user = user;
    next();
  });
};

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { username, name, password, telegram } = req.body;

    // Проверка обязательных полей
    if (!username || !name || !password) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    // Проверка существования пользователя
    const existingUser = userDB.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким псевдонимом уже существует' });
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создание пользователя
    const result = userDB.create(username, name, passwordHash, telegram);
    const userId = result.lastInsertRowid;

    // Создание токена
    const token = jwt.sign(
      { id: userId, username, name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: { id: userId, username, name }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверка обязательных полей
    if (!username || !password) {
      return res.status(400).json({ error: 'Введите псевдоним и пароль' });
    }

    // Поиск пользователя
    const user = userDB.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Неверный псевдоним или пароль' });
    }

    // Проверка пароля
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный псевдоним или пароль' });
    }

    // Создание токена
    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, name: user.name }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

// Получить данные текущего пользователя
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = userDB.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Удаляем хеш пароля из ответа
    delete user.password_hash;

    res.json({ user });
  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить все настройки пользователя
router.get('/settings', authenticateToken, (req, res) => {
  try {
    const settings = settingsDB.getAll(req.user.id);
    res.json({ settings });
  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Сохранить настройки пользователя
router.post('/settings', authenticateToken, (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Неверный формат настроек' });
    }

    settingsDB.setMany(req.user.id, settings);
    
    res.json({ success: true, message: 'Настройки сохранены' });
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить данные агентства
router.get('/agency', authenticateToken, (req, res) => {
  try {
    const agency = agencyDB.get(req.user.id) || {};
    res.json({ agency });
  } catch (error) {
    console.error('Ошибка получения данных агентства:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Сохранить данные агентства
router.post('/agency', authenticateToken, (req, res) => {
  try {
    const { name, address, city, country, telegram, whatsapp, vk, status } = req.body;
    
    const agencyData = {};
    if (name) agencyData.name = name;
    if (address) agencyData.address = address;
    if (city) agencyData.city = city;
    if (country) agencyData.country = country;
    if (telegram) agencyData.telegram = telegram;
    if (whatsapp) agencyData.whatsapp = whatsapp;
    if (vk) agencyData.vk = vk;
    if (status) agencyData.status = status;

    agencyDB.upsert(req.user.id, agencyData);
    
    res.json({ success: true, message: 'Данные агентства сохранены' });
  } catch (error) {
    console.error('Ошибка сохранения данных агентства:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

