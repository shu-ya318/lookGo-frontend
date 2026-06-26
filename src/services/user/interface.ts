export type MembershipTier = 'BASIC' | 'PREMIUM';
export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'DISABLED' | 'ACTIVE';

export interface GetCurrentUserResponse {
    id: number;
    email: string;
    username: string;
    membershipTier: MembershipTier;
    role: UserRole;
    birthDate?: string;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
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

export interface UpdateStatusRequest {
    userId: string;
    status: UserStatus;
}

