import {
    IsAlphanumeric,
    IsEmail,
    IsEnum,
    IsIn,
    IsInt,
    isNotEmpty,
    IsNotEmpty,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,20}$/;

export class CreateUserDto {
    @IsString()
    @MinLength(2, { message: 'Name must have at least 2 characters.' })
    @IsNotEmpty()
    name: string;

    @IsString()
    @MinLength(3, { message: 'Username must have at least 3 characters.' })
    @IsAlphanumeric(null, {
        message: 'Username does not allow other than alpha numeric chars.',
    })
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsEmail(null, { message: 'Please provide valid email.' })
    @IsNotEmpty()
    email: string;

    @IsInt()
    age: number;

    @IsString()
    @IsEnum(['f', 'm', 'o'])
    gender: string;

    @IsString()
    @Matches(PASSWORD_REGEX, {
        message: `Password must contain Minimum 8 and maximum 20 characters,
        at least one uppercase letter,
        one lowercase letter,
        one number and
        one special character.`,
    })
    @IsNotEmpty()
    password;
}