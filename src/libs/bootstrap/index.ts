/*
import commander from 'commander';

type Options = {
  dbUrl: string;
  port: number;
};

commander.program
  .option('--db-url <url>', 'URL for connect to Postgresql server', process.env.DB_URL || 'psql://localhost')
  .option('--port <value>', 'Port to listen by web server', value => Number.parseInt(value))
  .option('--host <host_name>', 'Address to bind web server', process.env.HOST || '127.0.0.1');

commander.program.parse();

const options = commander.program.opts();
console.log(options);

debugger;
*/

import Application from '../../index';

const application = new Application({
  // todo handle process.argv & process.env
  dbUrl: 'postgresql://user:1@localhost:5432/user-db',
  host: '127.0.0.1',
  port: 8080
});

function shutdown(): void {
  console.log('Shutdown application...');
  application
    .destroy()
    .then(() => console.log('Done.'))
    .catch(error => console.error('Unable to shutdown application properly', error));
}

process
  .on('SIGINT', shutdown)
  .on('SIGTERM', shutdown);
