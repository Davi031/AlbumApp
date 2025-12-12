export const API_URL = "";

export const fetcher = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Erro na requisição");
  }

  return res.json();
};