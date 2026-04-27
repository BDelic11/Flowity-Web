import axios from "axios";

// A clean axios instance for public (unauthenticated) endpoints.
// No auth interceptors, no token injection, no redirect on 401.
export const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});
