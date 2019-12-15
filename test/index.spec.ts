import * as assert from "assert";
import { Logger } from '../src/index';
import * as Koa from "koa";
import * as request from 'supertest'

describe('koa-ts-logger', () => {
  const logger = new Logger();
  let app: any;
  let server: any;

  before(async () => {
    app = new Koa();
    if (!server) {
      server = app.listen(3000);
      console.log("app is listening 3000");
    }

  });

  after(async () => {
    if (server) {
      server.close();
      console.log("app is unlistening 3000");
    }

    app = null;
    server = null;
  });

  it('create logger', async () => {
    app.use(logger.getLoggers);
    app.use(logger.httpLogger);
    app.use(async (ctx: Koa.Context, next: () => Promise<void>) => {
      ctx.body = '';
      await next();
    });

    app.use(async (ctx: Koa.Context, next: () => Promise<void>) => {
      try {
      ctx.log.info('Got info');
      ctx.log.debug('Got debug');
      ctx.log.warn('Got warn');
      ctx.log.console('Got console');
      ctx.log.error('Got error');
      await next();
      assert.ok(true);
      } catch (err) {
        console.error(err);
        assert.ok(false);
      }
    });

    // 模拟http请求
    await request(server)
    .get('/')
    .expect(200)
  });
});
