import type { MembershipTier, UserRole, UserStatus } from './types';

export interface GetCurrentUserResponse {
    id: number;
    email: string;
    username: string;
    membershipTier: MembershipTier;
    role: UserRole;
    cellphone: string;
    birthDate?: string;
    avatar: string | null;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
}

export interface UpdateCellphoneRequest {
    cellphone: string;
}

export interface UpdateUsernameRequest {
    username: string;
}

export interface UpdatePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface UpdateBirthDateRequest {
    birthDate: string;
}

export interface UpdateAvatarRequest {
    avatar: string;
}

export interface GetAllUserRequest {
    keyword?: string;
    page?: number;
    size?: number;
}

export interface UpdateStatusRequest {
    userId: number;
    status: UserStatus;
}

