import Koa from 'koa';
import Pug from 'koa-pug';

export function configureViews(app: Koa, viewPath: string | undefined): void {
  new Pug({
    viewPath,
    app,
  });
}
