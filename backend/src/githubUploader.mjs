import { Octokit } from '@octokit/rest';

// Инициализация GitHub API клиента
const octokit = process.env.GITHUB_TOKEN ? new Octokit({
  auth: process.env.GITHUB_TOKEN
}) : null;

// Конфигурация репозитория
const REPO_OWNER = 'acqu1red';
const REPO_NAME = 'latar';
const BRANCH = 'main';
const TEMP_IMAGES_PATH = 'temp-images';

/**
 * Загружает изображение на GitHub и возвращает публичный URL
 * @param {Buffer} imageBuffer - Буфер изображения
 * @param {string} filename - Имя файла
 * @returns {Promise<string>} Публичный URL изображения
 */
export async function uploadImageToGitHub(imageBuffer, filename) {
  try {
    if (!octokit) {
      throw new Error('GitHub токен не настроен. Установите GITHUB_TOKEN в переменных окружения.');
    }

    console.log('Загружаем изображение на GitHub:', filename);
    
    // Конвертируем буфер в base64
    const content = imageBuffer.toString('base64');
    
    // Загружаем файл на GitHub
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${TEMP_IMAGES_PATH}/${filename}`,
      message: `Upload temp image: ${filename}`,
      content: content,
      branch: BRANCH
    });

    // Создаём публичный URL
    const publicUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${TEMP_IMAGES_PATH}/${filename}`;
    
    console.log('Изображение успешно загружено на GitHub:', publicUrl);
    console.log('GitHub commit SHA:', response.data.commit.sha);
    
    return {
      url: publicUrl,
      commitSha: response.data.commit.sha,
      path: `${TEMP_IMAGES_PATH}/${filename}`
    };
    
  } catch (error) {
    console.error('Ошибка загрузки изображения на GitHub:', error);
    throw error;
  }
}

/**
 * Удаляет изображение с GitHub
 * @param {string} filePath - Путь к файлу на GitHub
 * @param {string} commitSha - SHA коммита с файлом
 * @returns {Promise<boolean>} Успешность удаления
 */
export async function deleteImageFromGitHub(filePath, commitSha) {
  try {
    if (!octokit) {
      console.warn('GitHub токен не настроен. Не удалось удалить файл с GitHub.');
      return false;
    }

    console.log('Удаляем изображение с GitHub:', filePath);
    
    // Получаем текущий SHA файла
    const { data: fileData } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      branch: BRANCH
    });

    // Удаляем файл
    await octokit.repos.deleteFile({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      message: `Delete temp image: ${filePath}`,
      sha: fileData.sha,
      branch: BRANCH
    });

    console.log('Изображение успешно удалено с GitHub:', filePath);
    return true;
    
  } catch (error) {
    console.error('Ошибка удаления изображения с GitHub:', error);
    return false;
  }
}

/**
 * Создаёт уникальное имя файла для временного изображения
 * @returns {string} Уникальное имя файла
 */
export function generateTempFilename() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `temp-${timestamp}-${random}.png`;
}

/**
 * Проверяет, настроен ли GitHub токен
 * @returns {boolean} Настроен ли токен
 */
export function isGitHubConfigured() {
  return !!process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'YOUR_GITHUB_TOKEN_HERE';
}
