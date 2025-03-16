import { S3ServiceException } from '@aws-sdk/client-s3';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';

    // Log the full stack trace
    this.logger.error(exception);

    // Handle NestJS-specific HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        const typedResponse = responseBody as { message?: string };
        message = typedResponse.message ?? JSON.stringify(responseBody);
      }
    } else if (
      exception instanceof S3ServiceException &&
      exception.$metadata?.httpStatusCode === 409
    ) {
      status = HttpStatus.CONFLICT;
      message =
        'The requested bucket name is not available. Please select a different name and try again.';
    } else if (exception instanceof S3ServiceException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message || 'An S3-related error occurred';
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
