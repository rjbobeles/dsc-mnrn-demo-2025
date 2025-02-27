import { ValidationException } from '@dsc-demo/utils/exception'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { IsNotEmpty, IsString, IsUUID, validateSync, ValidationError } from 'class-validator'

class DeviceIdDto {
  @IsNotEmpty({ message: 'Device ID cannot be empty' })
  @IsString({ message: 'Device ID needs to be a string' })
  @IsUUID('4', { message: 'Device ID must be a valid UUID' })
  device_id?: string

  constructor(deviceId: string) {
    this.device_id = deviceId
  }
}

@Injectable()
export class DeviceIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const deviceId = request.headers['device_id']

    const validation = this.isValidUUIDv4(deviceId)
    if (validation.length > 0) throw new ValidationException(validation)
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  private isValidUUIDv4(id: string): ValidationError[] {
    return validateSync(new DeviceIdDto(id))
  }
}
