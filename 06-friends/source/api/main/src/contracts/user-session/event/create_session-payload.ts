import { Types } from 'mongoose'

import { UserSessionSchema } from '../../../schema'

export class CreateSessionPayload {
  constructor(
    public readonly device_id: string,
    public readonly ip_address: string,
    public readonly user_id: Types.ObjectId,
    public readonly user_agent: UserSessionSchema.UserAgentData,
  ) {}
}
