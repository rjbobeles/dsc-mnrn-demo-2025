import { ErrorCodes } from '@dsc-demo/utils/ErrorCodes'
import { HttpException } from '@dsc-demo/utils/exception/'
import { HttpStatus, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import bcrypt from 'bcryptjs'
import { AnyKeys, Model, ProjectionType, Types } from 'mongoose'

import * as Contracts from '../../contracts'
import { UserSchema } from '../../schema'

@Injectable()
export class UserService {
  constructor(@InjectModel(UserSchema.SCHEMA_NAME) private userModel: Model<UserSchema.User>) {}

  @OnEvent(Contracts.User.NAME)
  public async handle_event(payload: object) {
    if (payload instanceof Contracts.User.Event.GetUserPayload) {
      const eventResponse = new Contracts.User.Event.GetUserResponse()
      eventResponse.user = await this.find_user(payload.user_id)

      return eventResponse
    } else if (payload instanceof Contracts.User.Event.GetUserByEmailPayload) {
      const eventResponse = new Contracts.User.Event.GetUserResponse()
      eventResponse.user = await this.find_user_by_email(payload.email)

      return eventResponse
    } else throw new HttpException(ErrorCodes.SERVER_EVENT_UNSUPPORTED, 'Unsupported event. (User)', HttpStatus.INTERNAL_SERVER_ERROR)
  }

  public async update_user(user_id: Types.ObjectId, data: { password?: string; email_verified?: boolean }): Promise<boolean> {
    const updatePayload: AnyKeys<UserSchema.User> = {}

    if (data.password) updatePayload.password = bcrypt.hashSync(data.password, 10)
    if (data.email_verified !== undefined) updatePayload.email_verified = data.email_verified === true

    if (Object.keys(updatePayload).length > 0) updatePayload.updated_at = new Date()

    const updateAck = await this.userModel.updateOne({ _id: user_id }, { $set: updatePayload })
    return updateAck.modifiedCount === 1
  }

  public async find_user(user_id: Types.ObjectId, projection?: ProjectionType<UserSchema.User>): Promise<UserSchema.User | null> {
    return this.userModel.findById(user_id, projection || { password: 0 }).lean()
  }

  public async find_user_by_email(email: string, projection?: ProjectionType<UserSchema.User>): Promise<UserSchema.User | null> {
    return this.userModel.findOne({ email }, projection || { password: 0 }).lean()
  }
}
