import { ApiProperty } from '@nestjs/swagger'

export class PostRevokeUserSessionResponse {
  @ApiProperty({ example: 200, description: 'The status code of the API response' })
  status_code: number

  @ApiProperty({
    example: 'Successfully revoked the session access!',
    description: 'The message of the API response',
  })
  message: string
}
