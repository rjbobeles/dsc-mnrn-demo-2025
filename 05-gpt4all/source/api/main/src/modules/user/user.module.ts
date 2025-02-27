import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UserController } from './user.controller'
import { UserService } from './user.service'

import { UserSchema } from '../../schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: UserSchema.SCHEMA_NAME, schema: UserSchema.UserSchema }])],
  controllers: [UserController],
  providers: [UserService],
  exports: [],
})
export class UserModule {}
