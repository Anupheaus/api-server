import { startApiServer } from '../src';
import { SimpleController } from './SimpleController';
import { ViewController } from './ViewController';
import path from 'path';

startApiServer({
  port: 3055,
  host: 'localhost',
  controllers: [
    new SimpleController(),
    new ViewController(),
  ],
  viewPath: path.resolve(__dirname, './views'),
});
