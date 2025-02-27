import { ErrorCodes } from '@dsc-demo/utils/ErrorCodes'
import { HttpException } from '@dsc-demo/utils/exception'
import { HttpStatus, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import bcrypt from 'bcryptjs'
import { Model } from 'mongoose'
import useragent from 'useragent'

import * as Contracts from '../../contracts'
import { UserSchema } from '../../schema'

@Injectable()
export class UserAuthenticationService {
  constructor(@InjectModel(UserSchema.SCHEMA_NAME) private userModel: Model<UserSchema.User>) {}

  static computeUserAgent(userAgent: string): {
    browser: string
    version: string
    os: string
    platform: string
    source: string
  } {
    const parsedUserAgent = useragent.parse(userAgent)

    return {
      browser: parsedUserAgent.family,
      version: parsedUserAgent.toVersion(),
      os: parsedUserAgent.os.family,
      platform: parsedUserAgent.device.family,
      source: userAgent,
    }
  }

  @OnEvent(Contracts.UserAuthentication.NAME)
  public async handle_event(payload: object) {
    if (payload instanceof Contracts.UserAuthentication.Event.ValidateUserPayload) {
      const eventResponse = new Contracts.UserAuthentication.Event.ValidateUserResponse()
      eventResponse.user = await this.validate_user(payload.payload)

      return eventResponse
    } else throw new HttpException(ErrorCodes.SERVER_EVENT_UNSUPPORTED, 'Unsupported event. (User Authentication)', HttpStatus.INTERNAL_SERVER_ERROR)
  }

  public async create_user(payload: {
    first_name: string
    last_name: string
    email: string
    password: string
  }): Promise<UserSchema.UserDocument | null> {
    const user = await this.find_user_by_email(payload.email)
    if (user) return null

    return this.userModel.create({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      password: bcrypt.hashSync(payload.password, 10),
    })
  }

  public async validate_user(payload: { email: string; password: string }): Promise<UserSchema.UserDocument | null> {
    const user = await this.find_user_by_email(payload.email)
    if (!user) return null

    const passMatch = await bcrypt.compare(payload.password, user.password as string)
    if (!passMatch) return null

    return user
  }

  public async find_user_by_email(email: string): Promise<UserSchema.UserDocument | null> {
    return this.userModel.findOne({ email }).exec()
  }
}
