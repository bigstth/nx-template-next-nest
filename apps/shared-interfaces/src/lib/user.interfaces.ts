export enum UserRole {
  USER = 'USER',
  VIP = 'VIP',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export interface UserInterface {
  id: string;
  email: string | null;
  role: UserRole;
  displayName?: string | null;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
