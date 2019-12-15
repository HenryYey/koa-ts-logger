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
    file?: string;
}
export declare class Logger {
    private logsDir;
    logger: any;
    errorLogger: any;
    consoleLogger: any;
    debugLogger: any;
    warnLogger: any;
    infoLogger: any;
    constructor(config?: IConfig);
    setLogger(options: IConfig): void;
    httpLogger: (ctx: Context, next: () => Promise<void>) => Promise<void>;
    getLoggers: (ctx: Context, next: () => Promise<void>) => Promise<void>;
}
export {};
