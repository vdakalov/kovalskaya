import main from '../../index';

main({
  dbUrl: 'postgresql://user:1@localhost:5432/user-db',
  host: '127.0.0.1',
  port: 8080
})
  .catch(error => console.log('main: error', error));
