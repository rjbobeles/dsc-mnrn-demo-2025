import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { HydratedDocument, Types } from 'mongoose'

export const SCHEMA_NAME = 'user_sessions'

@Schema({ _id: false })
export class UserAgentData {
  @ApiProperty({
    type: String,
    example: 'Safari',
    description: 'The browser of the user agent',
  })
  @Prop({ type: String, maxlength: 255, default: '' })
  browser?: string

  @ApiProperty({
    type: String,
    example: '17.5.0',
    description: 'The version of the user agent',
  })
  @Prop({ type: String, maxlength: 255, default: '' })
  version?: string

  @ApiProperty({
    type: String,
    example: 'Mac OS X',
    description: 'The os of the user agent',
  })
  @Prop({ type: String, maxlength: 255, default: '' })
  os?: string

  @ApiProperty({
    type: String,
    example: 'Other',
    description: 'The platform of the user agent',
  })
  @Prop({ type: String, maxlength: 255, default: '' })
  platform?: string

  @ApiProperty({
    type: String,
    example: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    description: 'The original source of user agent',
  })
  @Prop({ type: String, maxlength: 255, default: '' })
  source?: string
}

export const UserSessionDataSchema = SchemaFactory.createForClass(UserAgentData)

@Schema({ collection: SCHEMA_NAME })
export class UserSession {
  @ApiProperty({ type: String, example: '6651f4dd6f803df7e1e1e27e', description: 'The ID of the session' })
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id?: Types.ObjectId

  @ApiProperty({ type: String, example: '6651a1a7e12e4f5f72c71ab9', description: "The user's ID" })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  _userId?: Types.ObjectId

  @ApiProperty({
    type: String,
    example: '860da268-f82e-4df9-9059-64a23758431e',
    description: 'The device ID unique to the device being used',
  })
  @Prop({ type: Types.UUID, default: '' })
  device_id?: string

  @Prop({ type: String, minlength: 60, maxlength: 70, default: '' })
  nonce?: string

  @ApiProperty({ example: '192.168.1.1', description: 'The ip address of where the session was being used' })
  @Prop({ type: String, maxlength: 100, default: '' })
  ip_address?: string

  @ApiProperty({ type: UserAgentData })
  @Prop({ type: UserSessionDataSchema })
  user_agent?: UserAgentData

  @ApiProperty({ example: '2024-05-25T14:20:50.010+00:00', description: 'The date when session was last used' })
  @Prop({ type: Date, default: Date.now })
  last_used_at?: Date

  @ApiProperty({ example: null, nullable: true, description: 'The date when session was invalidated', required: false })
  @Prop({ type: Date, default: null })
  invalidated_at?: Date

  @ApiProperty({
    example: '2024-06-01T14:20:50.000+00:00',
    nullable: true,
    description: 'The date when session is going to expire',
  })
  @Prop({ type: Date, default: () => new Date((Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60) * 1000) })
  expires_at?: Date

  @ApiProperty({ example: '2024-05-25T14:20:50.010+00:00', description: 'The date when session was created' })
  @Prop({ type: Date, default: Date.now })
  created_at?: Date

  @ApiProperty({ example: '2024-05-25T14:20:50.010+00:00', description: 'The date when session was last updated' })
  @Prop({ type: Date, default: Date.now })
  updated_at?: Date
}

export type UserSessionDocument = HydratedDocument<UserSession>

export const UserSessionSchema = SchemaFactory.createForClass(UserSession)
