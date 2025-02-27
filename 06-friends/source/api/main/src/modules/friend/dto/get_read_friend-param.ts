import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class GetReadFriendParam {
  @ApiProperty({ type: String, example: '677f4b07c54c2ea12b43b8f9', description: 'The ID of the friend entity' })
  @IsNotEmpty({ message: 'Enterprise ID cannot be empty' })
  @IsMongoId({ message: 'Enterprise ID needs to be a valid ID' })
  friend_id?: string
}
