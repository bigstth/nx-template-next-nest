import { UserRole } from './user.interfaces';
export interface RegisterRequestInterface {
    email: string;
    password: string;
    role?: UserRole;
}
export interface LoginRequestInterface {
    email: string;
    password: string;
}
export interface UserResponseInterface {
    id: number;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
export interface LoginResponseInterface {
    access_token: string;
    refresh_token?: string;
    user: Omit<UserResponseInterface, 'createdAt' | 'updatedAt'>;
}
export interface RegisterResponseInterface {
    id: number;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
export interface RefreshResponseInterface {
    access_token: string;
}
