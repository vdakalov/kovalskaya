import http from 'http';
import express from 'express';
import sequelize from 'sequelize';
import umzug from 'umzug';

import migration1 from './migrations/1-create-table-users';

export type Options = {
  dbUrl: string;
  port: number;
  host?: string;
};

export default class Application {

  public static readonly defaultOptions: Options = {
    dbUrl: 'postgresql://localhost:5432',
    port: 8080,
    host: '127.0.0.1'
  };

  private destroyed: boolean = false;

  private readonly options: Options;

  private readonly db: sequelize.Sequelize;

  private readonly express: express.Express;

  private readonly httpServer: http.Server;

  private readonly promises: Promise<unknown>[] = [];

  constructor(options?: Partial<Options>) {
    this.options = Object.assign({}, Application.defaultOptions, options);
    this.db = this.initializeDbConnection();
    this.express = this.initializeExpressApplication();
    this.httpServer = this.initializeHttpServer();

    Promise
      .all(this.promises)
      .then(this.initialize.bind(this))
      .catch(error => {
        console.log('Unable to initialize application', error)
        return this.destroy();
      });
  }

  private initializeExpressApplication(): express.Express {
    return express();
  }

  private initializeDbConnection(): sequelize.Sequelize {
    const instance = new sequelize.Sequelize(this.options.dbUrl);
    this.promises[this.promises.length] = instance
      .authenticate()
      .then(() => {
        console.log('DB connected', { dbUrl: this.options.dbUrl });
        return this.onDbConnected();
      })
      .catch(error => {
        console.log('Unable to connect to database', error);
        return this.destroy();
      });
    return instance;
  }

  private async onDbConnected(): Promise<void> {
    await this.applyMigrations();
  }

  private async applyMigrations(): Promise<void> {
    const umzugInstance = new umzug.Umzug({
      migrations: { glob: 'migrations/*.ts' },
      context: this.db.getQueryInterface(),
      storage: new umzug.SequelizeStorage({ sequelize: this.db }),
      logger: console
    });

    declare global {
      type UmzugMigration = typeof umzugInstance._types.migration;
    }

    await umzugInstance.up();
  }

  private initializeHttpServer(): http.Server {
    return new http.Server(this.express)
      .on('listening', () => console.log('HttpServer: listening at', this.httpServer.address()))
      .on('error', error => {
        console.log('Unable to start http-server', error);
        this.destroy();
      })
      .listen(this.options.port, this.options.host);
  }

  private async initialize(): Promise<void> {
    this.db.query(`
      create table if not exists "migrations" (
        created_at timestamptz NOT NULL DEFAULT current_timestamp,
        "name" varchar NOT NULL
      )`)
      .then(result => {
        this.db.query(`insert into "migrations`)
      })
      .catch(error => {
        debugger;
      });


  }

  public async destroy(): Promise<void> {
    if (this.destroyed) {
      return Promise.resolve();
    }
    this.destroyed = true;
    if (this.httpServer.listening) {
      await new Promise<void>((resolve, reject) =>
        this.httpServer.close(error => error ? reject(error) : resolve()));
    }
    await this.db.end();
  }
}