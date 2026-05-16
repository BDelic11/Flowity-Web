import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && config.headers)
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: {
  resolve: (t: string) => void;
  reject: (e: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  failedQueue = [];
};

const AUTH_SKIP_401 = [
  "/auth/login",
  "/auth/refresh",
  "/auth/register",
  "/auth/logout",
  "/auth/google",
];

// Pages where we should NOT force-redirect on refresh failure
const PUBLIC_PATHS = ["/login", "/register", "/create-organization"];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;
    const url = (original?.url || "").toLowerCase();

    const isAuthRoute = AUTH_SKIP_401.some((p) => url.endsWith(p));

    if (status === 401 && !original?._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ access_token: string }>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        localStorage.setItem("token", data.access_token);
        processQueue(null, data.access_token);

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("token");

        // Only hard-redirect if we're on a protected page
        if (typeof window !== "undefined") {
          const isPublicPage = PUBLIC_PATHS.some((p) =>
            window.location.pathname.startsWith(p)
          );
          if (!isPublicPage) {
            window.location.href = "/login";
          }
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { api };
