import { ApiProperty } from '@nestjs/swagger'

export class GetServiceInfoResponse {
  @ApiProperty({ example: 'main-api', description: 'The name of the service' })
  name: string

  @ApiProperty({ example: '0.0.0', description: 'The version of the service' })
  version: string

  @ApiProperty({
    example: 'development',
    description: 'The environment of the service',
    enum: ['development', 'production', 'testing'],
  })
  environment_name: string

  @ApiProperty({
    example: false,
    description: 'The state of the production functionality of the service',
  })
  prod_features_enabled: boolean

  @ApiProperty({
    example: 'expense-tracker service is running perfectly!',
    description: 'The message of the service',
  })
  message: string
}
