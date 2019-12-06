
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
  filePath: string;
  filename: IFileName;
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
    const defaultConfig = {
      filePath: "./logs",
      filename: {
        default: "default-log",
        debug: "debug-log",
        info: "info-log",
        warn: "warn-log",
        error: "error-log"
      }
    }
    // default config
    this.setLogger(config || defaultConfig);
    this.logger = getLogger("dateFile"); // common log
    this.debugLogger = getLogger("debug"); // debug log
    this.infoLogger = getLogger("info"); // info log
    this.warnLogger = getLogger("warn"); // warn log
    this.errorLogger = getLogger("error"); // error log
    this.consoleLogger = getLogger("console"); // console log
  }
  // default six loggers
  public setLogger(options: IConfig) {

    const { filename, filePath } = options;
    if(filePath) {
      this.logsDir = path.parse(filePath).dir;
    } else {
      this.logsDir = "./logs"
    }
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir);
    }

    const data: any = {
      appenders: {
        console: { type: "console" },
        dateFile: { 
          type: "dateFile", 
          filename: filePath + "/" + filename.default, 
          pattern: "-yyyy-MM-dd" 
        },
        info: { 
          type: "logLevelFilter",
          level: "info",
          filename: filePath + "/" + filename.info,
          pattern: "-yyyy-MM-dd",
          appender: "info"
        },        
        debug: { 
          type: "logLevelFilter",
          level: "debug",
          filename: filePath + "/" + filename.debug,
          pattern: "-yyyy-MM-dd",
          appender: "debug"
        },
        error: { 
          type: "logLevelFilter",
          level: "error",
          filename: filePath + "/" + filename.error,
          pattern: "-yyyy-MM-dd",
          appender: "error"
        },
        warn: { 
          type: "logLevelFilter",
          level: "warn",
          filename: filename.warn, 
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
  public httpLoggerMiddleware = async (ctx: Context, next: () => Promise<void>) => {
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
  public getLogger =  async  (ctx: Context, next: () => Promise<void>) => {
    ctx.log.error = this.errorLogger || undefined;
    ctx.logger = this.logger || undefined;
    ctx.log.console = this.consoleLogger || undefined;
    ctx.console = this.consoleLogger || undefined;
    ctx.log.warn = this.warnLogger || undefined;
    ctx.log.debug = this.debugLogger || undefined;
    ctx.log.info = this.infoLogger || undefined;
    await next();
  }
}
