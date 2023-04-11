import { AnyObject, is } from '@anupheaus/common';
import { ControllerConfig, RouteConfig, ViewConfig } from './DecoratorModels';

type AnyConfig = ControllerConfig | RouteConfig | ViewConfig;

class DecoratorConfigs {
  constructor() {
    this.#configs = new Map();
  }

  #configs: Map<AnyObject, Required<AnyConfig>>;

  #isDescriptor(target: any): target is PropertyDescriptor {
    return is.plainObject(target) && (is.function(target.value) || is.function(target.get));
  }

  register(target: any, config: Required<AnyConfig>) {
    if (this.#isDescriptor(target)) target = target.value ?? target.get;
    if (!(is.class(target) || is.function(target))) throw new Error(`API decorator has been used on an invalid target: ${target}`);
    this.#configs.set(target, config);
  }

  getFrom(target: any): Required<AnyConfig>[] {
    const configs: Required<AnyConfig>[] = [];
    if (this.#isDescriptor(target)) {
      const config = this.#configs.get(target.value ?? target.get);
      if (config) configs.push(config);
    } else {
      if (is.instance(target)) target = target.constructor;
      if (is.class(target)) {
        let currentTarget = target;
        while (currentTarget != null) {
          const config = this.#configs.get(currentTarget);
          if (config) configs.push(config);
          currentTarget = Reflect.getPrototypeOf(currentTarget);
        }
      }
    }
    return configs;
  }
}

export const decoratorConfigs = new DecoratorConfigs();