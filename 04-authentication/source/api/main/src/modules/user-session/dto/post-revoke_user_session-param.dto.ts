import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsNotEmpty } from 'class-validator'

export class PostRevokeUserSessionParam {
  @ApiProperty({ example: '6651bd04ca1d0c11ae1e0ce1', description: 'The session ID you wish to invalidate' })
  @IsNotEmpty({ message: 'Session ID cannot be empty' })
  @IsMongoId({ message: 'Session ID needs to be a valid ID' })
  session_id: string
}
