import { UserSessionSchema } from '../../../schema'

export class ValidateSessionResponse {
  session?: UserSessionSchema.UserSession | null
}
