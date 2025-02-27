import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { HydratedDocument, Types } from 'mongoose'

export const SCHEMA_NAME = 'friend'

@Schema({ collection: SCHEMA_NAME })
export class Friend {
   @ApiProperty({ type: String, example: '6380b5d09b8793f1a8d03f62', description: 'The ID of the user' })
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id?: Types.ObjectId

  @ApiProperty({ type: String, example: 'John', description: 'The first name of the user' })
  @Prop({ type: String, default: '', maxlength: 255 })
  first_name?: string

  @ApiProperty({ type: String, example: 'Doe', description: 'The last name of the user' })
  @Prop({ type: String, default: '', maxlength: 255 })
  last_name?: string

  @ApiProperty({ type: String, example: 'john.doe@gmail.com', description: 'The email of the user' })
  @Prop({ type: String, default: '', maxlength: 300, unique: true })
  email?: string

  @ApiProperty({ type: [String], example: ['Football', 'Basketball'], description: 'The email of the user' })
  @Prop({ type: [String], default: [], maxlength: 300 })
  hobbies?: string[]

  @ApiProperty({ example: '2024-05-25T14:20:50.010+00:00', description: 'The date when user was created' })
  @Prop({ type: Date, default: Date.now })
  created_at?: Date

  @ApiProperty({ example: '2024-05-25T14:20:50.010+00:00', description: 'The date when user was last updated' })
  @Prop({ type: Date, default: Date.now })
  updated_at?: Date
}

export type FriendDocument = HydratedDocument<Friend>

export const FriendSchema = SchemaFactory.createForClass(Friend)
