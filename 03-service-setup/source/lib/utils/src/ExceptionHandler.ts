import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { FastifyReply } from 'fastify'
import { throwError } from 'rxjs'

import { ErrorCodes } from './ErrorCodes'
import { HttpException as CustomHttpException, RpcException as CustomRpcException, ValidationException } from './exception'

@Catch()
export class ExceptionHandler implements ExceptionFilter {
  private readonly httpStatusCodes: { [key: number]: string } = {
    [HttpStatus.CONTINUE]: 'Continue',
    [HttpStatus.SWITCHING_PROTOCOLS]: 'Switching Protocols',
    [HttpStatus.PROCESSING]: 'Processing',
    [HttpStatus.EARLYHINTS]: 'Early Hints',
    [HttpStatus.OK]: 'OK',
    [HttpStatus.CREATED]: 'Created',
    [HttpStatus.ACCEPTED]: 'Accepted',
    [HttpStatus.NON_AUTHORITATIVE_INFORMATION]: 'Non-Authoritative Information',
    [HttpStatus.NO_CONTENT]: 'No Content',
    [HttpStatus.RESET_CONTENT]: 'Reset Content',
    [HttpStatus.PARTIAL_CONTENT]: 'Partial Content',
    [HttpStatus.AMBIGUOUS]: 'Ambiguous',
    [HttpStatus.MOVED_PERMANENTLY]: 'Moved Permanently',
    [HttpStatus.FOUND]: 'Found',
    [HttpStatus.SEE_OTHER]: 'See Other',
    [HttpStatus.NOT_MODIFIED]: 'Not Modified',
    [HttpStatus.TEMPORARY_REDIRECT]: 'Temporary Redirect',
    [HttpStatus.PERMANENT_REDIRECT]: 'Permanent Redirect',
    [HttpStatus.BAD_REQUEST]: 'Bad Request',
    [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
    [HttpStatus.PAYMENT_REQUIRED]: 'Payment Required',
    [HttpStatus.FORBIDDEN]: 'Forbidden',
    [HttpStatus.NOT_FOUND]: 'Not Found',
    [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
    [HttpStatus.NOT_ACCEPTABLE]: 'Not Acceptable',
    [HttpStatus.PROXY_AUTHENTICATION_REQUIRED]: 'Proxy Authentication Required',
    [HttpStatus.REQUEST_TIMEOUT]: 'Request Timeout',
    [HttpStatus.CONFLICT]: 'Conflict',
    [HttpStatus.GONE]: 'Gone',
    [HttpStatus.LENGTH_REQUIRED]: 'Length Required',
    [HttpStatus.PRECONDITION_FAILED]: 'Precondition Failed',
    [HttpStatus.PAYLOAD_TOO_LARGE]: 'Payload Too Large',
    [HttpStatus.URI_TOO_LONG]: 'URI Too Long',
    [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type',
    [HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE]: 'Requested Range Not Satisfiable',
    [HttpStatus.EXPECTATION_FAILED]: 'Expectation Failed',
    [HttpStatus.I_AM_A_TEAPOT]: 'I Am a Teapot',
    [HttpStatus.MISDIRECTED]: 'Misdirected Request',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
    [HttpStatus.FAILED_DEPENDENCY]: 'Failed Dependency',
    [HttpStatus.PRECONDITION_REQUIRED]: 'Precondition Required',
    [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [HttpStatus.NOT_IMPLEMENTED]: 'Not Implemented',
    [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
    [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    [HttpStatus.GATEWAY_TIMEOUT]: 'Gateway Timeout',
    [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: 'HTTP Version Not Supported',
  }

  catch(exception: ValidationException | HttpException | RpcException | Error, host: ArgumentsHost) {
    const hostType = host.getType()

    let errorStatus = 500
    let errorResponse: {
      status_code: number
      status: string
      timestamp: number
      message?: string | { message: string; error: string; status_code: number }
      error_code?: string
      errors?: never[]
    } = { status_code: errorStatus, status: this.httpStatusCodes[errorStatus], timestamp: Date.now() }

    if (hostType === 'http') {
      const ctx = host.switchToHttp()
      const request = ctx.getRequest<Request>()
      const response = ctx.getResponse<FastifyReply>()

      if (exception instanceof HttpException || exception instanceof CustomHttpException) {
        const exceptionResponse = exception.getResponse()

        if (request.url === '/health') {
          response.status(exception.getStatus()).send(exceptionResponse)
        }

        if (exception instanceof CustomHttpException) {
          errorResponse = {
            status_code: exception.getStatus(),
            status: this.httpStatusCodes[exception.getStatus()],
            timestamp: Date.now(),
            message: exception.message,
            error_code: exception.getErrorCode(),
            errors: exception.getErrors(),
          }
        } else {
          errorResponse = {
            status_code: exception.getStatus(),
            status: this.httpStatusCodes[exception.getStatus()],
            timestamp: Date.now(),
            message: (exceptionResponse as { message: string }).message || (exceptionResponse as string) || exception.message,
          }
        }
        errorStatus = exception.getStatus()
      } else if (exception instanceof CustomRpcException) {
        errorStatus = exception.getStatus() || 500
        errorResponse = {
          status_code: exception.getStatus() || 500,
          status: this.httpStatusCodes[exception.getStatus() || 500],
          timestamp: Date.now(),
          message: exception.message,
          error_code: exception.getErrorCode(),
          errors: exception.getErrors(),
        }
      } else if (exception instanceof ValidationException) {
        errorStatus = HttpStatus.BAD_REQUEST
        errorResponse = {
          status_code: HttpStatus.BAD_REQUEST,
          status: this.httpStatusCodes[HttpStatus.BAD_REQUEST],
          timestamp: Date.now(),
          message: exception.message,
          error_code: ErrorCodes.VALIDATION_ERROR,
          errors: exception.getValidationErrors() as never,
        }
      } else errorResponse.message = exception.message

      return response.status(errorStatus).send(errorResponse)
    } else if (hostType === 'rpc') {
      let error: Error

      if (exception instanceof CustomRpcException) error = exception
      else if (exception instanceof HttpException) error = new CustomRpcException(ErrorCodes.UNKNOWN_ERROR, exception.message, exception.getStatus())
      else if (exception instanceof CustomHttpException)
        error = new CustomRpcException(exception.getErrorCode(), exception.message, exception.getStatus(), exception.getErrors())
      else if (exception instanceof ValidationException)
        error = new CustomRpcException(ErrorCodes.VALIDATION_ERROR, exception.message, HttpStatus.BAD_REQUEST, exception.getValidationErrors())
      else error = new CustomRpcException(ErrorCodes.UNKNOWN_ERROR, exception.message, HttpStatus.INTERNAL_SERVER_ERROR)

      return throwError(() => error)
    } else throw exception
  }
}
