import crypto from 'crypto'

import { HttpException } from '@dsc-demo/utils/exception'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter'
import { JwtService } from '@nestjs/jwt'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import mongoose, { Model, Mongoose, Types } from 'mongoose'

import { UserSessionService } from './user-session.service'

import jwtConfig from '../../config/jwtConfig'
import * as Contracts from '../../contracts'
import { UserSchema, UserSessionSchema } from '../../schema'

jest.mock('../../config/jwtConfig', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    jwt_public_access_key: Buffer.from(
      'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF4S3ZzcXZqTENLWlhSeFR0cGxBcgpUMWg4WkxXUFNmUUFBSG5ybUorWkJqcTZCYjhDNWlCL3JyVSszSTN6VEYxWUR4OHhlNkoyK0dMWW5ibng1QXJTCjBYR1NmeUx2U1IyUUgwR0NPSFptYlB4cDU1UWpxdTg1OXFVTHgxZUlzUm1pQ2Z2WHdCb3ZFTmd4SjlWdy9hdTUKV3l3REdFVFYrSWJBOUZ3UTJ6Z0p4ZnMyQXJ0OXlVQmFrNnFlZE12d3dETUNmVFVSeWVqVVhHV0Fmd01VNVRrSQpqNS9ubmxkWGJaNm1JQlM1VVVYalVWUUhITHlldEdSV0tHY2c2aWhCbjA4c0h3KzFROUNqUDI0aDg5M0VpZ1ZJCkkyT0ZxaWlXbk9xZkh6YllVbVl6R1ZIUG9oa29WZ3NHV0RXUDJ5eEdYVGJvVXlra0VsMnJiM0NVUUhpSDVLV0IKTVFJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==',
      'base64',
    ).toString('utf-8'),
    jwt_private_access_key: Buffer.from(
      'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcEFJQkFBS0NBUUVBeEt2c3F2akxDS1pYUnhUdHBsQXJUMWg4WkxXUFNmUUFBSG5ybUorWkJqcTZCYjhDCjVpQi9yclUrM0kzelRGMVlEeDh4ZTZKMitHTFluYm54NUFyUzBYR1NmeUx2U1IyUUgwR0NPSFptYlB4cDU1UWoKcXU4NTlxVUx4MWVJc1JtaUNmdlh3Qm92RU5neEo5VncvYXU1V3l3REdFVFYrSWJBOUZ3UTJ6Z0p4ZnMyQXJ0OQp5VUJhazZxZWRNdnd3RE1DZlRVUnllalVYR1dBZndNVTVUa0lqNS9ubmxkWGJaNm1JQlM1VVVYalVWUUhITHllCnRHUldLR2NnNmloQm4wOHNIdysxUTlDalAyNGg4OTNFaWdWSUkyT0ZxaWlXbk9xZkh6YllVbVl6R1ZIUG9oa28KVmdzR1dEV1AyeXhHWFRib1V5a2tFbDJyYjNDVVFIaUg1S1dCTVFJREFRQUJBb0lCQUNHZWpoZHY3aTB0V2pBUgplTXA4VzlyMWNsWTQzeVN5TENub3JZaHFoOXNUd09ib2p4Tk5yT1h0bjdCT0o2Ly9LT1YwM0oyWTJTTitxaTdVCk1YQmRGVXF1VW0rZlJpNUdlbk9OWERoUXJST21WbWc2MzVvQnlQUExwT2JQcE5NNVlZUzVZMWs0WUtGTmc2R2UKai9FZElOTmdBNnRyWVBSWi9MUUk1T3pFZUk4NkpCUFlrTmgrUDRyV3c4Z1Bka2hxTjJpbnBlckc3QVltMEpreAprQXFaVEhQZW84M0ZFeHZaMTFZUCs5VjhwZnM0SlJlWnI1L3IyQUlJWGczN3NxWlBQRTNUaDdRalZmc2NRdjVCClhia2hxaEhoaTJLNWp0cW1jVWk0eVhScEpnS3NHQXp1MUFUS2NINXlRVjlUWHB0L2Q4UTgzczFJWmt5TXJWYUYKbWE0em5jRUNnWUVBK0t1WDFkcUxPOURCYUdRSEtOSnVOQ3VXUEdJRHZDaTJzL0NCelZXN2ZuZGdtL2kreFpJWgorNlhYSDdOUGF1L0V1RUxKMC9CVlFpakJTc1dGeng4ZHhIbms5bHBZZ1Nud1JCVFBiQWNPUmdlVVZlOG5HanNlCmlmMVdZZXhpaDFlMjRTQi91Um9rODFZUGhuYWVlMENXeVpSelBnRnZIR0h2bEZIVVA3SXZQZ2tDZ1lFQXluZjIKSk0vYlFma0p2S09nYXNwejJVcE9pMzcwaTk5QWdMeWRXNnBzaVg4cWlBaGlPNWk1MENrNStCaGpOU0l3NTBBcQpoVU1UdCs5SEk4NURheEx4NDBwb0VOY3FLYWtKQVJLckZOYWRGYm1tYjkzOTlCM2F0VzJ4NDFqL2tpclBGWU1uCjcwRU5kb0VkVmFmK1Bxd21xUzdrL21Zamc2RGU1YXY4bUxxSWMra0NnWUVBaE43Yk1JK24yZncvZTlJRzZVOFgKUjVVS241VVh2ZEJiWDJaaFZTQThJT1VVb0FLWG5PWG1NRXA2Mmh0cmtnNHZwTzA2L3AzcVVJR0tWck9ZUGdXNApXQ1Z4ckJpMk5iMzgvY1BJMlVZajRGTm9kVXBtTUdQcWUzejhUVEtMcXhtNVJDMmpVWHFneDh6eVdyekREY1NEClRZNmV6VURpNTkyRXNGSFJBWC9xTWxFQ2dZQnRicFZOcEVMZno1amhxcGJqNFhUb051OXBHajlXOGwzTXR5VmUKRENrSnovL084cWtWaVNDMVQvTVRFeXRiNXBVRUNIeHk5cVJMd0RwMU1lRGltS1RBc3RDNGVYTkNmU2h1dWdaYQpCdjEwWnBsODBVR1hsaU5GK0hvelpVRU5ZYkgzOEtHL0FTd2pwdm1SK0hERXN3dGFXZ3hQTENsNTFaTmtFNmM5CmJXU2ZNUUtCZ1FDY1JmMGtlVWNwSXF4TkdwT2JiVFJpZTBxMCtrdlJERkdJWVZnMm1EVGhNOUJLWWtjNTNPbTYKRFZYbUFIaFFHNkZNTlRQRFp0eDFkV3pLUW45YzNUcDhkeGdzaTFTRmxDSFVXYVA2SXdiMHRXK0hlUDVqQkVrYgpoZjkydDhOTWpaU1B1eFRtdGFLTTRiM2ZBU3pzd1p4UmdSdTBjTTVEZWlxemY1NnhvM0Z1QVE9PQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=',
      'base64',
    ).toString('utf-8'),
    jwt_public_refresh_key: Buffer.from(
      'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUEzcDVtMW0rdkMyUldmbnJaako3Zwo4M01lQUlGcEc2bXM4dGpuUVduTHVxVmF1VzZhSlpKdzF5NlB0WFd3YmNtRGF3MnAwcHR0aHNJM1lWdWY4cGxkCm83VlhvZTZMWlRDTXc0MGxXNDEvcWRQOUd2bmtFR0swTWprdXJscjdHc1gzQk9mbHJXWTMyb3dRdURaRnRxNTQKNzVQdC9xc1MxbS9zM21vZWk1S3FBbW54SHBiMFcreC8vbjZNZXpsYmxId05odzdYTXQ2T3k0WUxXMUxqSU16UQpSeURNdTZpRlR1c0dZZnZaOUxGN0d0NGt5Ukc1QktjSDJWMFhWS0psUkMzd0c2WTZyaFJvN0dpaTkwMEQzb0twCmJvc0xXWTg5ZDBjL0JzVk1XT0Rqdks3cU5pVDdSZ1JJMlRRcU4rOXZldDF0N0s3TWpxQmRHZzMxT0FzTURKdGkKcndJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==',
      'base64',
    ).toString('utf-8'),
    jwt_private_refresh_key: Buffer.from(
      'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcFFJQkFBS0NBUUVBM3A1bTFtK3ZDMlJXZm5yWmpKN2c4M01lQUlGcEc2bXM4dGpuUVduTHVxVmF1VzZhCkpaSncxeTZQdFhXd2JjbURhdzJwMHB0dGhzSTNZVnVmOHBsZG83VlhvZTZMWlRDTXc0MGxXNDEvcWRQOUd2bmsKRUdLME1qa3VybHI3R3NYM0JPZmxyV1kzMm93UXVEWkZ0cTU0NzVQdC9xc1MxbS9zM21vZWk1S3FBbW54SHBiMApXK3gvL242TWV6bGJsSHdOaHc3WE10Nk95NFlMVzFMaklNelFSeURNdTZpRlR1c0dZZnZaOUxGN0d0NGt5Ukc1CkJLY0gyVjBYVktKbFJDM3dHNlk2cmhSbzdHaWk5MDBEM29LcGJvc0xXWTg5ZDBjL0JzVk1XT0Rqdks3cU5pVDcKUmdSSTJUUXFOKzl2ZXQxdDdLN01qcUJkR2czMU9Bc01ESnRpcndJREFRQUJBb0lCQVFDTmd5dmtERUs5Zng3cwpiN056REZ2NjVhYWdzNkxaRHRiOTJKdkluVFFBaGJSU1E5aUJJY0hSUjZ2YXNlRmhLTVA5ZlVZQ3R3SzhzeUQ1CkpvRmFlZHRvZ1pJZlFjQWlwdVlVT05rU2hiUXRoTEJVUVoyVVBPcEhNc3BWMDBma0VRdWhkcmd0cmRpN2VHWDQKYzZlRkpRdURZQW5kNVdtb0hxWDRESVUyUEJrT1JwSHNsTThZcmVha2xHem9zdzNOMDFPblI4b0xLaitsVEM5aQpRYjBjbXd2NjNxS0ZOSFltSGpxcXZLV3ZHMjYyeVMrZm1iUk5yamFYaU5KcXFOeEUvU0ZjNnk2QTkxN09oUlNKClR3anNGRGFHT0xleVhkS1hYRHIrOWFiMFBlVGlmWWx5M0U3RzlDMkNNdnFPWW5nR0EyMEo3aW5zUkhJOGdjSmIKVEZQY3BGTWhBb0dCQVA4MVoyN2VQMnlxRFJWQ1MyYSt5STVnYVVacXJsRldxT0MzK3hDcE9YbUZ4SHFhOHRaOQpIRDB5MEVoWFFvY0Z5ZHBnWXVOTHVuaGkza2lJclBRb2oxdHY4Tnk0RDJ0VG54RVVtWVB3enE5UFIwYStUTnFSCmduaEswVkFmRVJNUVhSaFBWVzdVVFNoQUNNU0hkMklQdFE4VnBndmJWa3ZFSzRYWUpLWUFROHhMQW9HQkFOOVAKSUZ1TVpMRVgzQUswNHVlVXJpZGNLU0pBb05rWmM4TjhVK3IxZVJWNzIycEVLUVFTVFowT3JnTU5pUjZ3dUZLRAo5V0U5NlI0VzZGZVFDWTRHOEdyZlRHUEN6dGVvaXpka1l6VThUWHkvMyttYTIxRVlLaTI2cFhjVzJwbEt5ODk5CmhpcmR6THJ5R01MUWR6bjZvbGVJQ2dnanAzc01SSVFXeUdSRndueXRBb0dCQUszZVMxWjhNY2V0WHZaeDBQN3gKMFo4MlRlSzhnWUJHd3cwK0t0MGgvVmN1YkRwL1lCd0M1bjlISkNGMDJZMDF3MXgwdUVwVWFIam1HcnhkNlQ3NgpkeGg3ZmlSUmZhZklNNkdtWUNSRXBmdEh6cTZDcmNkbXhQV0JPM01UaDBWdXE0NEpWcElJTDN6UmkyZWhSeE5XCjBpcXh2QXR0NWkvK09ReVp3ZllhVGhaYkFvR0FXRG9sK2FXbFhzYWplVHBJYitDeFVnRzZpcnJvRWY1Wlc0SHkKa2VFOFhyMlp1Z21GL3dMUVFWNDhhQjVmNzQwNHRmbEc2STJTWGY0RS9CdC9ldXJJOENDYlNNcjk5L3l5VEVkUQpYd2NkUWsxNHhRNFcycHBtaDd5M2hTNjFYVjFNMndTb0RxV2xMck5hRHhaWUZNTXVndERQemRsd1lWQStmY1dXCmxPOXU0TjBDZ1lFQXJLRFBPTXl5bEw5Q0hBYUREd1BQdHNmWFRaQk5HSktyZ3EwRU1RSnRWQ21RSm1sTXMybWEKdGxDQW10a044Y3ZMNWZjT1RWSGFGRllmWEdLcVJtcSthQ2tsV2tzUFQ5cVlFblJVK0pGV1FKdjlQKzk4S0dDRgpzVVFUOHJmWXlYdElKMnI0WDN4OUxGQllmbXJiQXZIZzNNMjhjZ0ZuR1QrWTV6dk1lM0dQZ3JJPQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=',
      'base64',
    ).toString('utf-8'),
  }),
}))

describe('[Service] User Session', () => {
  let service: UserSessionService
  let eventEmitter: EventEmitter2
  let dbConnection: Mongoose
  let UserSessionModel: Model<UserSessionSchema.UserSession>
  let UserModel: Model<UserSchema.User>

  beforeEach(async () => {
    dbConnection = await mongoose.connect(`${process.env.MONGO_URL}retryWrites=false`, { dbName: crypto.randomUUID() })
    UserSessionModel = dbConnection.connection.model(UserSessionSchema.SCHEMA_NAME, UserSessionSchema.UserSessionSchema)
    UserModel = dbConnection.connection.model(UserSchema.SCHEMA_NAME, UserSchema.UserSchema)

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [jwtConfig] }), EventEmitterModule.forRoot({ wildcard: true })],
      controllers: [],
      providers: [
        UserSessionService,
        {
          provide: getModelToken(UserSessionSchema.SCHEMA_NAME),
          useValue: dbConnection.connection.model(UserSessionSchema.SCHEMA_NAME, UserSessionSchema.UserSessionSchema),
        },
        {
          provide: 'JWT_ACCESS',
          useFactory: async (configService: ConfigService) => {
            return new JwtService({
              signOptions: { algorithm: 'RS256', expiresIn: '15m' },
              publicKey: configService.get<string>('jwt_public_access_key'),
              privateKey: configService.get<string>('jwt_private_access_key'),
            })
          },
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
      exports: [],
    }).compile()

    service = module.get<UserSessionService>(UserSessionService)
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  afterEach(async () => {
    await dbConnection.connection.db.dropDatabase()
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('Event Handler', () => {
    describe('Create Session', () => {
      it('should be able to create a valid user session', async () => {
        const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
        delete mockUser._id
        delete mockUser.password

        jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: mockUser }] as Contracts.User.Event.GetUserResponse[])

        const mockDeviceId = crypto.randomUUID()
        const mockUserAgent = {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        }

        const session = (await service.handle_event(
          new Contracts.UserSession.Event.CreateSessionPayload(mockDeviceId, '127.0.0.1', mockUser._id, mockUserAgent),
        )) as Contracts.UserSession.Event.CreateSessionResponse

        expect(session).toBeInstanceOf(Contracts.UserSession.Event.CreateSessionResponse)
        expect(session).not.toBeNull()
        expect(session.session).not.toBeNull()
        expect(session.tokens).not.toBeNull()
      })

      it('should not be able to create a user session with invalid user_id', async () => {
        jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: null }] as Contracts.User.Event.GetUserResponse[])

        const mockDeviceId = crypto.randomUUID()
        const mockUserAgent = {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        }

        const session = (await service.handle_event(
          new Contracts.UserSession.Event.CreateSessionPayload(mockDeviceId, '127.0.0.1', new Types.ObjectId(), mockUserAgent),
        )) as Contracts.UserSession.Event.CreateSessionResponse

        expect(session).toBeInstanceOf(Contracts.UserSession.Event.CreateSessionResponse)
        expect(session).not.toBeNull()
        expect(session.session).toBeNull()
        expect(session.tokens).toBeNull()
      })
    })

    describe('Cancel All Sessions', () => {
      it('should be able to cancel all sessions belonging to user_id', async () => {
        const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
        delete mockUser._id
        delete mockUser.password

        jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: mockUser }] as Contracts.User.Event.GetUserResponse[])

        await UserSessionModel.insertMany([
          {
            _userId: mockUser._id,
            device_id: crypto.randomUUID(),
            nonce: crypto.randomBytes(30).toString('hex'),
            ip_address: '127.0.0.1',
            user_agent: {
              browser: 'Other',
              version: '0.0.0',
              os: 'Other',
              platform: 'Other',
              source: 'PostmanRuntime/7.42.0',
            },
            last_used_at: new Date(),
            invalidated_at: null,
            expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            _userId: mockUser._id,
            device_id: crypto.randomUUID(),
            nonce: crypto.randomBytes(30).toString('hex'),
            ip_address: '127.0.0.1',
            user_agent: {
              browser: 'Other',
              version: '0.0.0',
              os: 'Other',
              platform: 'Other',
              source: 'PostmanRuntime/7.42.0',
            },
            last_used_at: new Date(),
            invalidated_at: null,
            expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            _userId: mockUser._id,
            device_id: crypto.randomUUID(),
            nonce: crypto.randomBytes(30).toString('hex'),
            ip_address: '127.0.0.1',
            user_agent: {
              browser: 'Other',
              version: '0.0.0',
              os: 'Other',
              platform: 'Other',
              source: 'PostmanRuntime/7.42.0',
            },
            last_used_at: new Date(),
            invalidated_at: null,
            expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])

        const sessionAck = (await service.handle_event(
          new Contracts.UserSession.Event.CancelAllSessionsPayload(mockUser._id),
        )) as Contracts.UserSession.Event.CancelAllSessionsResponse
        const invalidatedCount = await UserSessionModel.countDocuments({ _userId: mockUser._id, invalidated_at: { $exists: true } })

        expect(sessionAck).toBeInstanceOf(Contracts.UserSession.Event.CancelAllSessionsResponse)
        expect(sessionAck).not.toBeNull()
        expect(sessionAck.success).toBeTruthy()
        expect(invalidatedCount).toEqual(3)
      })

      it('should not be able to cancel all sessions of an invalid user_id', async () => {
        jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: null }] as Contracts.User.Event.GetUserResponse[])

        const sessionAck = (await service.handle_event(
          new Contracts.UserSession.Event.CancelAllSessionsPayload(new Types.ObjectId()),
        )) as Contracts.UserSession.Event.CancelAllSessionsResponse

        expect(sessionAck).toBeInstanceOf(Contracts.UserSession.Event.CancelAllSessionsResponse)
        expect(sessionAck).not.toBeNull()
        expect(sessionAck.success).toBeFalsy()
      })
    })

    describe('Cancel Session', () => {
      it('should be able find a session with a valid session_id and user_id', async () => {
        const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
        delete mockUser._id
        delete mockUser.password

        jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: mockUser }] as Contracts.User.Event.GetUserResponse[])

        const mockSession = await UserSessionModel.create({
          _userId: mockUser._id,
          device_id: crypto.randomUUID(),
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: null,
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        })

        const sessionAck = (await service.handle_event(
          new Contracts.UserSession.Event.CancelSessionPayload(mockUser._id, mockSession._id),
        )) as Contracts.UserSession.Event.CancelSessionResponse

        expect(sessionAck).toBeInstanceOf(Contracts.UserSession.Event.CancelSessionResponse)
        expect(sessionAck).not.toBeNull()
        expect(sessionAck.success).toBeTruthy()
      })

      it('should be able find a session with a valid session_id and invalid user_id', async () => {
        jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: null }] as Contracts.User.Event.GetUserResponse[])

        const mockSession = await UserSessionModel.create({
          _userId: new Types.ObjectId(),
          device_id: crypto.randomUUID(),
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: null,
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        })

        const sessionAck = (await service.handle_event(
          new Contracts.UserSession.Event.CancelSessionPayload(new Types.ObjectId(), mockSession._id),
        )) as Contracts.UserSession.Event.CancelSessionResponse

        expect(sessionAck).toBeInstanceOf(Contracts.UserSession.Event.CancelSessionResponse)
        expect(sessionAck).not.toBeNull()
        expect(sessionAck.success).toBeFalsy()
      })

      it('should be able find a session with a valid user_id and invalid session_id', async () => {
        const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
        delete mockUser._id
        delete mockUser.password

        jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: mockUser }] as Contracts.User.Event.GetUserResponse[])

        const sessionAck = (await service.handle_event(
          new Contracts.UserSession.Event.CancelSessionPayload(mockUser._id, new Types.ObjectId()),
        )) as Contracts.UserSession.Event.CancelSessionResponse

        expect(sessionAck).toBeInstanceOf(Contracts.UserSession.Event.CancelSessionResponse)
        expect(sessionAck).not.toBeNull()
        expect(sessionAck.success).toBeFalsy()
      })
    })

    describe('Refresh Session', () => {
      it('should be able to refresh a valid session', async () => {
        const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
        delete mockUser._id
        delete mockUser.password

        const deviceId = crypto.randomUUID()

        const mockSession = await UserSessionModel.create({
          _userId: mockUser._id,
          device_id: deviceId,
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: null,
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        }).then((user) => user.toObject())

        const session = (await service.handle_event(
          new Contracts.UserSession.Event.RefreshSessionPayload(deviceId, '127.0.0.1', mockUser._id, mockSession._id),
        )) as Contracts.UserSession.Event.RefreshSessionResponse

        expect(session).toBeInstanceOf(Contracts.UserSession.Event.RefreshSessionResponse)
        expect(session).not.toBeNull()
        expect(session.session).not.toBeNull()
        expect(session.tokens).not.toBeNull()
      })

      it('should not be able to refresh an invalid user_id', async () => {
        const deviceId = crypto.randomUUID()

        const mockSession = await UserSessionModel.create({
          _userId: new Types.ObjectId(),
          device_id: deviceId,
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: null,
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        }).then((user) => user.toObject())

        const session = (await service.handle_event(
          new Contracts.UserSession.Event.RefreshSessionPayload(deviceId, '127.0.0.1', new Types.ObjectId(), mockSession._id),
        )) as Contracts.UserSession.Event.RefreshSessionResponse

        expect(session).toBeInstanceOf(Contracts.UserSession.Event.RefreshSessionResponse)
        expect(session).not.toBeNull()
        expect(session.session).toBeNull()
        expect(session.tokens).toBeNull()
      })

      it('should not be able to refresh an invalid device_id', async () => {
        const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
        delete mockUser._id
        delete mockUser.password

        const mockSession = await UserSessionModel.create({
          _userId: mockUser._id,
          device_id: crypto.randomUUID(),
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: null,
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        }).then((user) => user.toObject())

        const session = (await service.handle_event(
          new Contracts.UserSession.Event.RefreshSessionPayload(crypto.randomUUID(), '127.0.0.1', mockUser._id, mockSession._id),
        )) as Contracts.UserSession.Event.RefreshSessionResponse

        expect(session).toBeInstanceOf(Contracts.UserSession.Event.RefreshSessionResponse)
        expect(session).not.toBeNull()
        expect(session.session).toBeNull()
        expect(session.tokens).toBeNull()
      })

      it('should not be able to refresh an invalid session_id', async () => {
        const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
        delete mockUser._id
        delete mockUser.password

        const deviceId = crypto.randomUUID()
        const nonce = crypto.randomBytes(30).toString('hex')

        await UserSessionModel.create({
          _userId: mockUser._id,
          device_id: deviceId,
          nonce,
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: null,
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        }).then((user) => user.toObject())

        const session = (await service.handle_event(
          new Contracts.UserSession.Event.RefreshSessionPayload(deviceId, '127.0.0.1', mockUser._id, new Types.ObjectId()),
        )) as Contracts.UserSession.Event.RefreshSessionResponse

        expect(session).toBeInstanceOf(Contracts.UserSession.Event.RefreshSessionResponse)
        expect(session).not.toBeNull()
        expect(session.session).toBeNull()
        expect(session.tokens).toBeNull()
      })

      it('should not be able to refresh an expired session', async () => {
        const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
        delete mockUser._id
        delete mockUser.password

        const deviceId = crypto.randomUUID()

        const mockSession = await UserSessionModel.create({
          _userId: mockUser._id,
          device_id: deviceId,
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: new Date(),
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        }).then((user) => user.toObject())

        const session = (await service.handle_event(
          new Contracts.UserSession.Event.RefreshSessionPayload(deviceId, '127.0.0.1', mockUser._id, mockSession._id),
        )) as Contracts.UserSession.Event.RefreshSessionResponse

        expect(session).toBeInstanceOf(Contracts.UserSession.Event.RefreshSessionResponse)
        expect(session).not.toBeNull()
        expect(session.session).toBeNull()
        expect(session.tokens).toBeNull()
      })
    })

    it('should be able to handle unsupported event', async () => {
      await service
        .handle_event({})
        .then(() => fail('Should have failed!'))
        .catch((err: HttpException) => {
          expect(err.message).toEqual('Unsupported event. (User Session)')
          expect(err).toBeInstanceOf(HttpException)
        })
    })
  })

  describe('Cancel All Sessions', () => {
    it('should be able to cancel all sessions belonging to user_id', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: mockUser }] as Contracts.User.Event.GetUserResponse[])

      await UserSessionModel.insertMany([
        {
          _userId: mockUser._id,
          device_id: crypto.randomUUID(),
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: null,
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          _userId: mockUser._id,
          device_id: crypto.randomUUID(),
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: null,
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          _userId: mockUser._id,
          device_id: crypto.randomUUID(),
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: null,
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])

      const sessionAck = await service.cancel_all_sessions(mockUser._id)
      expect(sessionAck).toBeTruthy()

      const invalidatedCount = await UserSessionModel.countDocuments({ _userId: mockUser._id, invalidated_at: { $exists: true } })
      expect(invalidatedCount).toEqual(3)
    })

    it('should not be able to cancel all sessions of an invalid user_id', async () => {
      jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: null }] as Contracts.User.Event.GetUserResponse[])

      const sessionAck = await service.cancel_all_sessions(new Types.ObjectId())
      expect(sessionAck).toBeFalsy()
    })
  })

  describe('Cancel Session', () => {
    it('should be able find a session with a valid session_id and user_id', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: mockUser }] as Contracts.User.Event.GetUserResponse[])

      const mockSession = await UserSessionModel.create({
        _userId: mockUser._id,
        device_id: crypto.randomUUID(),
        nonce: crypto.randomBytes(30).toString('hex'),
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      })

      const sessionAck = await service.cancel_session(mockUser._id, mockSession._id)
      expect(sessionAck).toBeTruthy()
    })

    it('should be able find a session with a valid session_id and invalid user_id', async () => {
      jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: null }] as Contracts.User.Event.GetUserResponse[])

      const mockSession = await UserSessionModel.create({
        _userId: new Types.ObjectId(),
        device_id: crypto.randomUUID(),
        nonce: crypto.randomBytes(30).toString('hex'),
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      })

      const sessionAck = await service.cancel_session(new Types.ObjectId(), mockSession._id)
      expect(sessionAck).toBeFalsy()
    })

    it('should be able find a session with a valid user_id and invalid session_id', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: mockUser }] as Contracts.User.Event.GetUserResponse[])

      const sessionAck = await service.cancel_session(mockUser._id, new Types.ObjectId())
      expect(sessionAck).toBeFalsy()
    })
  })

  describe('Create Session', () => {
    it('should be able to create a valid user session', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: mockUser }] as Contracts.User.Event.GetUserResponse[])

      const mockDeviceId = crypto.randomUUID()
      const mockUserAgent = {
        browser: 'Other',
        version: '0.0.0',
        os: 'Other',
        platform: 'Other',
        source: 'PostmanRuntime/7.42.0',
      }

      const session = await service.create_session(mockDeviceId, '127.0.0.1', mockUser._id, mockUserAgent)
      expect(session.session).not.toBeNull()
      expect(session.tokens).not.toBeNull()
    })

    it('should not be able to create a user session with invalid user_id', async () => {
      jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValueOnce([{ user: null }] as Contracts.User.Event.GetUserResponse[])

      const mockDeviceId = crypto.randomUUID()
      const mockUserAgent = {
        browser: 'Other',
        version: '0.0.0',
        os: 'Other',
        platform: 'Other',
        source: 'PostmanRuntime/7.42.0',
      }

      const session = await service.create_session(mockDeviceId, '127.0.0.1', new Types.ObjectId(), mockUserAgent)
      expect(session).toBeNull()
    })
  })

  describe('Find Session', () => {
    it('should be able find a session with a valid session_id and user_id', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      const mockSession = await UserSessionModel.create({
        _userId: mockUser._id,
        device_id: crypto.randomUUID(),
        nonce: crypto.randomBytes(30).toString('hex'),
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      }).then((user) => user.toObject())

      const session = await service.find_session(mockUser._id, mockSession._id)
      expect(session).not.toBeNull()
      expect(session).toMatchObject(mockSession)
    })

    it('should be able find a session with a valid session_id and invalid user_id', async () => {
      const mockSession = await UserSessionModel.create({
        _userId: new Types.ObjectId(),
        device_id: crypto.randomUUID(),
        nonce: crypto.randomBytes(30).toString('hex'),
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      }).then((user) => user.toObject())

      const session = await service.find_session(new Types.ObjectId(), mockSession._id)
      expect(session).toBeNull()
    })

    it('should be able find a session with a valid user_id and invalid session_id', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      const session = await service.find_session(mockUser._id, new Types.ObjectId())
      expect(session).toBeNull()
    })
  })

  describe('List Session', () => {
    it('should be able to list sessions belonging to user_id', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      await UserSessionModel.insertMany([
        {
          _userId: mockUser._id,
          device_id: crypto.randomUUID(),
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: null,
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          _userId: mockUser._id,
          device_id: crypto.randomUUID(),
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: null,
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          _userId: mockUser._id,
          device_id: crypto.randomUUID(),
          nonce: crypto.randomBytes(30).toString('hex'),
          ip_address: '127.0.0.1',
          user_agent: {
            browser: 'Other',
            version: '0.0.0',
            os: 'Other',
            platform: 'Other',
            source: 'PostmanRuntime/7.42.0',
          },
          last_used_at: new Date(),
          invalidated_at: null,
          expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])

      const sessions = await service.list_sessions(mockUser._id, {})
      expect(sessions.count).toEqual(3)
    })
  })

  describe('Refresh Session', () => {
    it('should be able to refresh a valid session', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      const deviceId = crypto.randomUUID()

      const mockSession = await UserSessionModel.create({
        _userId: mockUser._id,
        device_id: deviceId,
        nonce: crypto.randomBytes(30).toString('hex'),
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      }).then((user) => user.toObject())

      const validateResponse = await service.refresh_session(deviceId, '127.0.0.1', mockUser._id, mockSession._id)
      expect(validateResponse).not.toBeNull()
      expect(validateResponse.session).not.toBeNull()
      expect(validateResponse.tokens).not.toBeNull()
    })

    it('should not be able to refresh an invalid user_id', async () => {
      const deviceId = crypto.randomUUID()

      const mockSession = await UserSessionModel.create({
        _userId: new Types.ObjectId(),
        device_id: deviceId,
        nonce: crypto.randomBytes(30).toString('hex'),
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      }).then((user) => user.toObject())

      const validateResponse = await service.refresh_session(deviceId, '127.0.0.1', new Types.ObjectId(), mockSession._id)
      expect(validateResponse).toBeNull()
    })

    it('should not be able to refresh an invalid device_id', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      const mockSession = await UserSessionModel.create({
        _userId: mockUser._id,
        device_id: crypto.randomUUID(),
        nonce: crypto.randomBytes(30).toString('hex'),
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      }).then((user) => user.toObject())

      const validateResponse = await service.refresh_session(crypto.randomUUID(), '127.0.0.1', mockUser._id, mockSession._id)
      expect(validateResponse).toBeNull()
    })

    it('should not be able to refresh an invalid session_id', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      const deviceId = crypto.randomUUID()
      const nonce = crypto.randomBytes(30).toString('hex')

      await UserSessionModel.create({
        _userId: mockUser._id,
        device_id: deviceId,
        nonce,
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      }).then((user) => user.toObject())

      const validateResponse = await service.refresh_session(deviceId, '127.0.0.1', mockUser._id, new Types.ObjectId())
      expect(validateResponse).toBeNull()
    })

    it('should not be able to refresh an expired session', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      const deviceId = crypto.randomUUID()

      const mockSession = await UserSessionModel.create({
        _userId: mockUser._id,
        device_id: deviceId,
        nonce: crypto.randomBytes(30).toString('hex'),
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: new Date(),
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      }).then((user) => user.toObject())

      const validateResponse = await service.refresh_session(deviceId, '127.0.0.1', mockUser._id, mockSession._id)
      expect(validateResponse).toBeNull()
    })
  })

  describe('Sign Tokens', () => {
    it('should be able to generate tokens', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      const mockSession = await UserSessionModel.create({
        _userId: mockUser._id,
        device_id: crypto.randomUUID(),
        nonce: crypto.randomBytes(30).toString('hex'),
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      })

      const tokens = await service.sign_tokens(mockUser._id, mockSession._id)
      expect(tokens).not.toBeNull()
    })

    it('should fail to generate tokens with an invalid user_id', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      const mockSession = await UserSessionModel.create({
        _userId: new Types.ObjectId(),
        device_id: crypto.randomUUID(),
        nonce: crypto.randomBytes(30).toString('hex'),
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      })

      const tokens = await service.sign_tokens(mockUser._id, mockSession._id)
      expect(tokens).toBeNull()
    })

    it('should fail to generate tokens with an invalid session_id', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())

      const tokens = await service.sign_tokens(mockUser._id, new Types.ObjectId())
      expect(tokens).toBeNull()
    })

    it('should fail to generate tokens with an invalid session_id and user_id', async () => {
      const tokens = await service.sign_tokens(new Types.ObjectId(), new Types.ObjectId())
      expect(tokens).toBeNull()
    })
  })

  describe('Validate Session', () => {
    it('shoule be able to validate a valid user_id, session_id and nonce', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      const nonce = crypto.randomBytes(30).toString('hex')

      const mockSession = await UserSessionModel.create({
        _userId: mockUser._id,
        device_id: crypto.randomUUID(),
        nonce,
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      }).then((user) => user.toObject())

      const validateResponse = await service.validate_session(mockUser._id, mockSession._id, nonce)
      expect(validateResponse).not.toBeNull()
      expect(validateResponse.session).toMatchObject(mockSession)
    })

    it('shoule not be able to validate an invalid user_id but with a valid session_id and nonce', async () => {
      const nonce = crypto.randomBytes(30).toString('hex')

      const mockSession = await UserSessionModel.create({
        _userId: new Types.ObjectId(),
        device_id: crypto.randomUUID(),
        nonce,
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      })

      const validateResponse = await service.validate_session(new Types.ObjectId(), mockSession._id, nonce)
      expect(validateResponse).toBeNull()
    })

    it('shoule not be able to validate an invalid session_id and nonce but with a valid user_id', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      const nonce = crypto.randomBytes(30).toString('hex')

      const validateResponse = await service.validate_session(mockUser._id, new Types.ObjectId(), nonce)
      expect(validateResponse).toBeNull()
    })

    it('shoule not be able to validate an invalid nonce but with a valid user_id and session_id', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      const nonce = crypto.randomBytes(30).toString('hex')

      const mockSession = await UserSessionModel.create({
        _userId: mockUser._id,
        device_id: crypto.randomUUID(),
        nonce: crypto.randomBytes(30).toString('hex'),
        ip_address: '127.0.0.1',
        user_agent: {
          browser: 'Other',
          version: '0.0.0',
          os: 'Other',
          platform: 'Other',
          source: 'PostmanRuntime/7.42.0',
        },
        last_used_at: new Date(),
        invalidated_at: null,
        expires_at: new Date((Math.floor(Date.now() / 1000) + 24 * 60 * 60) * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      })

      const validateResponse = await service.validate_session(mockUser._id, mockSession._id, nonce)
      expect(validateResponse).toBeNull()
    })
  })
})
