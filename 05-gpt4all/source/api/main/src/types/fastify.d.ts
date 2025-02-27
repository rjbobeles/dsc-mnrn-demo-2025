import 'fastify'

import { RequestUserData } from '../interface/RequestUserData'

declare module 'fastify' {
  interface FastifyRequest {
    user?: RequestUserData
  }
}
