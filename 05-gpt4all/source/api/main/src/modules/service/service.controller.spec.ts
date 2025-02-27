import { mockResponse } from '@expense-tracker/utils/test/MockResponse.spec'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { HealthCheckService, TerminusModule } from '@nestjs/terminus'
import { Test, TestingModule } from '@nestjs/testing'
import { FastifyRequest } from 'fastify'

import { ServiceController } from './service.controller'
import { ServiceService } from './service.service'

import generalConfig from '../../config/generalConfig'

jest.mock('../../config/generalConfig', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    name: 'gateway',
    environment_name: 'Development',
    version: '0.0.0',
    production_features: true,
  }),
}))

describe('[Controller] Service Test', () => {
  let controller: ServiceController
  let mockRes

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [generalConfig] }), TerminusModule, HttpModule],
      controllers: [ServiceController],
      providers: [
        ServiceService,
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: 'ok',
              info: {
                'self-http': {
                  status: 'up',
                },
                'main-service-http': {
                  status: 'up',
                },
                'main-service-tcp': {
                  status: 'up',
                },
                'user-service-http': {
                  status: 'up',
                },
                'user-service-tcp': {
                  status: 'up',
                },
              },
              error: {},
              details: {
                'self-http': {
                  status: 'up',
                },
                'main-service-http': {
                  status: 'up',
                },
                'main-service-tcp': {
                  status: 'up',
                },
                'user-service-http': {
                  status: 'up',
                },
                'user-service-tcp': {
                  status: 'up',
                },
              },
            }),
          },
        },
        {
          provide: 'mock_response',
          useValue: mockResponse(),
        },
      ],
    }).compile()

    controller = module.get<ServiceController>(ServiceController)
    mockRes = module.get<FastifyRequest>('mock_response')
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getInfo', () => {
    it('should resolve getInfo', () => {
      controller.getInfo(mockRes)

      expect(mockRes.send).toBeCalledTimes(1)
      expect(mockRes.send).toBeCalledWith({
        name: 'gateway',
        environment_name: 'Development',
        prod_features_enabled: true,
        version: '0.0.0',
        message: `gateway service is running perfectly!`,
      })
    })
  })

  describe('getHealth', () => {
    it('should resolve getHealth', async () => {
      await controller.getHealth(mockRes)

      expect(mockRes.send).toBeCalledTimes(1)
      expect(mockRes.send).toBeCalledWith({
        status: 'ok',
        info: {
          'self-http': {
            status: 'up',
          },
          'main-service-http': {
            status: 'up',
          },
          'main-service-tcp': {
            status: 'up',
          },
          'user-service-http': {
            status: 'up',
          },
          'user-service-tcp': {
            status: 'up',
          },
        },
        error: {},
        details: {
          'self-http': {
            status: 'up',
          },
          'main-service-http': {
            status: 'up',
          },
          'main-service-tcp': {
            status: 'up',
          },
          'user-service-http': {
            status: 'up',
          },
          'user-service-tcp': {
            status: 'up',
          },
        },
      })
    })
  })
})
