import { FastifyCorsOptions } from '@fastify/cors'

const getCorsOrigin = () => {
  const defaultOrigins = ['http://localhost:4200']

  if (!process.env.CORS_ORIGIN) {
    return defaultOrigins
  }

  const configuredOrigins = process.env.CORS_ORIGIN.trim().split(/\s+/)
  return configuredOrigins.length === 1 ? configuredOrigins[0] : configuredOrigins
}

export default (): { cors: FastifyCorsOptions } => ({
  cors: {
    origin: getCorsOrigin(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'device_id'],
    exposedHeaders: [],
    credentials: true,
    maxAge: 86400,
    preflightContinue: true,
    optionsSuccessStatus: 204,
  },
})
