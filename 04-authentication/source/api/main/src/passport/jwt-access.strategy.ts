import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PassportStrategy } from '@nestjs/passport'
import { Types } from 'mongoose'
import { ExtractJwt, Strategy } from 'passport-jwt'

import * as Contracts from '../contracts'
import { RequestUserData } from '../interface/RequestUserData'

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt_public_access_key') as string,
    })
  }

  async validate(payload: {
    _id: string
    _sessionId: string
    nonce: string
    sub: string
    iat: number
    exp: number
  }): Promise<RequestUserData | undefined> {
    const session: Contracts.UserSession.Event.ValidateSessionResponse[] = await this.eventEmitter.emitAsync(
      Contracts.UserSession.NAME,
      new Contracts.UserSession.Event.ValidateSessionPayload(new Types.ObjectId(payload._id), new Types.ObjectId(payload._sessionId), payload.nonce),
    )

    let user: Contracts.User.Event.GetUserResponse[]
    if (session[0].session)
      user = await this.eventEmitter.emitAsync(Contracts.User.NAME, new Contracts.User.Event.GetUserPayload(new Types.ObjectId(payload._id)))

    return user[0].user !== null && session[0].session !== null ? { data: user[0].user, session: session[0].session } : undefined
  }
}
