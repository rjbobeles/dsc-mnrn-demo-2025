import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export const SCHEMA_NAME = 'users'

@Schema({ collection: SCHEMA_NAME })
export class User {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id?: Types.ObjectId

  @Prop({ type: String, default: '', maxlength: 255 })
  first_name?: string

  @Prop({ type: String, default: '', maxlength: 255 })
  last_name?: string

  @Prop({ type: String, default: '', maxlength: 300, unique: true })
  email?: string

  @Prop({ type: String, default: '', maxlength: 300 })
  password?: string

  @Prop({ type: Boolean, default: false })
  email_verified?: boolean

  @Prop({ type: Date, default: Date.now })
  created_at?: Date

  @Prop({ type: Date, default: Date.now })
  updated_at?: Date
}

export type UserDocument = HydratedDocument<User>

export const UserSchema = SchemaFactory.createForClass(User)
