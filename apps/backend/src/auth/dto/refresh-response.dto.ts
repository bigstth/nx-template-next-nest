import { RefreshResponseInterface } from '@vcafe/shared-interfaces';

export class RefreshResponseDto implements RefreshResponseInterface {
  access_token: string;

  constructor(data: RefreshResponseInterface) {
    this.access_token = data.access_token;
  }
}
