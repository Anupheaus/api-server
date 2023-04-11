import { Logger } from '@anupheaus/common';

const logger = new Logger('API-Server');

export function createLogger(name: string) {
  return logger.createSubLogger(name);
}