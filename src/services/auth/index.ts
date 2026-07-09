import postRequest from "../api";

import type { ApiResponse } from "../common/interface";
import type {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  ResetPasswordRequest,
} from "./interface";

export const signup = async (request: SignupRequest): Promise<AuthResponse> => {
  return await postRequest<AuthResponse>("/auth/sign-up", request);
};

export const login = async (request: LoginRequest): Promise<AuthResponse> => {
  return await postRequest<AuthResponse>("/auth/log-in", request);
};

export const refreshTokens = async (): Promise<AuthResponse> => {
  return await postRequest<AuthResponse>("/auth/refresh-tokens");
};

export const logout = async () => {
  await postRequest("/auth/log-out");
};

export const forgetPassword = async (
  request: ForgetPasswordRequest
): Promise<ForgetPasswordResponse> => {
  return await postRequest<ForgetPasswordResponse>("/auth/forget-password", request);
};

export const resetPassword = async (
  request: ResetPasswordRequest
): Promise<ApiResponse> => {
  return await postRequest<ApiResponse>("/auth/reset-password", request);
};
