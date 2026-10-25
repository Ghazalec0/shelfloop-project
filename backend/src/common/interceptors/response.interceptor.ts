import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WrappedResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<WrappedResponse<T>> {
    return next.handle().pipe(
      map((result) => {
        if (result && typeof result === 'object' && 'data' in result) {
          const { data, total, page, lastPage, ...rest } = result as any;

          const isPaginated = total !== undefined || page !== undefined;

          if (isPaginated) {
            return {
              success: true,
              data,
              meta: {
                total,
                page,
                lastPage,
                ...rest,
              },
              timestamp: new Date().toISOString(),
            };
          }
        }

        return {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}