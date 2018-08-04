import { InternalServer } from './internal';
import { Repository, NullRepository } from './db';

import { ILogger, ConsoleLogger } from './loggers';
import * as path from 'path';
import * as glob from 'glob';

export class Server {
    private _dir: string;
    private _server: InternalServer;
    private _logger: ILogger;

    public get uploadDir() { return this._server.uploadDir; }
    public set uploadDir(dir) { this._server.uploadDir = dir; }

    constructor(dir?: string, repository?: Repository, logger?: ILogger) {
        this._dir = dir || '';
        this._server = new InternalServer(dir, repository, logger);
        this._logger = logger ? logger : new ConsoleLogger();
    }

    public registerStaticFolders(...folders: string[]) {
        this._server.registerStaticLocations(...folders);
    }

    public async register(context: string | __WebpackModuleApi.RequireContext, dirname?: string) {
        await this.registerModels(context, dirname);
        await this.registerServices(context, dirname);
        await this.registerControllers(context, dirname);
        await this.registerInjectors(context, dirname);
    }

    public async registerControllers(context: string | __WebpackModuleApi.RequireContext, dirname?: string): Promise<void> {
        let items = await this.findItems(context, dirname || this._dir, 'controller');
        for (let i = 0; i < items.length; ++i) {
            let keys = Object.keys(items[i]);
            for (let j = 0; j < keys.length; ++j) {
                this._server.addControllers(items[i][keys[j]]);
            }
        }
    }

    public async registerInjectors(context: string | __WebpackModuleApi.RequireContext, dirname?: string): Promise<void> {
        let items = await this.findItems(context, dirname || this._dir, 'injector');
        for (let i = 0; i < items.length; ++i) {
            let keys = Object.keys(items[i]);
            for (let j = 0; j < keys.length; ++j) {
                this._server.addInjectors(items[i][keys[j]]);
            }
        }
    }

    public async registerModels(context: string | __WebpackModuleApi.RequireContext, dirname?: string) {
        let items = await this.findItems(context, dirname || this._dir, 'model');
        for (let i = 0; i < items.length; ++i) {
            let keys = Object.keys(items[i]);
            for (let j = 0; j < keys.length; ++j) {
                this._server.addModel(items[i][keys[j]]);
            }
        }
    }

    public async registerServices(context: string | __WebpackModuleApi.RequireContext, dirname?: string) {
        let items = await this.findItems(context, dirname || this._dir, 'service');
        for (let i = 0; i < items.length; ++i) {
            let keys = Object.keys(items[i]);
            for (let j = 0; j < keys.length; ++j) {
                this._server.addService(items[i][keys[j]]);
            }
        }
    }

    private findItems(context: string | __WebpackModuleApi.RequireContext, dirname: string, type: string) {
        return new Promise<any[]>((resolve, reject) => {
            if (typeof context === 'string') {
                glob(`${dirname}${path.sep}${context}${path.sep}**${path.sep}*.${type}.js`, (err, files) => {
                    if (err) return reject(err);

                    let items: any[] = [];
                    try {
                        for (let i = 0; i < files.length; ++i) items.push(require(files[i]));
                        resolve(items);
                    } catch (err) {
                        reject(err);
                    }
                });
            } else {
                let items: any[] = [];
                let keys = context.keys();
                for (let i = 0; i < keys.length; ++i) items.push(context(keys[i]));
                resolve(items);
            }
        });
    }

    public start(...args: any[]) {
        this._server.listen.apply(this._server, args);
    }

    public stop() {
        this._server.close();
    }
}