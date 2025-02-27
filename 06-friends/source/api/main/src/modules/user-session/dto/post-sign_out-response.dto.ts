import { ApiProperty } from '@nestjs/swagger'

export class PostSignOutResponse {
  @ApiProperty({ example: 200, description: 'The status code of the API response' })
  status_code: number

  @ApiProperty({ example: 'You have successfully logged out!', description: 'The message of the API response' })
  message: string
}
