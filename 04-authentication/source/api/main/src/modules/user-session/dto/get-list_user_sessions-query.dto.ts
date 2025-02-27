import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsIn, IsInt, IsOptional, Max, Min, ValidateIf } from 'class-validator'

export class GetListUserSessionsQueryDto {
  @ApiPropertyOptional({
    description: 'Number of records to skip',
    type: Number,
    minimum: 0,
    example: 0,
  })
  @ValidateIf((o) => o.limit !== undefined)
  @IsInt({ message: 'Skip needs to be an integer' })
  @Min(0, { message: 'Skip must be at least 0' })
  @Transform(({ value }) => Number(value))
  skip?: number

  @ApiPropertyOptional({
    description: 'Number of records to return',
    type: Number,
    minimum: 1,
    maximum: 50,
    example: 10,
  })
  @ValidateIf((o) => o.skip !== undefined)
  @IsInt({ message: 'Limit needs to be an integer between 1 and 50' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit must be at most 50' })
  @Transform(({ value }) => Number(value))
  limit?: number

  @ApiPropertyOptional({
    description: 'Filter what sessions will be returned',
    enum: ['active', 'expired'],
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsIn(['active', 'expired'], { each: true })
  status?: ['expired' | 'active']
}
