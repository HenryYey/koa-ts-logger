
import * as fs from "fs";
import * as path from "path";
import { configure, getLogger } from "log4js";
import { Context } from "koa";

interface IFileName {
  default?: string;
  debug?: string;
  info?: string;
  warn?: string;
  error?: string;
}

interface IConfig {
  path?: string;
  filename?: IFileName;
  file?: string; // 配置文件
}

export class Logger {
  private logsDir: string;
  logger: any;
  errorLogger: any;
  consoleLogger: any;
  debugLogger: any;
  warnLogger: any;
  infoLogger: any;

  constructor(config?: IConfig) {
    let dir = "./logs";
    if(config && config.path)
      dir = path.parse(config.path).dir;
    this.logsDir =  dir;
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir);
    }
    // default config
    this.setLogger(config);
    this.logger = getLogger("dateFile"); // common log
    this.debugLogger = getLogger("debug"); // debug log
    this.infoLogger = getLogger("info"); // info log
    this.warnLogger = getLogger("warn"); // warn log
    this.errorLogger = getLogger("error"); // error log
    this.consoleLogger = getLogger("console"); // console log
  }
  // default six loggers
  public setLogger(options?: IConfig) {
    const { filename } = options;
    const { default, info, debug, warn, error } = filename;
    const data: any = {
      appenders: {
        console: { type: "console" },
        dateFile: { 
          type: "dateFile", 
          filename: default || "log", 
          pattern: "-yyyy-MM-dd" 
        },
        info: { 
          type: "logLevelFilter",
          level: "info",
          filename: info || "info-log", 
          pattern: "-yyyy-MM-dd",
          appender: "info"
        },        
        debug: { 
          type: "logLevelFilter",
          level: "debug",
          filename: debug || "debug-log", 
          pattern: "-yyyy-MM-dd",
          appender: "debug"
        },
        error: { 
          type: "logLevelFilter",
          level: "error",
          filename: error || "error-log", 
          pattern: "-yyyy-MM-dd",
          appender: "error"
        },
        warn: { 
          type: "logLevelFilter",
          level: "warn",
          filename: warn || "warn-log", 
          pattern: "-yyyy-MM-dd",
          appender: "warn"
        }
      },
      categories: {
        default: {
          appenders: ["console", "dateFile", "error", "info", "debug", "warn"],
          level: "info"
        }
      }
    };

    configure(options.file || data);
  }
  /**
   * koa middleware，http request will be logged
   * @param ctx 
   * @param next 
   * @param type 
   */
  public async httpLoggerMiddleware (ctx: Context, next: () => Promise<void>) {
    const start: any = new Date();
    await next();
    const end: any = new Date();
    const ms: any = end - start;
  
    const remoteAddress = ctx.headers['x-forwarded-for'] || ctx.ip || ctx.ips ||
      (ctx.socket && ctx.socket.remoteAddress);
  
    const logText = `${ctx.method} ${ctx.status} ${ctx.url} - ${remoteAddress} - ${ms}ms`;

    this.logger.info(logText);

  }
  /**
   * koa middleware，bind loggers to ctx
   * @param ctx 
   * @param next 
   * @param type 
   */
  public async getLogger (ctx: Context, next: () => Promise<void>) {
    ctx.log.error = this.errorLogger || undefined;
    ctx.log = this.logger || undefined;
    ctx.log.console = this.consoleLogger || undefined;
    ctx.console = this.consoleLogger || undefined;
    ctx.log.warn = this.warnLogger || undefined;
    ctx.log.debug = this.debugLogger || undefined;
    ctx.log.info = this.infoLogger || undefined;
    await next();
  }
}
