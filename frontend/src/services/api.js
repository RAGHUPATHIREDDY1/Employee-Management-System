const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiRequest = async (
  path,
  method = "GET",
  body = null,
  needsToken = true
) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (needsToken) {
    const token = localStorage.getItem("token");

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.code = data.code;
    error.data = data;
    throw error;
  }

  return data;
};
