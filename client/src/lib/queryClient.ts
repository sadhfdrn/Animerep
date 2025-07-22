import { QueryClient } from '@tanstack/react-query';

// Create query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Default API request function
export async function apiRequest<T = any>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': 'user-123', // In a real app, this would come from auth
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Set default query function
queryClient.setQueryDefaults(['api'], {
  queryFn: async ({ queryKey }) => {
    const url = Array.isArray(queryKey) ? queryKey.join('/') : queryKey;
    return apiRequest(url as string);
  },
});