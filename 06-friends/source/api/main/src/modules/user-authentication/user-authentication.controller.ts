import { ErrorCodes } from '@dsc-demo/utils/ErrorCodes'
import { HttpException } from '@dsc-demo/utils/exception'
import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FastifyReply, FastifyRequest } from 'fastify'
import { Types } from 'mongoose'

import { PostSignInBodyDto } from './dto/post-sign_in-body.dto'
import { PostSignInResponse } from './dto/post-sign_in-response.dto'
import { PostSignUpBodyDto } from './dto/post-sign_up-body.dto'
import { PostSignUpResponse } from './dto/post-sign_up-response.dto'
import { UserAuthenticationService } from './user-authentication.service'

import * as Contracts from '../../contracts'
import { DeviceIdGuard, LocalAuthGuard } from '../../guards'

@ApiTags('User Authentication')
@ApiHeader({
  name: 'device_id',
  description: 'The device id assigned to your device',
  example: '860da268-f82e-4df9-9059-64a23758431e',
  required: true,
})
@UseGuards(DeviceIdGuard)
@Controller('user/auth')
export class UserAuthenticationController {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly userAuthenticationService: UserAuthenticationService,
  ) {}

  @ApiOperation({ summary: 'Login with a username and password into the service' })
  @ApiResponse({ status: 200, description: 'Successful login to the user account', type: PostSignInResponse })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/sign_in')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async sign_in(@Req() req: FastifyRequest, @Res() res: FastifyReply, @Body() body: PostSignInBodyDto): Promise<PostSignInResponse> {
    const user: Contracts.User.Event.GetUserResponse[] = await this.eventEmitter.emitAsync(
      Contracts.User.NAME,
      new Contracts.User.Event.GetUserPayload(new Types.ObjectId(req.user.data._id)),
    )
    if (!user[0].user) throw new HttpException(ErrorCodes.ACCOUNT_NOT_FOUND, 'User not found!', HttpStatus.INTERNAL_SERVER_ERROR)

    const userAgent = UserAuthenticationService.computeUserAgent(req.headers['user-agent'])
    const session: Contracts.UserSession.Event.CreateSessionResponse[] = await this.eventEmitter.emitAsync(
      Contracts.UserSession.NAME,
      new Contracts.UserSession.Event.CreateSessionPayload(
        req.headers['device_id'] as string,
        req.ip === '::1' ? '127.0.0.1' : (req.ip as string),
        new Types.ObjectId(user[0].user._id),
        userAgent,
      ),
    )

    if (!session[0].session || !session[0].tokens)
      throw new HttpException(
        ErrorCodes.USER_SESSION_CREATION_FAILED,
        'Unable to create user session. Please try again or contact support.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )

    return res.send({
      status_code: 200,
      message: 'You have successfully logged in!',
      data: { user: user[0].user, tokens: session[0].tokens },
    })
  }

  @ApiOperation({ summary: 'Register an account to use in the service' })
  @ApiResponse({ status: 200, description: 'Successful registration of user account', type: PostSignUpResponse })
  @HttpCode(HttpStatus.OK)
  @Post('/sign_up')
  public async sign_up(@Req() req: FastifyRequest, @Res() res: FastifyReply, @Body() body: PostSignUpBodyDto): Promise<PostSignUpResponse> {
    const userAgent = UserAuthenticationService.computeUserAgent(req.headers['user-agent'])
    const user = await this.userAuthenticationService.create_user({
      first_name: body.first_name as string,
      last_name: body.last_name as string,
      email: body.email as string,
      password: body.password as string,
    })


    if (!user)
      throw new HttpException(
        ErrorCodes.ACCOUNT_CREATION_FAILED,
        'Request could not be completed. Please try again or contact support.',
        HttpStatus.BAD_REQUEST,
      )

    const session: Contracts.UserSession.Event.CreateSessionResponse[] = await this.eventEmitter.emitAsync(
      Contracts.UserSession.NAME,
      new Contracts.UserSession.Event.CreateSessionPayload(
        req.headers['device_id'] as string,
        req.ip === '::1' ? '127.0.0.1' : (req.ip as string),
        user._id,
        userAgent,
      ),
    )

    if (!session[0].session || !session[0].tokens)
      throw new HttpException(
        ErrorCodes.USER_SESSION_CREATION_FAILED,
        'Unable to create user session. Please try again or contact support.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )

    delete user.password

    return res.send({
      status_code: 200,
      message: 'You have successfully registered!',
      data: {
        user: user,
        tokens: session[0].tokens,
      },
    })
  }
}
