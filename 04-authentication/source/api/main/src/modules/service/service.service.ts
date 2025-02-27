import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HealthCheckResult, HealthCheckService, HttpHealthIndicator, MicroserviceHealthIndicator } from '@nestjs/terminus'

import { GetServiceInfoResponse } from './dto/get-service_info-response.dto'

@Injectable()
export class ServiceService {
  constructor(
    private readonly configService: ConfigService,
    private readonly health: HealthCheckService,
    private readonly httpHealthIndicator: HttpHealthIndicator,
    private readonly microserviceHealthIndicator: MicroserviceHealthIndicator,
  ) {}

  public getInfo(): GetServiceInfoResponse {
    return {
      name: this.configService.get<string>('name') as string,
      version: this.configService.get<string>('version') as string,
      environment_name: this.configService.get<string>('environment_name') as string,
      prod_features_enabled: this.configService.get<boolean>('production_features') as boolean,
      message: `${this.configService.get<string>('name')} service is running perfectly!`,
    }
  }

  public async getHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.httpHealthIndicator.pingCheck('self-http', `http://0.0.0.0:${this.configService.get<number>('http_port')}/info`, { timeout: 2000 }),
    ])
  }
}
