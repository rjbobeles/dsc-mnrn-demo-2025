import { ApiProperty } from '@nestjs/swagger'

import * as Contracts from '../../../contracts'

class PostSignInData {
  @ApiProperty({ type: Contracts.Common.UserInfo })
  user?: Contracts.Common.UserInfo

  @ApiProperty({ type: Contracts.Common.Tokens })
  tokens?: Contracts.Common.Tokens
}

export class PostSignInResponse {
  @ApiProperty({ example: 200, description: 'The status code of the API response' })
  status_code: number

  @ApiProperty({
    example: 'You have successfully logged in!',
    description: 'The message of the API response',
  })
  message: string

  @ApiProperty({ type: PostSignInData })
  data: PostSignInData
}
