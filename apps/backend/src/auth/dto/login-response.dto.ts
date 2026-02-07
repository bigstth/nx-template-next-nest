import {
  LoginResponseInterface,
  UserResponseInterface,
} from '@vcafe/shared-interfaces';

export class LoginResponseDto implements LoginResponseInterface {
  access_token: string;
  refresh_token?: string;
  user: Omit<UserResponseInterface, 'createdAt' | 'updatedAt'>;

  constructor(data: LoginResponseInterface) {
    this.access_token = data.access_token;
    this.refresh_token = data.refresh_token;
    this.user = data.user;
  }
}
