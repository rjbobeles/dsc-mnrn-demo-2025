import { Types } from 'mongoose'

export class CancelAllSessionsPayload {
  constructor(public readonly user_id: Types.ObjectId) {}
}
