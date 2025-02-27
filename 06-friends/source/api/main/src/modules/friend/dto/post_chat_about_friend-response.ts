import { ApiProperty } from "@nestjs/swagger"

export class PostChatAboutFriendResponse {
   @ApiProperty({ example: 200, description: 'The statusCode of the API response' })
    status_code: number

    @ApiProperty({
      example: 'Successfully retrieved friends!',
      description: 'The message of the API response',
    })
    message: string

    @ApiProperty({
      example: '<AI TEXT>',
      description: 'The message returned by AI',
    })
    data: string
}
