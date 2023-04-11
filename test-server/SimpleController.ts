import { Controller, Get } from '../src';
import { BaseController } from './BaseController';

@Controller({ path: '/api/' })
export class SimpleController extends BaseController {

  @Get({ url: '/my-test/:id' })
  public test(id: string) {
    return { test: id };
  }

}