import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { jwtDecode } from "jwt-decode";

import { useAuthStore } from "@/stores/authStore";

import { refreshTokens } from "./auth";

import { handleApiError } from "./error";

const service = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
});

service.interceptors.request.use(
  async (config) => {
    if (config.url?.includes("/auth/refreshToken")) {
      return config;
    }

    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      const decoded = jwtDecode(accessToken);
      const expiresAt = (decoded.exp as number) * 1000;
      const now = new Date().getTime();
      const isExpired = expiresAt && expiresAt < now;

      if (isExpired) {
        try {
          const response = await refreshTokens();

          useAuthStore.setState({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });

          config.headers.Authorization = `Bearer ${response.accessToken}`;
        } catch (error) {
          console.error("[API Request] Refresh failed", error);

          useAuthStore.getState().clearAuth();
          window.location.href = "/auth/log-in";

          return Promise.reject(error);
        }
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (
    error: AxiosError<{
      message?: string;
      error?: { message: string };
      files?: string[];
    }>
  ) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      if (!window.location.pathname.includes("/auth/log-in")) {
        window.location.href = "/auth/log-in";
      }
    }

    if (error.response?.status === 403) {
      window.location.href = "/unauthorized";
    }

    console.error("[API Error]", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    const data = error.response?.data;
    const errorMessage =
      data?.message ||
      data?.error?.message ||
      data?.files ||
      handleApiError(error);

    return Promise.reject(errorMessage);
  }
);

const postRequest = <T>(
  url: string,
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.post(url, data, config) as unknown as Promise<T>;
};

export default postRequest;
