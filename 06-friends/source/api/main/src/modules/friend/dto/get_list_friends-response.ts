import { ApiProperty } from '@nestjs/swagger'

import { FriendSchema } from '../../../schema'

class GetListFriendsData {
  @ApiProperty({
    example: 1,
    description: 'The number of friends',
  })
  count: number

  @ApiProperty({
    type: FriendSchema.Friend,
    isArray: true,
  })
  friends: FriendSchema.Friend[]
}

export class GetListFriendsResponse {
  @ApiProperty({ example: 200, description: 'The statusCode of the API response' })
  status_code: number

  @ApiProperty({
    example: 'Successfully retrieved friends!',
    description: 'The message of the API response',
  })
  message: string

  @ApiProperty({ type: GetListFriendsData })
  data: GetListFriendsData
}
