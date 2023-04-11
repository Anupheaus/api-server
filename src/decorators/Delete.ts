import { RouteConfig } from './DecoratorModels';
import { Route } from './Route';

interface Props extends Omit<RouteConfig, 'method'> { }

export function Delete(props: Props = {}): MethodDecorator {
  return Route({
    ...props,
    method: 'DELETE',
  });
}