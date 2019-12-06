import * as assert from "assert";
import { Logger } from '../src/index';
import * as Koa from "koa";
import * as supertest from 'supertest';
import { getLogger } from 'log4js';

// types
describe('koa-ts-logger', () => {
  const logger = new Logger();
  let app: any;
  let server: any;

  beforeEach(async () => {
    app = new Koa();
    app.on('error', () => {}); // suppress errors
  });

  afterEach(async () => {
    if (server) {
      server.close();
    }

    app = null;
    server = null;
  });

  const request = () => {
    if (!server) {
      server = app.listen(3000);
    }

    return supertest(server);
  };

  it('create a http logger', async () => {
    app.use(logger.httpLoggerMiddleware);
    app.use((ctx: Koa.Context) => {
      assert.ok(true);
      ctx.body = '';
    });

    await request().get('/').expect(200);
  });

  it('get logger middlewares', async () => {
    app.use(getLogger);
    app.use((ctx: Koa.Context) => {
      ctx.log.info('Got info');
      ctx.log.warn('Got warn');
      ctx.log.error('Got error');
      ctx.log.debug('Got debug');
      ctx.log.console('Got console');
      ctx.logger('Got logger');
      ctx.body = 'Hello world';
    });

    await request().get('/').expect(200);

  });
  
});
