import { Module } from '@nestjs/common'

import { Gpt4AllService } from './gpt4all.service'

@Module({
  imports: [],
  providers: [Gpt4AllService],
  controllers: [],
  exports: [],
})
export class Gpt4allModule {}
