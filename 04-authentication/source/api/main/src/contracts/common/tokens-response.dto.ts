import { ApiProperty } from '@nestjs/swagger'

export class Tokens {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...', description: "The user's access token" })
  access_token?: string

  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9....', description: "The user's refresh token" })
  refresh_token?: string
}
