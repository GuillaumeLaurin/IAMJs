import { ApiProperty } from '@nestjs/swagger';

export class OAuthUserDto {
  @ApiProperty({ example: 'google' })
  provider!: string;

  @ApiProperty({ example: '1234567890' })
  providerId!: string;

  @ApiProperty({ example: 'john.doe@gmail.com' })
  email!: string;

  @ApiProperty({ example: 'John' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;
}
