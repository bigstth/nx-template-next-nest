import { RegisterResponseInterface, UserRole } from '@vcafe/shared-interfaces';

export class RegisterResponseDto implements RegisterResponseInterface {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: RegisterResponseInterface) {
    this.id = data.id;
    this.email = data.email!; // Non-null assertion: register always requires email
    this.role = data.role;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
