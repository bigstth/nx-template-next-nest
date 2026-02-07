import { RegisterResponseInterface } from '@vcafe/shared-interfaces';

export class RegisterResponseDto implements RegisterResponseInterface {
  id: number;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: RegisterResponseInterface) {
    this.id = data.id;
    this.email = data.email;
    this.role = data.role;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
