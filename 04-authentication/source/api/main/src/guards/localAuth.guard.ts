import { ErrorCodes } from '@dsc-demo/utils/ErrorCodes'
import { HttpException } from '@dsc-demo/utils/exception'
import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  override canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }

  // eslint-disable-next-line class-methods-use-this
  override handleRequest(err: Error | HttpException, user: never, info: { message: string }) {
    if (err instanceof HttpException) throw err
    if (!user) throw new HttpException(ErrorCodes.USER_AUTHENTICATION_ERROR, 'Invalid username or password.', HttpStatus.BAD_REQUEST)
    if (!info) return user

    switch (info.message) {
      case 'Missing credentials':
        throw new HttpException(ErrorCodes.USER_AUTHENTICATION_ERROR, 'A username and a password need to be provided.', HttpStatus.BAD_REQUEST)

      default:
        throw new HttpException(ErrorCodes.USER_AUTHENTICATION_ERROR, info.message, HttpStatus.BAD_REQUEST)
    }
  }
}
