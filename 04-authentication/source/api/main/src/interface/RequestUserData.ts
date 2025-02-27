import { UserSchema, UserSessionSchema } from '../schema'

export interface RequestUserData {
  data: UserSchema.User
  session: UserSessionSchema.UserSession
}
