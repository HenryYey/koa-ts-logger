/**
 * todo
 * 未完成
 */
import * as fs from "fs";
import * as path from "path";
import { configure, getLogger } from 'log4js';

export interface IConfig {
  path?: string;
  filename?: string;
  file?: string; // 配置文件名
}

export class Logger {
  private logsDir: string;
  logger: any;
  errorLogger: any;
  consoleLogger: any;

  constructor(config: IConfig) {
    this.logsDir = path.parse(config.path).dir || "./logs"
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir);
    }
    this.setConfig(config);
    this.logger = getLogger("dateFile");
    this.errorLogger = getLogger("error");
    this.consoleLogger = getLogger("console");
  }

  public setConfig(options?: IConfig) {
    // 默认创建log的配置文件
    const data: any = {
      appenders: {
        console: { type: "console" },
        dateFile: { 
          type: "dateFile", 
          filename: options.filename || "log", 
          pattern: "-yyyy-MM-dd" 
        },
        error: { 
          type: "logLevelFilter",
          level: "error",
          filename: options.filename || "error-log", 
          pattern: "-yyyy-MM-dd",
          appender: "error"
        }
      },
      categories: {
        default: {
          appenders: ["console", "dateFile", "error"],
          level: "info"
        }
      }
    };
    configure(options.file || data);
  }
  /**
   * 封装成koa中间件，请求会经过这个中间件并且打印log
   * @param ctx 
   * @param next 
   * @param type 
   */
  public async loggerMiddleware (ctx: any, next: any, type?: string) {
    const start: any = new Date();
    await next();
    const end: any = new Date();
    const ms: any = end - start;
  
    const remoteAddress = ctx.headers['x-forwarded-for'] || ctx.ip || ctx.ips ||
      (ctx.socket && (ctx.socket.remoteAddress || (ctx.socket.socket && ctx.socket.socket.remoteAddress)));
  
    const logText = `${ctx.method} ${ctx.status} ${ctx.url} - ${remoteAddress} - ${ms}ms`;

    if (type === "error" || type === "err") {
      this.errorLogger.error(logText);
    } else if (type === "console") {
      this.consoleLogger.info(logText);
    } else {
      this.logger.info(logText);
    }
  }
}
