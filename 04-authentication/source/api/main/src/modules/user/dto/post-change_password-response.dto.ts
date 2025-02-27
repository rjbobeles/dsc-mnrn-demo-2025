import { ApiProperty } from '@nestjs/swagger'

export class PostChangePasswordResponse {
  @ApiProperty({ example: 200, description: 'The status code of the API response' })
  status_code: number

  @ApiProperty({
    example: 'Your password has been changed!',
    description: 'The message of the API response',
  })
  message: string
}
