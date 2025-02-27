import { UserSessionSchema } from '../../../schema'
import { Tokens } from '../../common'

export class RefreshSessionResponse {
  session?: UserSessionSchema.UserSession | null

  tokens?: Tokens | null
}
