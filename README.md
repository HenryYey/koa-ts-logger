# koa-ts-logger
an npm module

assemble log4js into middleware for Koa by using typescript

which can help you easily create loggers in local

**examples**

```typescript
app.use(async (ctx: Koa.Context, next: () => Promise<void>) => {
  ctx.log.info('Got info');
}
```

## Install 
```shell
npm install koa-ts-logger
```

## usage
```typescript
import { Logger } from 'koa-ts-logger';
import * as Koa from "koa";

const logger = new Logger(); // see config rules
const app = new Koa();

// log http request
app.use(logger.httpLogger);

// get all loggers
app.use(logger.getLoggers);

// use them by ctx.log
app.use(async (ctx: Koa.Context, next: () => Promise<void>) => {
  ctx.log.info('Got info');
  ctx.log.debug('Got debug');
  ctx.log.warn('Got warn');
  ctx.log.console('Got console');
  ctx.log.error('Got error');
  await next();
});
app.listen(3000);
```

## Log file instance
```shell
// default-log file
[2019-12-15T12:46:38.194] [INFO] dateFile - GET 200 / - ::ffff:127.0.0.1 - 10ms

// error-log file
[2019-12-15T12:46:38.191] [ERROR] error - Got error

```
## Config rules
All loggers is dateFile, and be stored in "./logs".

if you want to config by yourself, define an object or import a json file.Json file's configure see [log4js.configure](https://github.com/log4js-node/log4js-node/blob/master/lib/configuration.js).

But only recommended to be modified is "filePath". 

**example**

```typescript
const config = {
  filePath: "./mylogs", // loggers dir
  filename: {
    default: "my-default-log",
    info: "my-info-log"
  }
}

const logger = new Logger(config);
```

### default config
```typescript
defaultConfig = {
  filePath: "./logs", // loggers dir
  filename: {
    default: "default-log",
    debug: "debug-log",
    info: "info-log",
    warn: "warn-log",
    error: "error-log"
  }
}
```
