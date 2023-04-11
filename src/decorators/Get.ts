import { RouteConfig } from './DecoratorModels';
import { Route } from './Route';

interface Props extends Omit<RouteConfig, 'method'> { }

export function Get(props: Props = {}): MethodDecorator {
  return Route({
    ...props,
    method: 'GET',
  });
}