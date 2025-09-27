import { ApiResponse, mockApiCall } from './api';

interface GeneratePlanResponse {
  imageUrl: string;
  details: {
    wallOuter: number;
    wallInner: number;
    doors: number;
    windows: number;
    furnitureItems: number;
  };
}

export async function generatePlanFromImage(file: File): Promise<ApiResponse<GeneratePlanResponse>> {
  console.log("Имитация генерации плана для файла:", file.name);
  // Имитация задержки и возврата данных
  return mockApiCall(
    {
      imageUrl: "/uploads/processed_plan_placeholder.png", // Заглушка изображения результата ИИ
      details: {
        wallOuter: 100,
        wallInner: 250,
        doors: 5,
        windows: 8,
        furnitureItems: 12,
      },
    },
    true, // Имитировать успех
    2000  // Задержка 2 секунды
  );
}
