import { API_URL } from "@/lib/config";

export const apiRequest = async (method: string, url: string, data?: unknown) => {
  const response = await fetch(`${API_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
};

// Helper methods for different HTTP methods
export const api = {
  get: (url: string) => apiRequest("GET", url),
  post: (url: string, data: unknown) => apiRequest("POST", url, data),
  put: (url: string, data: unknown) => apiRequest("PUT", url, data),
  delete: (url: string) => apiRequest("DELETE", url),
}; 