import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PostChatAboutFriendBody {
  @ApiProperty({ example: 'What can I give my friend for christmas?', description: "The question you wan't to ask AI" })
  @IsNotEmpty({ message: 'Question cannot be empty' })
  @IsString({ message: 'Question needs to be a string' })
  question?: string
}
