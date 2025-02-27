import { Types } from 'mongoose'

export class CancelSessionPayload {
  constructor(
    public readonly user_id: Types.ObjectId,
    public readonly session_id: Types.ObjectId,
  ) {}
}
