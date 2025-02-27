import { ErrorCodes } from '@dsc-demo/utils/ErrorCodes'
import { HttpException } from '@dsc-demo/utils/exception'
import { HttpStatus, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import * as Contracts from '../contracts'
import { UserSchema } from '../schema'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super()
  }

  async validate(username: string, password: string): Promise<{ data: UserSchema.User }> {
    const user: Contracts.UserAuthentication.Event.ValidateUserResponse[] = await this.eventEmitter.emitAsync(
      Contracts.UserAuthentication.NAME,
      new Contracts.UserAuthentication.Event.ValidateUserPayload({ email: username, password }),
    )

    if (!user[0].user) throw new HttpException(ErrorCodes.INVALID_CREDENTIALS, 'Invalid username or password', HttpStatus.UNAUTHORIZED)

    return {
      data: user[0].user,
    }
  }
}
