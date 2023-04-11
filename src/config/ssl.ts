import { createServer, Server } from 'https';
import Koa from 'koa';
import { Duplex } from 'stream';
import { Logger } from '@anupheaus/common';
import { Cert, CertOptions } from 'selfsigned-ca';

interface Props {
  app: Koa;
  host: string;
  port: number;
  logger: Logger;
}

const rootCaCert = new Cert('./certs/root-ca');
const serverCert = new Cert('./certs/server');

async function loadRootCertificate(logger: Logger) {
  logger.info('Loading root certificate...');
  await rootCaCert.load();
  if (!await rootCaCert.isInstalled()) {
    logger.info('Installing root certificate...');
    await rootCaCert.install();
    logger.info('Root certificate installed.');
  } else {
    logger.info('Root certificate loaded.');
  }
}

async function createRootCertificate(logger: Logger) {
  logger.info('Creating root certificate...');
  rootCaCert.createRootCa({
    subject: {
      commonName: 'Lintex Software',
      organizationName: 'Lintex Software',
      organizationalUnitName: 'Software Development',
      countryName: 'UK',
    },
  });
  logger.info('Root certificate created, saving...');
  await rootCaCert.save();
  logger.info('Root certificate saved, installing...');
  await rootCaCert.install();
  logger.info('Root certificate installed.');
}

async function createServerCertificate(logger: Logger, host: string) {
  const serverCertOptions: CertOptions = {
    subject: {
      commonName: host,
      organizationName: 'Lintex Software',
      organizationalUnitName: 'Software Development',
      countryName: 'UK',
    },
    extensions: [{
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: host }, // DNS
        { type: 7, ip: '127.0.0.1' }, // IP
      ],
    }],
  };
  logger.info('Creating server certificate...');
  serverCert.create(serverCertOptions, rootCaCert);
  logger.info('Server certificate created, saving...');
  await serverCert.save();
  logger.info('Server certificate saved.');
}

function createCertificate(logger: Logger, host: string) {
  return async () => {
    try {
      await loadRootCertificate(logger);
    } catch (err) {
      logger.error('Failed to load root certificate, creating a new certificate...');
      await createRootCertificate(logger);
    }
    await createServerCertificate(logger, host);
  };
}

export async function configureSSL({ app, host, port, logger }: Props): Promise<[Server, () => Promise<void>, () => Promise<void>]> {

  await serverCert.load()
    .catch(createCertificate(logger, host));

  // const certs = await createCert({ days: 365, selfSigned: true, commonName: host, organization: 'Lintex Software', organizationUnit: 'Software Development', country: 'UK', altNames: [host] });
  const server = createServer({
    key: serverCert.key,
    cert: serverCert.cert,
    ca: serverCert.caCert,
    rejectUnauthorized: false,
    requestCert: false,
  }, app.callback());

  const allConnections = new Set<Duplex>();
  server.on('connection', connection => {
    allConnections.add(connection);
    connection.on('close', () => allConnections.delete(connection));
  });

  const startServer = () => new Promise<void>(resolve => {
    logger.info(`Listening on port ${port}...`);
    server.listen(port, resolve);
  });

  const stopServer = () => new Promise<void>((resolve, reject) => {
    allConnections.forEach(connection => connection.destroy());
    server.close(error => {
      if (error) return reject(error);
      resolve();
    });
  });

  return [server, startServer, stopServer];
}
