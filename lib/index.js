"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const log4js_1 = require("log4js");
class Logger {
    constructor(config) {
        this.httpLogger = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            const start = new Date();
            yield next();
            const end = new Date();
            const ms = end - start;
            const remoteAddress = ctx.headers['x-forwarded-for'] || ctx.ip || ctx.ips ||
                (ctx.socket && ctx.socket.remoteAddress);
            const logText = `${ctx.method} ${ctx.status} ${ctx.url} - ${remoteAddress} - ${ms}ms`;
            this.logger.info(logText);
        });
        this.getLoggers = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            ctx.log = {};
            ctx.log.date = (text) => this.logger.info(text);
            ctx.log.console = (text) => this.consoleLogger.info(text);
            ctx.log.error = (text) => this.errorLogger.error(text);
            ctx.log.warn = (text) => this.warnLogger.warn(text);
            ctx.log.debug = (text) => this.debugLogger.debug(text);
            ctx.log.info = (text) => this.infoLogger.info(text);
            yield next();
        });
        const defaultConfig = {
            filePath: "./logs",
            filename: {
                default: "default-log",
                debug: "debug-log",
                info: "info-log",
                warn: "warn-log",
                error: "error-log"
            }
        };
        this.setLogger(config || defaultConfig);
        this.logger = log4js_1.getLogger("dateFile");
        this.debugLogger = log4js_1.getLogger("debug");
        console.log("befor", this.infoLogger);
        this.infoLogger = log4js_1.getLogger("info");
        this.warnLogger = log4js_1.getLogger("warn");
        this.errorLogger = log4js_1.getLogger("error");
        this.consoleLogger = log4js_1.getLogger("console");
    }
    setLogger(options) {
        const { filename, filePath } = options;
        if (filePath) {
            this.logsDir = path.resolve(__dirname, filePath);
        }
        else {
            this.logsDir = path.resolve(__dirname, "./logs");
        }
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir);
        }
        const data = {
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
        log4js_1.configure(options.file || data);
    }
}
exports.Logger = Logger;
