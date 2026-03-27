import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,20}$/;

export class CreateUserDto {
  @ApiProperty({
    description: 'First name of the user.',
    example: 'John',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'First name must have at least 2 characters.' })
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    description: 'Last name of the user.',
    example: 'Doe',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'Last name must have at least 2 characters.' })
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    description: 'Valid email address of the user.',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsEmail(undefined, { message: 'Please provide valid email.' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Age of the user.',
    example: 28,
    type: Number,
  })
  @IsInt()
  age!: number;

  @ApiProperty({
    description: 'Gender of the user.',
    enum: ['f', 'm', 'o'],
    example: 'm',
  })
  @IsString()
  @IsEnum(['f', 'm', 'o'])
  gender!: string;

  @ApiProperty({
    description:
      'Password (8-20 characters, at least one uppercase letter, one lowercase letter, one number, and one special character).',
    example: 'P@ssw0rd!',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @Matches(PASSWORD_REGEX, {
    message: `Password must contain Minimum 8 and maximum 20 characters,
        at least one uppercase letter,
        one lowercase letter,
        one number and
        one special character.`,
  })
  @IsNotEmpty()
  password!: string;
}
