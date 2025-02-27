import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { HealthCheckResult } from '@nestjs/terminus'
import { FastifyReply } from 'fastify'

import { GetServiceInfoResponse } from './dto/get-service_info-response.dto'
import { ServiceService } from './service.service'

@ApiTags('Service')
@Controller()
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @ApiOperation({ summary: 'Get information about the service' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of service info',
    type: GetServiceInfoResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Get('/info')
  public async getInfo(@Res() res: FastifyReply): Promise<GetServiceInfoResponse> {
    return res.send(this.serviceService.getInfo())
  }

  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  @Get('/health')
  public async getHealth(@Res() res: FastifyReply): Promise<HealthCheckResult> {
    return res.send(await this.serviceService.getHealth())
  }
}
