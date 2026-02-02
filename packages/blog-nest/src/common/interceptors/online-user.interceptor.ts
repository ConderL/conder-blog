import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { OnlineService } from '../../modules/online/online.service';

@Injectable()
export class OnlineUserInterceptor implements NestInterceptor {
  private readonly minUpdateIntervalMs = 30_000;
  private readonly lastUpdateAtByToken = new Map<string, number>();

  constructor(private readonly onlineService: OnlineService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const authHeader: unknown = request?.headers?.authorization;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      this.updateLastAccessTimeThrottled(token);
    }

    return next.handle();
  }

  private updateLastAccessTimeThrottled(token: string) {
    const now = Date.now();
    const last = this.lastUpdateAtByToken.get(token) ?? 0;
    if (now - last < this.minUpdateIntervalMs) return;

    this.lastUpdateAtByToken.set(token, now);

    // Prevent unbounded growth in pathological cases.
    if (this.lastUpdateAtByToken.size > 50_000) {
      this.lastUpdateAtByToken.clear();
    }

    void this.onlineService.updateLastAccessTime(token).catch((error) => {
      // Keep errors visible without crashing request handling.
      // eslint-disable-next-line no-console
      console.error('Failed to update last access time', error);
    });
  }
}
