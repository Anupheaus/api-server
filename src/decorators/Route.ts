import { classify } from 'inflection';
import { decoratorConfigs } from './DecoratorConfigs';
import { RouteConfig } from './DecoratorModels';

interface Props extends RouteConfig { }

export function Route(props: Props): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    decoratorConfigs.register(descriptor, {
      ...props,
      url: props.url ?? classify(propertyKey.toString()),
    } satisfies RouteConfig);
    return descriptor;
  };
}
