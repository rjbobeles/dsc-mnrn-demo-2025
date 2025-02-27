import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

import { UserSessionController } from './user-session.controller'
import { UserSessionService } from './user-session.service'

import { UserSessionSchema } from '../../schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: UserSessionSchema.SCHEMA_NAME, schema: UserSessionSchema.UserSessionSchema }])],
  providers: [
    UserSessionService,
    {
      provide: 'JWT_ACCESS',
      useFactory: async (configService: ConfigService) =>
        new JwtService({
          signOptions: { algorithm: 'RS256', expiresIn: '15m' },
          publicKey: configService.get<string>('jwt_public_access_key'),
          privateKey: configService.get<string>('jwt_private_access_key'),
        }),
      inject: [ConfigService],
    },
    {
      provide: 'JWT_REFRESH',
      useFactory: async (configService: ConfigService) =>
        new JwtService({
          signOptions: { algorithm: 'RS256', expiresIn: '7d' },
          publicKey: configService.get<string>('jwt_public_refresh_key'),
          privateKey: configService.get<string>('jwt_private_refresh_key'),
        }),
      inject: [ConfigService],
    },
  ],
  controllers: [UserSessionController],
  exports: ['JWT_ACCESS', 'JWT_REFRESH'],
})
export class UserSessionModule {}
