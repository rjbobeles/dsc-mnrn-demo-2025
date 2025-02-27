import { HttpModule } from '@nestjs/axios'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { HttpHealthIndicator, MicroserviceHealthIndicator, TerminusModule } from '@nestjs/terminus'
import { Test } from '@nestjs/testing'

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

describe('[Service] Service Test', () => {
  let service: ServiceService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [generalConfig] }), TerminusModule, HttpModule],
      providers: [
        ConfigService,
        ServiceService,
        {
          provide: HttpHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({
              'self-http': { status: 'up' },
              'main-service-http': { status: 'up' },
              'user-service-http': { status: 'up' },
            }),
          },
        },
        {
          provide: MicroserviceHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({
              'main-service-tcp': { status: 'up' },
              'user-service-tcp': { status: 'up' },
            }),
          },
        },
      ],
    }).compile()

    service = app.get<ServiceService>(ServiceService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getInfo', () => {
    it('should return api information', () => {
      expect(service.getInfo()).toEqual({
        name: 'gateway',
        environment_name: 'Development',
        prod_features_enabled: true,
        version: '0.0.0',
        message: `gateway service is running perfectly!`,
      })
    })
  })

  describe('getHealth', () => {
    it('should resolve service health', async () => {
      expect(await service.getHealth()).toEqual({
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
