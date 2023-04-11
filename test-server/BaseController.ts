import { Controller, Get, Post } from '../src';

@Controller({ path: '/base/' })
export class BaseController {

  @Get({ url: '/boo' })
  public inheritedRoute() {
    return { boo: 1 };
  }

  @Post({ url: '/something/:id' })
  public test(_id: string): any {
    return 'Howdy!';
  }

}