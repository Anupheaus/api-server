import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { AnyFunction, AnyObject, is } from '@anupheaus/common';
import { decoratorConfigs } from '../decorators/DecoratorConfigs';
import { ControllerConfig, RouteConfig, ViewConfig } from '../decorators';
import { createLogger } from '../logging';

const logger = createLogger('Routes');

function getConfigFromController(controller: AnyObject): Required<ControllerConfig> | undefined {
  const configs = decoratorConfigs.getFrom(controller) as Required<ControllerConfig>[];
  return configs[0];
}

function getRoutesFromController(controller: AnyObject) {
  const definitions = Object.entries(Reflect.getAllDefinitions(controller));
  return definitions
    .map(([, definition]) => ({
      config: (decoratorConfigs.getFrom(definition) as Required<RouteConfig | ViewConfig>[])[0],
      handler: (definition.value ?? definition.get)?.bind(controller) as AnyFunction,
    }))
    .filter(({ config }) => config != null);
}

function createHandler(handler: AnyFunction): Router.Middleware {
  return async ctx => {
    const args = Object.values(ctx.params);
    const result = await handler(...args);
    ctx.body = result;
  };
}

function configureRoutes(app: Koa, controllers: AnyObject[]): void {
  const router = new Router({
    sensitive: false,
  });
  controllers.forEach(controller => {
    const controllerConfig = getConfigFromController(controller);
    if (!controllerConfig) return;
    const controllerRouteConfigs = getRoutesFromController(controller);
    controllerRouteConfigs.forEach(({ config, handler }) => {
      const { url } = config;
      const route = '/' + [controllerConfig.path, url]
        .map(part => part.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, ''))
        .filter(is.not.empty)
        .join('/')
        .toLowerCase();
      if ('method' in config) {
        const { method } = config;
        const routerMethod = (router as AnyObject)[method.toLowerCase()] as typeof router.get | typeof router.post;
        logger.info(`Registering route: ${method} ${route}`, { controller: controller.constructor.name, method: handler.name.replace(/^bound\s+/g, '') });
        routerMethod.call(router, route, createHandler(handler));
      } else if ('name' in config) {
        const { name } = config;
        logger.info(`Registering view "${name}" at route: ${route}`, { controller: controller.constructor.name, method: handler.name.replace(/^bound\s+/g, '') });
        router.get(route, async ctx => {
          const args = Object.values(ctx.params);
          const result = await handler(...args);
          return ctx.render(name, result, {}, true);
        });
      }
    });
  });
  app.use(router.routes());
}

export function configureApi(app: Koa, controllers: AnyObject[] | undefined): void {
  app.use(bodyParser());
  if (controllers) configureRoutes(app, controllers);
}