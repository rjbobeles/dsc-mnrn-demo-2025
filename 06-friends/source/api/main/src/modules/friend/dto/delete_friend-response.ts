import { ApiProperty } from '@nestjs/swagger'


export class DeleteFriendResponse {
  @ApiProperty({ example: 200, description: 'The statusCode of the API response' })
  status_code: number

  @ApiProperty({
    example: 'Successfully deleted friend!',
    description: 'The message of the API response',
  })
  message: string
}
