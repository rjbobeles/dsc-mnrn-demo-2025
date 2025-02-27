import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UserAuthenticationController } from './user-authentication.controller'
import { UserAuthenticationService } from './user-authentication.service'

import { UserSchema } from '../../schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: UserSchema.SCHEMA_NAME, schema: UserSchema.UserSchema }])],
  providers: [UserAuthenticationService],
  controllers: [UserAuthenticationController],
  exports: [],
})
export class UserAuthenticationModule {}
