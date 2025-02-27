import { ExceptionHandler } from '@dsc-demo/utils/ExceptionHandler'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import databaseConfig from './config/databaseConfig'
import environmentSchema from './config/environmentSchema'
import generalConfig from './config/generalConfig'
import jwtConfig from './config/jwtConfig'
import { ServiceModule } from './modules/service/service.module'
import { UserAuthenticationModule } from './modules/user-authentication/user-authentication.module'
import { UserSessionModule } from './modules/user-session/user-session.module'
// eslint-disable-next-line import/order
import { UserModule } from './modules/user/user.module'
import { JwtAccessStrategy, JwtRefreshStrategy, LocalStrategy } from './passport'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [generalConfig, jwtConfig, databaseConfig],
      validationSchema: environmentSchema,
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({ wildcard: true }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => {
        return {
          uri: `${cs.get<string>('mongo_connection_string')}`,
          dbName: cs.get<string>('mongo_database_name'),
          // Keep trying to send operations for 5 seconds
          serverSelectionTimeoutMS: 5000,
          // Close sockets after 45 seconds of inactivity
          socketTimeoutMS: 45000,
          // Keep trying to send operations for 300 seconds
          connectTimeoutMS: 300000,
          // Maintain up to 10 socket connections
          maxPoolSize: 10,
          // Number of times to retry initial connection
          retryAttempts: 3,
          // Delay between retry attempts (in milliseconds)
          retryDelay: 5000,
          // Keep retrying for 300 seconds
          retryWrites: true,
          // Heartbeat to check connection every 30 seconds
          heartbeatFrequencyMS: 30000,
        }
      },
      inject: [ConfigService],
    }),

    // Modules
    ServiceModule,
    UserAuthenticationModule,
    UserModule,
    UserSessionModule,
  ],
  controllers: [],
  providers: [
    // Strategies
    LocalStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,

    // Exception Handler
    {
      provide: APP_FILTER,
      useClass: ExceptionHandler,
    },
  ],
  exports: [],
})
export class MainModule {}
