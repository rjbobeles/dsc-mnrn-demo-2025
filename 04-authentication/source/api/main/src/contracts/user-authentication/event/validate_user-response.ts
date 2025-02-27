import { UserSchema } from '../../../schema'

export class ValidateUserResponse {
  user?: UserSchema.UserDocument | null
}
