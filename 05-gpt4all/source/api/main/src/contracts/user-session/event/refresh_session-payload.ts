import { Types } from 'mongoose'

export class RefreshSessionPayload {
  constructor(
    public readonly device_id: string,
    public readonly ip_address: string,
    public readonly user_id: Types.ObjectId,
    public readonly session_id: Types.ObjectId,
  ) {}
}
