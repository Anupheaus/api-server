import { config } from 'dotenv';
config({ path: '../.env' });
export * from './decorators';
import Koa from 'koa';
import readline from 'readline';
import 'tty';
import { configureSSL } from './config/ssl';
import { createLogger } from './logging';
import { configureErrorHandling } from './config/errorHandling';
import { configureLogging } from './config/requestLogging';
import { AnyObject } from '@anupheaus/common';
import { configureApi } from './config/api';
import { configureViews } from './config/views';
import { configureStaticFiles } from './config/staticFiles';
import { Server } from 'https';

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

const logger = createLogger('Test-Server');

function listenForStartAndStopSignals(start: () => Promise<void>, stop: () => Promise<void>): void {
  let isStarted = true;
  process.stdin.on('keypress', async (str, key) => {
    if (key.ctrl && key.name === 'c') {
      stop();
      process.exit();
    } else if (key.name === 's') {
      if (isStarted) {
        logger.info('Stopping server...');
        await stop();
        logger.info('Server stopped.');
        isStarted = false;
      } else {
        logger.info('Starting server...');
        await start();
        logger.info('Starting started.');
        isStarted = true;
      }
    }
  });
}

let lastEndingEntry: string | undefined;
const autoLog = (startingEntry: string, endingEntry?: string) => {
  logger.info(`${lastEndingEntry != null ? `${lastEndingEntry}, ` : ''}${startingEntry}...`);
  lastEndingEntry = endingEntry;
};

interface Props {
  port: number;
  host: string;
  controllers?: AnyObject[];
  viewPath?: string;
  onUseServer?(server: Server): Promise<void>;
}

export async function startApiServer({ port, host, controllers, viewPath, onUseServer }: Props) {
  autoLog('Starting application', 'Application started');
  const app = new Koa();
  autoLog('configuring SSL', 'SSL configured');
  const [server, startServer, stopServer] = await configureSSL({ app, host, port, logger });
  if (onUseServer) {
    autoLog('using server', 'Finished using server');
    await onUseServer(server);
  }
  autoLog('configuring error handling', 'Error handling configured');
  configureErrorHandling(app);
  autoLog('configuring logging', 'Logging configured');
  configureLogging(app);
  autoLog('configuring api', 'Api configured');
  configureApi(app, controllers);
  autoLog('configuring static routes', 'Static routes configured');
  configureStaticFiles(app);
  autoLog('configuring views', 'Views configured');
  configureViews(app, viewPath);
  autoLog('waiting for requests');
  startServer();
  listenForStartAndStopSignals(startServer, stopServer);
}
