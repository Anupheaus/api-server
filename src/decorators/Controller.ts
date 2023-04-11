import { classify } from 'inflection';
import { decoratorConfigs } from './DecoratorConfigs';
import { ControllerConfig } from './DecoratorModels';

interface Props extends ControllerConfig {
}

export function Controller(props: Props = {}): ClassDecorator {
  return target => {
    decoratorConfigs.register(target, {
      ...props,
      path: props.path ?? classify(target.name),
    } satisfies ControllerConfig);
    return target;
  };
}
