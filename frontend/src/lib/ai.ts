import { ApiResponse } from './api';

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
  // Используем продакшн бэкенд
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://acqu1red-latar-c0f7.twc1.net';

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${backendUrl}/api/generate-plan`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `Ошибка сервера: ${response.status} - ${errorText}` };
    }

    const data: GeneratePlanResponse = await response.json();
    return { data };
  } catch (error: unknown) {
    return { error: `Не удалось подключиться к бэкенду: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` };
  }
}
