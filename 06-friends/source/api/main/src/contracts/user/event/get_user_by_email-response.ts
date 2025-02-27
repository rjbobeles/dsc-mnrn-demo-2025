import { UserSchema } from '../../../schema'

export class GetUserByEmailResponse {
  user?: UserSchema.User | null
}
