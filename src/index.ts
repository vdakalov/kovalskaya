import http from 'http';
import express from 'express';
import sequelize from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';

import {
  Type as UserBalanceUpdateDto,
  schema as userBalanceValidationUpdateSchema
} from './dto/user-balance-update.dto';

import { init as initUserModel, tableName as userTableName } from './models/user';

export type Options = {
  dbUrl: string;
  port: number;
  host?: string;
};

type Cache = {
  [key: number]: {
    user: Promise<sequelize.Model | null> | sequelize.Model;
    update?: Promise<void> | void;
    error?: {
      code: number;
      message: string;
    };
  }
};

export default async function main(options?: Partial<Options>): Promise<void> {
  // define options
  const { dbUrl, port, host } = Object.assign({}, {
    dbUrl: 'postgresql://localhost:5432',
    port: 8080,
    host: '127.0.0.1'
  }, options);

  // connect to db
  const sequelizeInstance = new sequelize.Sequelize(dbUrl);
  await sequelizeInstance.authenticate();
  const queryInterface = sequelizeInstance.getQueryInterface();

  // apply migrations
  const umzugInstance = new Umzug({
    migrations: { glob: 'src/migrations/*.ts' },
    context: queryInterface,
    storage: new SequelizeStorage({ sequelize: sequelizeInstance }),
    logger: console
  });
  await umzugInstance.up();

  // initialize models
  const UserModel = initUserModel(sequelizeInstance, userTableName);

  // initialize cache
  const cache: Cache = {};

  // initialize express application
  const expressInstance = express();
  expressInstance
    .use(express.json())
    .put<{}, {}, UserBalanceUpdateDto>('/', (req, res) => {
      const { error } = userBalanceValidationUpdateSchema.validate(req.body);
      if (error) {
        res.status(400).send({ error: error.message });
        return;
      }
      if (!cache.hasOwnProperty(req.body.userId)) {
        cache[req.body.userId] = {
          user: UserModel.findOne({ where: { id: req.body.userId } })
        };
      }
      const item = cache[req.body.userId];
      if (item.user instanceof sequelize.Model) {
        const user = item.user;
        if (item.update instanceof Promise) {
          return item.update
            .then(() => item.update = updateUserBalance(res, user, req.body.amount))
            .catch(error => res.status(500).send({ error: error.message }));
        }
      } else if (item.user instanceof Promise) {
        return item.user
          .then(user => item.update = onUserLookupResult(res, req.body.amount, user))
          .catch(error => res.status(500).send({ error: error.message }));
      }
      return item.update = updateUserBalance(res, item.user, req.body.amount);
    });

  // create and run http-server
  const httpServerInstance: http.Server = new http.Server(expressInstance)
    .on('listening', () => console.log('HttpServer: listening at', httpServerInstance.address()))
    .on('error', error => console.log('HttpServer: Unable to start', error))
    .listen(port, host);
}

function onUserLookupResult(res: express.Response, amount: number, user: sequelize.Model | null): void | Promise<void> {
  if (!user) {
    res.status(404).send({ error: 'No user found' });
    return;
  }
  return updateUserBalance(res, user, amount);
}

function updateUserBalance(res: express.Response, user: sequelize.Model, amount: number): void | Promise<void> {
  const balance = user.getDataValue('balance') - amount;
  if (balance >= 0) {
    return user
      .update({ balance })
      .then(() => {
        res.send();
      });
  }
  res.status(400).send({ error: 'User balance not enough' });
}