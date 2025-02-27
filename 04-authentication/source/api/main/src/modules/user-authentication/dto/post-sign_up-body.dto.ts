import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Matches } from 'class-validator'

export class PostSignUpBodyDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'The email used to register to the app' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsString({ message: 'Email needs to be a string' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string

  @ApiProperty({ example: 'A!123StrongPassN01CanBeat', description: 'The password used to register to the app' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString({ message: 'Password needs to be a string' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character',
    },
  )
  password: string

  @ApiProperty({ example: 'John', description: "The user's last name" })
  @IsNotEmpty({ message: 'First name cannot be empty' })
  @IsString({ message: 'First name needs to be a string' })
  @Matches(/^[A-Za-z\s]+$/, { message: 'First name can only contain letters and spaces' })
  first_name: string

  @ApiProperty({ example: 'Doe', description: "The user's last name" })
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @IsString({ message: 'Last name needs to be a string' })
  @Matches(/^[A-Za-z\s]+$/, { message: 'Last name can only contain letters and spaces' })
  last_name: string
}
