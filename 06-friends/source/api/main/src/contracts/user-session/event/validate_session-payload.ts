import { Types } from 'mongoose'

export class ValidateSessionPayload {
  constructor(
    public readonly user_id: Types.ObjectId,
    public readonly session_id: Types.ObjectId,
    public readonly nonce: string,
  ) {}
}
