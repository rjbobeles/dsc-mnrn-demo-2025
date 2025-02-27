import { ExceptionHandler } from '@dsc-demo/utils/ExceptionHandler'
import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'

import environmentSchema from './config/environmentSchema'
import generalConfig from './config/generalConfig'
import { ServiceModule } from './modules/service/service.module'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [generalConfig],
      validationSchema: environmentSchema,
    }),
    EventEmitterModule.forRoot({ wildcard: true }),

    // Modules
    ServiceModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionHandler,
    },
  ],
  exports: [],
})
export class MainModule {}
