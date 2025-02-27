import { FastifyCorsOptions } from '@fastify/cors'
import { Logger, RequestMethod } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { MainModule } from './main.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(MainModule, new FastifyAdapter())
  const config = app.get(ConfigService)

  app.enableCors(config.get<FastifyCorsOptions>('cors'))
  app.setGlobalPrefix(config.get<string>('api_prefix') || 'api', {
    exclude: [
      { path: 'info', method: RequestMethod.GET },
      { path: 'health', method: RequestMethod.GET },
    ],
  })

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Main API')
    .setDescription('The main API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'apiKey',
        name: 'authorization',
        in: 'header',
        description: 'Your token to access this API',
      },
      'ACCESS_TOKEN',
    )
    .addBearerAuth(
      {
        type: 'apiKey',
        name: 'authorization',
        in: 'header',
        description: 'Your token to access this API',
      },
      'REFRESH_TOKEN',
    )
    .addTag('Service', 'Service related endpoint')
    .addTag('User', 'User related endpoints')
    .addTag('User Authentication', 'Authentication related endpoints')
    .addTag('User Session', 'Session related endpoints')
    .addTag('Friend', 'Friend related endpoints')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document)

  await app.listen(config.get<number>('http_port') || 4000, '0.0.0.0')

  Logger.log(`🚀 Application is running on: http://0.0.0.0:${config.get<number>('http_port')}`, 'Info')
  Logger.log('✅ /docs, /health, /info | 🕹️ API Prefix: /api', 'Info')
}

bootstrap()
