import * as fs from "fs";
import * as path from "path";
import { configure, getLogger } from "log4js";
import * as Koa from "koa";

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
    if (filePath) {
      this.logsDir = path.resolve(__dirname, filePath);
    } else {
      this.logsDir = path.resolve(__dirname, "./logs");
    }
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir);
    }

    const data: any = {
      appenders: {
        console: { type: "console" },
        dateFile: {
          type: "dateFile",
          filename: this.logsDir + "/" + filename.default,
          pattern: "-yyyy-MM-dd"
        },
        info: {
          type: "dateFile",
          filename: this.logsDir + "/" + filename.info,
          pattern: "-yyyy-MM-dd",
        },
        debug: {
          type: "dateFile",
          filename: this.logsDir + "/" + filename.debug,
          pattern: "-yyyy-MM-dd",
        },
        error: {
          type: "dateFile",
          filename: this.logsDir + "/" + filename.error,
          pattern: "-yyyy-MM-dd",
        },
        warn: {
          type: "dateFile",
          filename: this.logsDir + "/" + filename.warn,
          pattern: "-yyyy-MM-dd",
        }
      },
      categories: {
        default: {
          appenders: ["console", "dateFile"],
          level: "info"
        },
        error: {
          appenders: ["error"],
          level: "error"
        },
        warn: {
          appenders: ["warn"],
          level: "warn"
        },
        info: {
          appenders: ["info"],
          level: "info"
        },
        debug: {
          appenders: ["debug"],
          level: "debug"
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
  public httpLogger = async (ctx: Koa.Context, next: () => Promise<void>) => {
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
  public getLoggers = async (ctx: Koa.Context, next: () => Promise<void>) => {
    ctx.log = {};
    ctx.log.date = (text) => this.logger.info(text);
    ctx.log.console = (text) => this.consoleLogger.info(text);
    ctx.log.error = (text) => this.errorLogger.error(text);
    ctx.log.warn = (text) => this.warnLogger.warn(text);
    ctx.log.debug = (text) => this.debugLogger.debug(text);
    ctx.log.info = (text) => this.infoLogger.info(text);
    await next();
  }
}
