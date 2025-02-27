import { ProjectionType, Types } from 'mongoose'

import { UserSchema } from '../../../schema'

export class GetUserPayload {
  constructor(
    public readonly user_id: Types.ObjectId,
    public readonly projection: ProjectionType<UserSchema.User> = { password: 0 },
  ) {}
}
