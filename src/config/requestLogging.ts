import Koa from 'koa';
import { createLogger } from '../logging';

const logger = createLogger('Requests');

export function configureLogging(app: Koa): void {
  app.use(async (ctx, next) => {
    const startedAt = Date.now();
    try {
      const result = await next();
      const timeTaken = Date.now() - startedAt;
      logger.info(`[${ctx.method}] ${ctx.url} ${timeTaken}`);
      return result;
    } catch (error) {
      const timeTaken = Date.now() - startedAt;
      logger.error(`[${ctx.method}] ${ctx.url} ${timeTaken}`);
      throw error;
    }
  }
  );
}
