import crypto from 'crypto'

import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import bcrypt from 'bcryptjs'
import mongoose, { Model, Mongoose } from 'mongoose'

import { UserAuthenticationService } from './user-authentication.service'

import { UserSchema } from '../../schema'

describe('[Service] User Authentication', () => {
  let service: UserAuthenticationService
  let dbConnection: Mongoose
  let UserModel: Model<UserSchema.User>

  beforeEach(async () => {
    dbConnection = await mongoose.connect(`${process.env.MONGO_URL}retryWrites=false`, { dbName: crypto.randomUUID() })
    UserModel = dbConnection.connection.model(UserSchema.SCHEMA_NAME, UserSchema.UserSchema)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthenticationService,
        { provide: getModelToken(UserSchema.SCHEMA_NAME), useValue: dbConnection.connection.model(UserSchema.SCHEMA_NAME, UserSchema.UserSchema) },
      ],
    }).compile()

    service = module.get<UserAuthenticationService>(UserAuthenticationService)
  })

  afterEach(async () => {
    await dbConnection.connection.db.dropDatabase()
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('Compute User Agent', () => {
    it('should be able to compute user-agent object', () => {
      const agent = UserAuthenticationService.computeUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
      )

      expect(agent).toMatchObject({
        browser: 'Safari',
        version: '18.1.0',
        os: 'Mac OS X',
        platform: 'Other',
        source: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
      })
    })
  })

  describe('Create User', () => {
    it('should be able to create a user', async () => {
      const user = await service.create_user({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe', password: '12312312' })
      expect(user).not.toBeNull()
    })

    it('should not be able to create an existing user', async () => {
      await UserModel.create({
        email: 'j.doe@gmail.com',
        first_name: 'John',
        last_name: 'Doe',
        password: bcrypt.hashSync('12312312', 10),
      }).then((user) => user.toObject())

      const user = await service.create_user({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe', password: '12312312' })
      expect(user).toBeNull()
    })
  })

  describe('Validate User', () => {
    it('should be able to validate a user', async () => {
      const mockUser = await UserModel.create({
        email: 'j.doe@gmail.com',
        first_name: 'John',
        last_name: 'Doe',
        password: bcrypt.hashSync('12312312', 10),
      }).then((user) => user.toObject())

      const user = await service.validate_user({ email: mockUser.email, password: '12312312' })
      expect(user).not.toBeNull()
      expect(user).toMatchObject(mockUser)
    })

    it('should not be able to validate a non-existent user', async () => {
      const user = await service.validate_user({ email: 'j.doe@gmail.com', password: '12312312' })
      expect(user).toBeNull()
    })

    it('should not be able to validate a user with incorrect password', async () => {
      const mockUser = await UserModel.create({
        email: 'j.doe@gmail.com',
        first_name: 'John',
        last_name: 'Doe',
        password: bcrypt.hashSync('12312312', 10),
      }).then((user) => user.toObject())

      const user = await service.validate_user({ email: mockUser.email, password: '12312312!' })
      expect(user).toBeNull()
    })
  })

  describe('Find User by email', () => {
    it('should be able to find a valid email address in the database', async () => {
      const mockUser = await UserModel.create({ email: 'j.doe@gmail.com', first_name: 'John', last_name: 'Doe' }).then((user) => user.toObject())

      const user = await service.find_user_by_email(mockUser.email)
      expect(user).not.toBeNull()
      expect(mockUser).toMatchObject(mockUser)
    })

    it('should not be able to find an invalid user in the database', async () => {
      const user = await service.find_user_by_email('j.doe@gmail.com')
      expect(user).toBeNull()
    })
  })
})
