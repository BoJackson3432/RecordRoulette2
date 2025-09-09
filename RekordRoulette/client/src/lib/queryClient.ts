import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Create user-friendly error messages based on status codes
    let userMessage = text;
    if (res.status === 401) {
      userMessage = "Please log in to continue";
    } else if (res.status === 403) {
      userMessage = "You don't have permission to do that";
    } else if (res.status === 404) {
      userMessage = "We couldn't find what you're looking for";
    } else if (res.status === 429) {
      userMessage = text; // Keep rate limit messages as they're already user-friendly
    } else if (res.status >= 500) {
      userMessage = "Something went wrong on our end. Please try again in a moment";
    } else if (res.status === 400 && text.includes("Daily limit")) {
      userMessage = text; // Keep daily limit messages as they're already user-friendly
    } else if (res.status >= 400) {
      userMessage = "Something went wrong. Please try again";
    }
    
    throw new Error(`${res.status}: ${userMessage}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes instead of infinity
      gcTime: 10 * 60 * 1000, // 10 minutes cache time
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
