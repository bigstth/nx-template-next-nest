export enum UserRole {
  USER = 'USER',
  VIP = 'VIP',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export interface UserInterface {
  id: number;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
