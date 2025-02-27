import crypto from 'crypto'

import { HttpException } from '@dsc-demo/utils/exception'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import mongoose, { Model, Mongoose, Types } from 'mongoose'

import { UserService } from './user.service'

import * as Contracts from '../../contracts'
import { UserSchema } from '../../schema'

describe('[Service] User', () => {
  let service: UserService
  let dbConnection: Mongoose
  let UserModel: Model<UserSchema.User>

  beforeEach(async () => {
    dbConnection = await mongoose.connect(`${process.env.MONGO_URL}retryWrites=false`, { dbName: crypto.randomUUID() })
    UserModel = dbConnection.connection.model(UserSchema.SCHEMA_NAME, UserSchema.UserSchema)

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        UserService,
        { provide: getModelToken(UserSchema.SCHEMA_NAME), useValue: dbConnection.connection.model(UserSchema.SCHEMA_NAME, UserSchema.UserSchema) },
      ],
      exports: [],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  afterEach(async () => {
    await dbConnection.connection.db.dropDatabase()
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('Event Handler', () => {
    describe('Get User', () => {
      it('should be able to get an existing user', async () => {
        const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
        delete mockUser._id
        delete mockUser.password

        const user = await service.handle_event(new Contracts.User.Event.GetUserPayload(mockUser._id))
        expect(user).toBeInstanceOf(Contracts.User.Event.GetUserResponse)
        expect(user.user).not.toBeNull()
        expect(user.user).toMatchObject(mockUser)
      })

      it('should get null when getting a non-existent user', async () => {
        const user = await service.handle_event(new Contracts.User.Event.GetUserPayload(new Types.ObjectId()))
        expect(user).toBeInstanceOf(Contracts.User.Event.GetUserResponse)
        expect(user.user).toBeNull()
      })
    })

    describe('Get User By Email', () => {
      it('should be able to get an existing user', async () => {
        const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
        delete mockUser._id
        delete mockUser.password

        const user = await service.handle_event(new Contracts.User.Event.GetUserByEmailPayload('j.doe@gmail.com'))
        expect(user).toBeInstanceOf(Contracts.User.Event.GetUserResponse)
        expect(user.user).not.toBeNull()
        expect(user.user).toMatchObject(mockUser)
      })

      it('should get null when getting a non-existent user', async () => {
        const user = await service.handle_event(new Contracts.User.Event.GetUserByEmailPayload('j.doe@gmail.com'))
        expect(user).toBeInstanceOf(Contracts.User.Event.GetUserResponse)
        expect(user.user).toBeNull()
      })
    })

    it('should be able to handle unsupported event', async () => {
      await service
        .handle_event({})
        .then(() => fail('Should have failed!'))
        .catch((err: HttpException) => {
          expect(err.message).toEqual('Unsupported event. (User)')
          expect(err).toBeInstanceOf(HttpException)
        })
    })
  })

  describe('Get User', () => {
    it('should be able to get an existing user', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      const user = await service.find_user(mockUser._id)
      expect(user).not.toBeNull()
      expect(user).toMatchObject(mockUser)
    })

    it('should get null when getting a non-existent user', async () => {
      const user = await service.find_user(new Types.ObjectId())
      expect(user).toBeNull()
    })
  })

  describe('Get User By Email', () => {
    it('should be able to get an existing user', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())
      delete mockUser._id
      delete mockUser.password

      const user = await service.find_user_by_email('j.doe@gmail.com')
      expect(user).not.toBeNull()
      expect(user).toMatchObject(mockUser)
    })

    it('should get null when getting a non-existent user', async () => {
      const user = await service.find_user_by_email('j.doe@gmail.com')
      expect(user).toBeNull()
    })
  })

  describe('Update User', () => {
    it('should be able to update password', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())

      const updateAck = await service.update_user(mockUser._id, { password: 'A!123StrongPassN01CanBeat' })
      expect(updateAck).toBeTruthy()

      const user = await UserModel.findById(mockUser._id)
      expect(mockUser.password).not.toEqual(user.password)
    })

    it('should be able to update email_verified status', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())

      const updateAck = await service.update_user(mockUser._id, { email_verified: true })
      expect(updateAck).toBeTruthy()

      const user = await UserModel.findById(mockUser._id)
      expect(user.email_verified).toBeTruthy()
    })

    it('should fail to update if no property is data to update is provided', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())

      const updateAck = await service.update_user(mockUser._id, {})
      expect(updateAck).toBeFalsy()
    })
  })
})
