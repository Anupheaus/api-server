import { classify } from 'inflection';
import { decoratorConfigs } from './DecoratorConfigs';
import { ViewConfig } from './DecoratorModels';

interface Props extends ViewConfig {

}

export function View(props: Props = {}): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    decoratorConfigs.register(descriptor, {
      ...props,
      name: props.name ?? propertyKey.toString(),
      url: props.url ?? classify(propertyKey.toString()),
    } satisfies ViewConfig);
    return descriptor;
  };
}
