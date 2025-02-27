import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'

import { ServiceController } from './service.controller'
import { ServiceService } from './service.service'

@Module({
  imports: [ConfigModule, TerminusModule, HttpModule],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [],
})
export class ServiceModule {}
