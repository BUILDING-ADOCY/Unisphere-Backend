// src/common/filters/http-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx   = host.switchToHttp();
      const resp  = ctx.getResponse<Response>();
      const req   = ctx.getRequest<Request>();
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const message =
        exception instanceof HttpException
          ? (exception.getResponse() as any).message || exception.message
          : 'Internal server error';
  
      resp.status(status).json({
        statusCode: status,
        timestamp:  new Date().toISOString(),
        path:       req.url,
        message,
      });
    }
  }
  