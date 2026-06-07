export type MembershipTier = 'FREE' | 'BASIC' | 'PREMIUM';
export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'DISABLED' | 'ACTIVE';

export interface GetCurrentUserResponse {
    id: number;
    email: string;
    username: string;
    membershipTier: MembershipTier;
    role: UserRole;
    birthDate: string;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
}

