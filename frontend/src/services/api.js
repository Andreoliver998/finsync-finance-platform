import axios from "axios";

const AUTH_TOKEN_KEYS = [
  "finsync:token",
  "token",
  "authToken",
  "jwt",
  "accessToken",
  "paytech:token",
  "paytech.auth.token"
];

function readTokenFromStorage(storage) {
  for (const key of AUTH_TOKEN_KEYS) {
    const token = storage.getItem(key);

    if (token) {
      return token;
    }
  }

  const authPayloadKeys = ["auth", "user", "paytech:auth", "paytech.auth"];

  for (const key of authPayloadKeys) {
    const rawValue = storage.getItem(key);

    if (!rawValue) {
      continue;
    }

    try {
      const parsedValue = JSON.parse(rawValue);
      const token =
        parsedValue?.token ||
        parsedValue?.jwt ||
        parsedValue?.accessToken ||
        parsedValue?.data?.token ||
        parsedValue?.data?.accessToken;

      if (token) {
        return token;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function getStoredJwt() {
  if (typeof window === "undefined") {
    return null;
  }

  return readTokenFromStorage(window.localStorage) || readTokenFromStorage(window.sessionStorage);
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = getStoredJwt();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
