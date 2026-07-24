const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    // fetch itself threw -> network is down / server unreachable
    throw new ApiError("Network error - check your connection and try again.", 0);
  }

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON body, ignore
  }

  if (!res.ok) {
    throw new ApiError(body?.message || "Something went wrong. Please try again.", res.status);
  }

  return body as T;
}

export const api = {
  getGallery: () => request<{ items: any[] }>("/gallery"),
  getVideos: () => request<{ items: any[] }>("/videos"),
  getInventory: () => request<{ towers: any[] }>("/inventory"),
  bookUnit: (payload: { unitId: string; customerName: string; phone: string }) =>
    request<{ unit: any }>("/book", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logInterest: (payload: {
    sessionId: string;
    type: string;
    refId: string;
    label?: string;
    dwellMs?: number;
  }) =>
    request<{ signal: any }>("/interest", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
