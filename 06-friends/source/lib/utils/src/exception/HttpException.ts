/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpStatus, HttpException as NestHttpException } from '@nestjs/common'

export class HttpException extends NestHttpException {
  constructor(
    private readonly error_code: string,
    response: string | Record<string, never>,
    status: HttpStatus,
    private readonly errors?: any,
  ) {
    super(response, status)
  }

  getErrorCode(): string {
    return this.error_code
  }

  getErrors(): any {
    return this.errors
  }
}
