import { UserRole } from './user.interfaces';

// Request Interfaces
export interface RegisterRequestInterface {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequestInterface {
  email: string;
  password: string;
}

// Response Interfaces
export interface UserResponseInterface {
  id: string;
  email: string | null;
  role: UserRole;
  displayName?: string | null;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponseInterface {
  access_token: string;
  refresh_token?: string;
  user: Omit<UserResponseInterface, 'createdAt' | 'updatedAt'>;
}

export interface RegisterResponseInterface {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshResponseInterface {
  access_token: string;
}
