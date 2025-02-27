import { ApiProperty } from '@nestjs/swagger'

import { UserSessionSchema } from '../../../schema'

class UserSessionExtended extends UserSessionSchema.UserSession {
  @ApiProperty({ example: false, description: 'Determines if the session is the current session' })
  current?: boolean
}

class GetReadUserSessionsData {
  @ApiProperty({
    example: 1,
    description: 'The number of sessions from the filters (if applicable)',
  })
  count?: number

  @ApiProperty({
    type: UserSessionExtended,
    isArray: true,
  })
  sessions?: UserSessionExtended[]
}

export class GetReadUserSessionsResponse {
  @ApiProperty({ example: 200, description: 'The status code of the API response' })
  status_code: number

  @ApiProperty({
    example: 'Successfully retrieved sessions',
    description: 'The message of the API response',
  })
  message: string

  @ApiProperty({ type: GetReadUserSessionsData })
  data: GetReadUserSessionsData
}
