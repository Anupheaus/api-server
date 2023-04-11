import { Controller, View } from '../src';
import { BaseController } from './BaseController';

@Controller({ path: '' })
export class ViewController extends BaseController {

  @View({ url: '' })
  public index() {
    return {};
  }

}