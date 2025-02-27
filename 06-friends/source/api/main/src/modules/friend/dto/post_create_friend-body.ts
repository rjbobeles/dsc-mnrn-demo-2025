import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator"

export class PostCreateFriendBody {
   @ApiProperty({ example: 'john.doe@example.com', description: 'The email used to register to the app' })
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsString({ message: 'Email needs to be a string' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string

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

    @ApiProperty({ example: ['baseball', 'basketball'], description: "The friend's hobbies" })
    @IsOptional()
    @IsArray({ message: 'Hobbies must be an array'})
    @IsString({ each: true, message: 'Hobby must be a string'})
    hobbies: string[]
}
