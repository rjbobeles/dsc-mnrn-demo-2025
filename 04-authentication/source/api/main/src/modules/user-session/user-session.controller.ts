import { ErrorCodes } from '@dsc-demo/utils/ErrorCodes'
import { HttpException } from '@dsc-demo/utils/exception'
import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FastifyReply, FastifyRequest } from 'fastify'
import { FilterQuery, Types } from 'mongoose'

import { GetListUserSessionsQueryDto } from './dto/get-list_user_sessions-query.dto'
import { GetReadUserSessionsResponse } from './dto/get-list_user_sessions-response.dto'
import { PostRefreshTokenResponse } from './dto/post-refresh_token-response.dto'
import { PostRevokeUserSessionParam } from './dto/post-revoke_user_session-param.dto'
import { PostRevokeUserSessionResponse } from './dto/post-revoke_user_session-response.dto'
import { PostSignOutResponse } from './dto/post-sign_out-response.dto'
import { UserSessionService } from './user-session.service'

import { DeviceIdGuard, JwtAccessTokenGuard, JwtRefreshTokenGuard } from '../../guards'
import { UserSessionSchema } from '../../schema'

@ApiTags('User Session')
@ApiHeader({
  name: 'device_id',
  description: 'The device id assigned to your device',
  example: '860da268-f82e-4df9-9059-64a23758431e',
  required: true,
})
@UseGuards(DeviceIdGuard)
@Controller('user/session')
export class UserSessionController {
  constructor(private readonly userSessionService: UserSessionService) {}

  @ApiOperation({ summary: 'List user sessions' })
  @ApiResponse({ status: 200, description: 'Successful retrieving sessions', type: GetReadUserSessionsResponse })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('ACCESS_TOKEN')
  @UseGuards(JwtAccessTokenGuard)
  @Get('/')
  public async list_sessions(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Query() query: GetListUserSessionsQueryDto,
  ): Promise<GetReadUserSessionsResponse> {
    const searchQuery: FilterQuery<UserSessionSchema.UserSession> = {}

    if (!query.status || (query.status.includes('active') && !query.status.includes('expired'))) {
      searchQuery.expires_at = { $gt: new Date() }
      searchQuery.$or = [{ invalidated_at: { $exists: false } }, { invalidated_at: undefined }]
    } else if (query.status.includes('expired') && !query.status.includes('active')) {
      searchQuery.$or = [{ invalidated_at: { $exists: true, $ne: null } }, { expires_at: { $lt: new Date() } }]
    }

    const data = await this.userSessionService.list_sessions(
      new Types.ObjectId(req.user.data._id),
      searchQuery,
      { nonce: 0 },
      { skip: query.skip !== undefined ? query.skip : 0, limit: query.limit ? query.limit : 10 },
    )

    return res.send({
      status_code: 200,
      message: 'You have successfully refreshed the session!',
      data: {
        count: data.count,
        sessions: data.sessions.map((session) => ({ ...session, current: session._id === req.user?.session?._id })),
      },
    })
  }

  @ApiOperation({ summary: 'Log out of the existing user session' })
  @ApiResponse({ status: 200, description: 'Successful logging out of the user session', type: PostSignOutResponse })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('ACCESS_TOKEN')
  @UseGuards(JwtAccessTokenGuard)
  @Post('/log_out')
  public async logout_session(@Req() req: FastifyRequest, @Res() res: FastifyReply): Promise<PostSignOutResponse> {
    const session = await this.userSessionService.find_session(new Types.ObjectId(req.user.data._id), new Types.ObjectId(req.user.session._id))
    if (!session) throw new HttpException(ErrorCodes.USER_SESSION_INVALID, 'Session ID is invalid', HttpStatus.BAD_REQUEST)

    if (session.invalidated_at !== null || new Date(session.expires_at as Date) < new Date())
      throw new HttpException(ErrorCodes.USER_SESSION_INVALID, 'Session is expired or is no longer valid', HttpStatus.BAD_REQUEST)

    await this.userSessionService.cancel_session(new Types.ObjectId(req.user.data._id), new Types.ObjectId(session._id))

    return res.send({
      status_code: 200,
      message: 'You have successfully logged out!',
    })
  }

  @ApiOperation({ summary: 'Refresh the current session tokens' })
  @ApiResponse({ status: 200, description: 'Successful refreshing the user session', type: PostRefreshTokenResponse })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('REFRESH_TOKEN')
  @UseGuards(JwtRefreshTokenGuard)
  @Post('/refresh')
  public async refresh_session(@Req() req: FastifyRequest, @Res() res: FastifyReply): Promise<PostRefreshTokenResponse> {
    const session = await this.userSessionService.find_session(new Types.ObjectId(req.user?.data._id), new Types.ObjectId(req.user?.session._id))
    if (!session || session.device_id !== (req.headers['device_id'] as string))
      throw new HttpException(ErrorCodes.USER_SESSION_INVALID, 'Session ID is invalid', HttpStatus.BAD_REQUEST)

    if (session.invalidated_at !== null || new Date(session.expires_at as Date) < new Date())
      throw new HttpException(ErrorCodes.USER_SESSION_INVALID, 'Session is expired or is no longer valid', HttpStatus.BAD_REQUEST)

    const refreshedSession = await this.userSessionService.refresh_session(
      req.headers['device_id'] as string,
      req.ip === '::1' ? '127.0.0.1' : req.ip,
      new Types.ObjectId(req.user?.data._id),
      new Types.ObjectId(req.user?.session._id),
    )
    if (!refreshedSession) throw new HttpException(ErrorCodes.USER_SESSION_UPDATE_FAILED, 'Unable to refresh session', HttpStatus.BAD_REQUEST)

    return res.send({
      status_code: 200,
      message: 'You have successfully refreshed the session!',
      data: {
        user: {
          _id: req.user?.data._id?.toString(),
          first_name: req.user?.data.first_name,
          last_name: req.user?.data.last_name,
          email_verified: req.user?.data.email_verified,
        },
        tokens: refreshedSession.tokens,
      },
    })
  }

  @ApiOperation({ summary: 'Invalidate a user session' })
  @ApiResponse({ status: 200, description: 'Successful invalidating the user session', type: PostRevokeUserSessionResponse })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('ACCESS_TOKEN')
  @UseGuards(JwtAccessTokenGuard)
  @Post('revoke/:session_id')
  public async revoke_session(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Param() param: PostRevokeUserSessionParam,
  ): Promise<PostRevokeUserSessionResponse> {
    const session = await this.userSessionService.find_session(new Types.ObjectId(req.user.data._id), new Types.ObjectId(param.session_id))
    if (!session) throw new HttpException(ErrorCodes.USER_SESSION_INVALID, 'Session ID is invalid', HttpStatus.BAD_REQUEST)

    if (session.invalidated_at !== null || new Date(session.expires_at as Date) < new Date())
      throw new HttpException(ErrorCodes.USER_SESSION_INVALID, 'Session is expired or is no longer valid', HttpStatus.BAD_REQUEST)

    await this.userSessionService.cancel_session(new Types.ObjectId(req.user.data._id), new Types.ObjectId(session._id))

    return res.send({
      status_code: 200,
      message: 'Successfully revoked the session access!',
    })
  }
}
