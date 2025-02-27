import { UserSessionSchema } from '../../../schema'
import { Tokens } from '../../common'

export class CreateSessionResponse {
  session?: UserSessionSchema.UserSession | null

  tokens?: Tokens | null
}
