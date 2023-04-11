import { AnyObject, Error } from '@anupheaus/common';
import Koa from 'koa';

export function configureErrorHandling(app: Koa): void {
  app.use(async (ctx, next) => {
    try {
      return await next();
    } catch (error) {
      ctx.response.headers['Content-Type'] = 'application/json';
      ctx.response.status = 500;
      let message = 'Unknown error';
      let stack: string[] = [];
      let meta: AnyObject | undefined;
      if (error instanceof Error) {
        ctx.body = error.toJSON();
        return;
      } else if (error instanceof global.Error) {
        message = error.message;
        stack = (error.stack?.split('\n') ?? []).map(line => line.trim());
      } else if (typeof (error) === 'string') {
        message = error;
      }
      ctx.body = {
        message,
        stack,
        meta,
      };
    }
  }
  );
}
