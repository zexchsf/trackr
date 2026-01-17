import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';

export class ApiError extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(message, statusCode);
  }

  static fromError(error: unknown): HttpException {
    if (error instanceof HttpException) {
      return error;
    }

    if (error instanceof Error) {
      return new InternalServerErrorException(error.message);
    }

    return new InternalServerErrorException('An unexpected error occurred');
  }
}
