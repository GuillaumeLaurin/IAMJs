import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'Registered email address of the user.',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsEmail(undefined, { message: 'Please provide a valid email' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Password associated with the account.',
    example: 'P@ssw0rd!',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
