import { ErrorCodes } from '@dsc-demo/utils/ErrorCodes'
import { HttpException } from '@dsc-demo/utils/exception'
import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import bcrypt from 'bcryptjs'
import { FastifyReply, FastifyRequest } from 'fastify'
import { Types } from 'mongoose'

import { PostChangePasswordBodyDto } from './dto/post-change_password-body.dto'
import { PostChangePasswordResponse } from './dto/post-change_password-response.dto'
import { UserService } from './user.service'

import { DeviceIdGuard, JwtAccessTokenGuard } from '../../guards'

@ApiTags('User')
@ApiHeader({
  name: 'device_id',
  description: 'The device id assigned to your device',
  example: '860da268-f82e-4df9-9059-64a23758431e',
  required: true,
})
@UseGuards(DeviceIdGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: "Change current user's password" })
  @ApiResponse({ status: 200, description: 'Successful updating of user password', type: PostChangePasswordResponse })
  @ApiBearerAuth('ACCESS_TOKEN')
  @Post('/password/change')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessTokenGuard)
  public async change_password(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body() body: PostChangePasswordBodyDto,
  ): Promise<PostChangePasswordResponse> {
    const user = await this.userService.find_user(new Types.ObjectId(req.user.data._id), { _id: 1, password: 1 })
    if (!user) throw new HttpException(ErrorCodes.ACCOUNT_NOT_FOUND, 'User not found!', HttpStatus.INTERNAL_SERVER_ERROR)

    const passMatch = await bcrypt.compare(body.password, user.password)
    if (!passMatch) throw new HttpException(ErrorCodes.ACCOUNT_UPDATE_FAILED, 'Passwords do not match!', HttpStatus.BAD_REQUEST)

    const passMatchNewToOld = await bcrypt.compare(body.new_password, user.password)
    if (passMatchNewToOld)
      throw new HttpException(ErrorCodes.ACCOUNT_UPDATE_FAILED, 'You cannot change your password to your existing password.', HttpStatus.BAD_REQUEST)

    const updateAck = await this.userService.update_user(user._id as Types.ObjectId, { password: body.new_password })
    if (!updateAck) throw new HttpException(ErrorCodes.ACCOUNT_UPDATE_FAILED, 'Unable to update user password.', HttpStatus.BAD_REQUEST)

    // if (body.logout_all_devices) {
    //   await this.eventEmitter.emitAsync(
    //     Contracts.UserService.UserSession.NAME,
    //     new Contracts.UserService.UserSession.Event.CancelAllSessionsPayload(user._id as Types.ObjectId),
    //   )
    // }

    return res.send({ status_code: 200, message: 'Your password has been changed!' })
  }
}
