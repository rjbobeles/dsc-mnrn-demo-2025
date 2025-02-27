import { Match } from '@dsc-demo/utils/validation'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator'

export class PostChangePasswordBodyDto {
  @ApiProperty({ example: 'A!123StrongPassN01CanBeatOld', description: "The user's current password", required: true })
  @IsString()
  @IsNotEmpty({ message: 'Current password should not be empty' })
  password!: string

  @ApiProperty({ example: 'A!123StrongPassN01CanBeat', description: "The user's new password", required: true })
  @IsNotEmpty({ message: 'New password cannot be empty' })
  @IsString({ message: 'New password needs to be a string' })
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
        'New password must be at least 8 characters long and include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character',
    },
  )
  new_password!: string

  @ApiProperty({ example: 'A!123StrongPassN01CanBeat', description: 'Repeat the new password', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Please confirm the new password' })
  @Match('new_password', { message: 'New password and password confirmation do not match' })
  new_password_repeat!: string

  @ApiProperty({ example: false, description: 'Logout from all devices', required: false })
  @IsOptional()
  @IsBoolean({ message: 'Logout of all devices must be a boolean' })
  logout_all_devices?: boolean
}
