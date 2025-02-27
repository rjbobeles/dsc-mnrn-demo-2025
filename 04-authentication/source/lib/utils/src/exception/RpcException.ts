/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpStatus } from '@nestjs/common'

export class RpcException extends Error {
  constructor(
    private readonly error_code: string,
    private readonly response: string,
    private readonly status: HttpStatus | null,
    private readonly errors?: any,
  ) {
    super(response)
  }

  getErrorCode(): string {
    return this.error_code
  }

  getErrors(): any {
    return this.errors
  }

  getResponse(): string {
    return this.response
  }

  getStatus(): HttpStatus | null {
    return this.status
  }
}
