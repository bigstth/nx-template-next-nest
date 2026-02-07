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
  id: number;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponseInterface {
  access_token: string;
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
