import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsEmail(undefined, { message: 'Please provide a valid email' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
