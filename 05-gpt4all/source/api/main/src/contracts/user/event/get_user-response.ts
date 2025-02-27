import { UserSchema } from '../../../schema'

export class GetUserResponse {
  user: UserSchema.User | null

  constructor(data?: { user: UserSchema.User | null }) {
    this.user = data?.user || null
  }
}
