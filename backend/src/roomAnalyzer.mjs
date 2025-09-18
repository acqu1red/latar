import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Анализатор помещений для определения типа комнаты и выбора подходящей мебели
 */
export class RoomAnalyzer {
  constructor() {
    this.furnitureData = null;
    this.loadFurnitureData();
  }

  /**
   * Загружает данные о мебели
   */
  loadFurnitureData() {
    try {
      const furniturePath = path.join(process.cwd(), 'furniture.json');
      this.furnitureData = JSON.parse(fs.readFileSync(furniturePath, 'utf8'));
      console.log('✅ Данные о мебели загружены');
    } catch (error) {
      console.error('❌ Ошибка загрузки данных о мебели:', error);
      this.furnitureData = { furniture: [] };
    }
  }

  /**
   * Анализирует изображение и определяет тип помещения
   * @param {string} imagePath - Путь к изображению
   * @returns {Promise<string>} Тип помещения
   */
  async analyzeRoomType(imagePath) {
    try {
      console.log('🔍 Анализируем тип помещения:', imagePath);
      
      // Получаем метаданные изображения
      const metadata = await sharp(imagePath).metadata();
      const { width, height } = metadata;
      
      // Анализируем изображение для определения типа помещения
      const roomType = await this.detectRoomType(imagePath, width, height);
      
      console.log('✅ Определен тип помещения:', roomType);
      return roomType;
      
    } catch (error) {
      console.error('❌ Ошибка анализа типа помещения:', error);
      return 'living_room'; // По умолчанию гостиная
    }
  }

  /**
   * Определяет тип помещения на основе анализа изображения
   * @param {string} imagePath - Путь к изображению
   * @param {number} width - Ширина изображения
   * @param {number} height - Высота изображения
   * @returns {Promise<string>} Тип помещения
   */
  async detectRoomType(imagePath, width, height) {
    try {
      // Простой анализ на основе размеров и характеристик изображения
      const aspectRatio = width / height;
      
      // Анализируем цвета и контрастность
      const imageBuffer = fs.readFileSync(imagePath);
      const { data, info } = await sharp(imageBuffer)
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      // Простой анализ для определения типа помещения
      // В реальной реализации здесь можно использовать более сложные алгоритмы
      
      // Анализируем пропорции
      if (aspectRatio > 1.5) {
        // Широкое помещение - возможно кухня или гостиная
        return this.analyzeWideRoom(data, info);
      } else if (aspectRatio < 0.7) {
        // Узкое помещение - возможно ванная или туалет
        return this.analyzeNarrowRoom(data, info);
      } else {
        // Квадратное помещение - возможно спальня
        return this.analyzeSquareRoom(data, info);
      }
      
    } catch (error) {
      console.error('❌ Ошибка определения типа помещения:', error);
      return 'living_room';
    }
  }

  /**
   * Анализирует широкое помещение
   */
  analyzeWideRoom(data, info) {
    // Простая эвристика - в реальности можно использовать ML
    return 'kitchen'; // По умолчанию кухня для широких помещений
  }

  /**
   * Анализирует узкое помещение
   */
  analyzeNarrowRoom(data, info) {
    return 'bathroom'; // По умолчанию ванная для узких помещений
  }

  /**
   * Анализирует квадратное помещение
   */
  analyzeSquareRoom(data, info) {
    return 'bedroom'; // По умолчанию спальня для квадратных помещений
  }

  /**
   * Выбирает мебель для типа помещения
   * @param {string} roomType - Тип помещения
   * @returns {Array} Массив выбранной мебели
   */
  selectFurnitureForRoom(roomType) {
    const furnitureSets = {
      'bedroom': [
        'кровать', 'комод', 'шкаф', 'тумба', 'зеркало'
      ],
      'kitchen': [
        'холодильник', 'плита', 'раковина', 'кухонный гарнитур', 'микроволновка', 'духовой шкаф'
      ],
      'bathroom': [
        'ванна', 'душ', 'раковина', 'туалет', 'зеркало'
      ],
      'living_room': [
        'диван', 'кресло', 'телевизор', 'стол', 'книжный шкаф', 'тумба под ТВ'
      ],
      'toilet': [
        'туалет', 'раковина', 'зеркало'
      ],
      'office': [
        'письменный стол', 'стул', 'компьютер', 'книжный шкаф', 'принтер'
      ],
      'dining_room': [
        'стол', 'стул', 'холодильник', 'посудомоечная машина'
      ]
    };

    const selectedFurniture = furnitureSets[roomType] || furnitureSets['living_room'];
    
    // Выбираем случайные предметы мебели (3-5 штук)
    const numItems = Math.min(selectedFurniture.length, Math.floor(Math.random() * 3) + 3);
    const shuffled = [...selectedFurniture].sort(() => 0.5 - Math.random());
    
    return shuffled.slice(0, numItems);
  }

  /**
   * Генерирует промпт с мебелью для ControlNet
   * @param {string} roomType - Тип помещения
   * @param {Array} furniture - Массив мебели
   * @returns {string} Промпт
   */
  generateFurniturePrompt(roomType, furniture) {
    const roomNames = {
      'bedroom': 'спальня',
      'kitchen': 'кухня', 
      'bathroom': 'ванная комната',
      'living_room': 'гостиная',
      'toilet': 'туалет',
      'office': 'кабинет',
      'dining_room': 'столовая'
    };

    const roomName = roomNames[roomType] || 'комната';
    const furnitureList = furniture.join(', ');

    return `a detailed architectural floor plan of a ${roomName} with furniture: ${furnitureList}. The floor plan should be perfectly centered on a clean white background, showing room layout with walls, doors, windows, and furniture placement. Professional architectural drawing style with black lines on white background. The furniture should be placed logically and the plan must be centered and clearly visible.`;
  }

  /**
   * Получает полную информацию о мебели по названию
   * @param {string} furnitureName - Название мебели
   * @returns {Object|null} Данные о мебели
   */
  getFurnitureInfo(furnitureName) {
    if (!this.furnitureData || !this.furnitureData.furniture) {
      return null;
    }

    return this.furnitureData.furniture.find(item => 
      item.name === furnitureName || 
      item.keywords.some(keyword => keyword.toLowerCase().includes(furnitureName.toLowerCase()))
    );
  }
}

// Экспортируем экземпляр
export const roomAnalyzer = new RoomAnalyzer();
