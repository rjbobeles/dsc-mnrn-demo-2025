import { ApiProperty } from '@nestjs/swagger'

import { FriendSchema } from '../../../schema'

export class PostCreateFriendResponse {
  @ApiProperty({ example: 200, description: 'The statusCode of the API response' })
  status_code: number

  @ApiProperty({
    example: 'Successfully created friend!',
    description: 'The message of the API response',
  })
  message: string

  @ApiProperty({ type: FriendSchema.Friend, isArray: false })
  data: FriendSchema.Friend
}
