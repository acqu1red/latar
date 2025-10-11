export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Имитация задержки сети
const simulateNetworkDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function mockApiCall<T>(data: T, success = true, delay = 1000): Promise<ApiResponse<T>> {
  await simulateNetworkDelay(delay);
  if (success) {
    return { data };
  } else {
    return { error: "Произошла ошибка при выполнении запроса." };
  }
}

// Пример использования:
// export async function submitContactForm(formData: { name: string; email: string; message: string }): Promise<ApiResponse<string>> {
//   return mockApiCall("Сообщение успешно отправлено!", true);
// }

// export async function getBlogPosts(): Promise<ApiResponse<any[]>> {
//   return mockApiCall([
//     { id: '1', title: 'First Post', content: '...' },
//     { id: '2', title: 'Second Post', content: '...' },
//   ]);
// }
