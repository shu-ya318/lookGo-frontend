export interface SignupRequest {
    email: string;
    username: string;
    password: string;
    birthDate: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}
