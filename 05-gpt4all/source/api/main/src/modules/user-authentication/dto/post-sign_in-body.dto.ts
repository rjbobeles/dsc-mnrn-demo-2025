import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class PostSignInBodyDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'The email used to register to the app' })
  @IsNotEmpty({ message: 'Username cannot be empty' })
  @IsString({ message: 'Username needs to be a string' })
  username: string

  @ApiProperty({ example: 'A!123StrongPassN01CanBeat', description: 'The password used to register to the app' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString({ message: 'Password needs to be a string' })
  password: string
}
