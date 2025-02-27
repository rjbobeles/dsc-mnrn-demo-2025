import { ApiProperty } from '@nestjs/swagger'

export class UserInfo {
  @ApiProperty({ example: '6651a1a7e12e4f5f72c71ab9', description: "The user's account ID" })
  _id?: string

  @ApiProperty({ example: 'John', description: "The user's last name" })
  first_name?: string

  @ApiProperty({ example: 'Doe', description: "The user's last name" })
  last_name?: string

  @ApiProperty({ example: false, description: "The user's email verification status" })
  email_verified?: boolean
}
