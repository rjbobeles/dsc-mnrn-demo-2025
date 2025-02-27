import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendSchema } from '../../schema';
import { Gpt4allModule } from '../gpt4all/gpt4all.module';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: FriendSchema.SCHEMA_NAME, schema: FriendSchema.FriendSchema }]), Gpt4allModule],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [],
})
export class FriendModule {}
