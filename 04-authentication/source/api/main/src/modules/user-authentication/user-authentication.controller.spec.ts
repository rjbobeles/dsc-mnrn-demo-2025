import { Test, TestingModule } from '@nestjs/testing'

import { UserAuthenticationController } from './user-authentication.controller'

describe.skip('UserAuthenticationModuleController', () => {
  let controller: UserAuthenticationController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAuthenticationController],
      providers: [],
    }).compile()

    controller = module.get<UserAuthenticationController>(UserAuthenticationController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
