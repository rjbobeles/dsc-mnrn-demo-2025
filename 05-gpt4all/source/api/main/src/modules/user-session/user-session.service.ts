import crypto from 'crypto'

import { ErrorCodes } from '@dsc-demo/utils/ErrorCodes'
import { HttpException } from '@dsc-demo/utils/exception'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, ProjectionType, Types } from 'mongoose'

import * as Contracts from '../../contracts'
import { UserSessionSchema } from '../../schema'

@Injectable()
export class UserSessionService {
  constructor(
    @InjectModel(UserSessionSchema.SCHEMA_NAME) private userSessionModel: Model<UserSessionSchema.UserSession>,
    @Inject('JWT_ACCESS') private readonly jwtAccessService: JwtService,
    @Inject('JWT_REFRESH') private readonly jwtRefreshService: JwtService,
    private eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(Contracts.UserSession.NAME)
  public async handle_event(payload: object) {
    if (payload instanceof Contracts.UserSession.Event.CreateSessionPayload) {
      const eventResponse = new Contracts.UserSession.Event.CreateSessionResponse()
      const session = await this.create_session(payload.device_id, payload.ip_address, payload.user_id, payload.user_agent)

      eventResponse.session = session !== null ? session.session : null
      eventResponse.tokens = session !== null ? session.tokens : null

      return eventResponse
    } else if (payload instanceof Contracts.UserSession.Event.CancelAllSessionsPayload) {
      const eventResponse = new Contracts.UserSession.Event.CancelAllSessionsResponse()

      eventResponse.success = await this.cancel_all_sessions(payload.user_id)
      return eventResponse
    } else if (payload instanceof Contracts.UserSession.Event.CancelSessionPayload) {
      const eventResponse = new Contracts.UserSession.Event.CancelSessionResponse()
      eventResponse.success = await this.cancel_session(payload.user_id, payload.session_id)

      return eventResponse
    } else if (payload instanceof Contracts.UserSession.Event.RefreshSessionPayload) {
      const eventResponse = new Contracts.UserSession.Event.RefreshSessionResponse()
      const session = await this.refresh_session(payload.device_id, payload.ip_address, payload.user_id, payload.session_id)

      eventResponse.session = session !== null ? session.session : null
      eventResponse.tokens = session !== null ? session.tokens : null

      return eventResponse
    } else if (payload instanceof Contracts.UserSession.Event.ValidateSessionPayload) {
      const eventResponse = new Contracts.UserSession.Event.ValidateSessionResponse()
      const session = await this.validate_session(payload.user_id, payload.session_id, payload.nonce)

      if (session) eventResponse.session = session.session

      return eventResponse
    } else throw new HttpException(ErrorCodes.SERVER_EVENT_UNSUPPORTED, 'Unsupported event. (User Session)', HttpStatus.INTERNAL_SERVER_ERROR)
  }

  public async cancel_all_sessions(user_id: Types.ObjectId): Promise<boolean> {
    const user: Contracts.User.Event.GetUserResponse[] = await this.eventEmitter.emitAsync(
      Contracts.User.NAME,
      new Contracts.User.Event.GetUserPayload(new Types.ObjectId(user_id)),
    )
    if (!user[0].user) return false

    const deleteAck = await this.userSessionModel.updateMany(
      {
        _userId: user[0].user._id,
        expires_at: { $gt: new Date() },
        $or: [{ invalidated_at: { $exists: false } }, { invalidated_at: undefined }],
      },
      { $set: { invalidated_at: new Date(), updated_at: new Date() } },
    )

    return deleteAck.acknowledged
  }

  public async cancel_session(user_id: Types.ObjectId, session_id: Types.ObjectId): Promise<boolean> {
    const user: Contracts.User.Event.GetUserResponse[] = await this.eventEmitter.emitAsync(
      Contracts.User.NAME,
      new Contracts.User.Event.GetUserPayload(new Types.ObjectId(user_id)),
    )
    if (!user[0].user) return false

    const deleteAck = await this.userSessionModel.updateOne(
      {
        _id: session_id,
        _userId: user[0].user._id,
      },
      { $set: { invalidated_at: new Date(), updated_at: new Date() } },
    )

    return deleteAck.modifiedCount === 1
  }

  public async create_session(
    device_id: string,
    ip_address: string,
    user_id: Types.ObjectId,
    user_agent: UserSessionSchema.UserAgentData,
  ): Promise<{ session: UserSessionSchema.UserSession; tokens: Contracts.Common.Tokens | null } | null> {
    const user: Contracts.User.Event.GetUserResponse[] = await this.eventEmitter.emitAsync(
      Contracts.User.NAME,
      new Contracts.User.Event.GetUserPayload(new Types.ObjectId(user_id)),
    )
    if (!user[0].user) return null

    const session = await this.userSessionModel.create({
      _userId: new Types.ObjectId(user_id),
      device_id,
      nonce: crypto.randomBytes(30).toString('hex'),
      ip_address,
      user_agent,
      last_used_at: new Date(),
      invalidated_at: null,
      expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
      created_at: new Date(),
      updated_at: new Date(),
    })

    return { session, tokens: await this.sign_tokens(user_id, session._id) }
  }

  public async find_session(user_id: Types.ObjectId, session_id: Types.ObjectId): Promise<UserSessionSchema.UserSession | null> {
    return this.userSessionModel.findOne({
      _id: new Types.ObjectId(session_id),
      _userId: new Types.ObjectId(user_id),
    })
  }

  public async list_sessions(
    user_id: Types.ObjectId,
    query: FilterQuery<UserSessionSchema.UserSession>,
    projection?: ProjectionType<UserSessionSchema.UserSession>,
    pagination?: { skip: number; limit: number },
  ): Promise<{ count: number; sessions: UserSessionSchema.UserSession[] }> {
    const searchQuery: FilterQuery<UserSessionSchema.UserSession> = {
      _userId: new Types.ObjectId(user_id),
      ...query,
    }

    return {
      count: await this.userSessionModel.countDocuments(searchQuery),
      sessions: await this.userSessionModel.find(searchQuery, projection, pagination).lean(),
    }
  }

  public async refresh_session(
    device_id: string,
    ip_address: string,
    user_id: Types.ObjectId,
    session_id: Types.ObjectId,
  ): Promise<{ session: UserSessionSchema.UserSession; tokens: Contracts.Common.Tokens } | null> {
    const sessionUpdateAck = await this.userSessionModel.updateOne(
      {
        _userId: new Types.ObjectId(user_id),
        _id: new Types.ObjectId(session_id),
        device_id,
        expires_at: { $gt: new Date() },
        $or: [{ invalidated_at: { $exists: false } }, { invalidated_at: undefined }],
      },
      {
        $set: {
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address,
          last_used_at: new Date(),
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          updated_at: new Date(),
        },
      },
    )
    if (sessionUpdateAck.modifiedCount !== 1) return null

    const session = (await this.userSessionModel
      .findOne({
        _userId: new Types.ObjectId(user_id),
        _id: new Types.ObjectId(session_id),
      })
      .exec()) as UserSessionSchema.UserSession

    return { session: session, tokens: await this.sign_tokens(user_id, session_id) }
  }

  public async sign_tokens(user_id: Types.ObjectId, session_id: Types.ObjectId): Promise<Contracts.Common.Tokens> {
    const session = await this.userSessionModel.findOne({
      _id: new Types.ObjectId(session_id),
      _userId: new Types.ObjectId(user_id),
      expires_at: { $gt: new Date() },
      $or: [{ invalidated_at: { $exists: false } }, { invalidated_at: undefined }],
    })
    if (!session) return {}

    const refresh_token = await this.jwtRefreshService.signAsync({
      _id: session._userId,
      _sessionId: session._id,
      sub: session._userId,
      nonce: session.nonce,
    })

    const refresh_decoded = this.jwtRefreshService.decode(refresh_token)
    await this.userSessionModel.updateOne({ _id: session._id }, { $set: { expires_at: new Date(refresh_decoded.exp * 1000) } })

    return {
      access_token: await this.jwtAccessService.signAsync({
        _id: session._userId,
        _sessionId: session._id,
        nonce: session.nonce,
        sub: session._userId,
      }),
      refresh_token,
    }
  }

  public async validate_session(
    user_id: Types.ObjectId,
    session_id: Types.ObjectId,
    nonce: string,
  ): Promise<{ session: UserSessionSchema.UserSession } | null> {
    const session = await this.userSessionModel.findOne({
      _id: new Types.ObjectId(session_id),
      _userId: new Types.ObjectId(user_id),
      nonce: nonce,
      expires_at: { $gt: new Date() },
      $or: [{ invalidated_at: { $exists: false } }, { invalidated_at: undefined }],
    })
    if (!session) return null

    return { session }
  }
}
